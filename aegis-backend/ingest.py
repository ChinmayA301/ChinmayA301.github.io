import json
import os
import re
import time
from pathlib import Path
from typing import Any

import httpx
import yaml
from pinecone import Pinecone
from pinecone_text.sparse import BM25Encoder


ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = ROOT / "_posts"
DEFAULT_DATA_DIR = ROOT / "data"
SITE_URL = "https://chinmayarora.com"
DEFAULT_EMBED_MODEL = "models/gemini-embedding-001"
SUMMARY_MODEL = "models/gemini-2.5-flash"
CHUNK_WORDS = 50
EMBED_BATCH_SIZE = 20
API_CALL_DELAY_SECONDS = 5
RATE_LIMIT_RETRY_SECONDS = 20
MAX_RETRIES = 4


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def parse_optional_int(value: str | None) -> int | None:
    if value is None:
        return None
    text = value.strip()
    if not text:
        return None
    try:
        parsed = int(text)
    except ValueError:
        return None
    return parsed if parsed > 0 else None


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def words(text: str) -> list[str]:
    return re.findall(r"\S+", text)


def strip_markdown(text: str) -> str:
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.M)
    text = re.sub(r"[>*_~-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_front_matter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    raw_front_matter = parts[1]
    body = parts[2].strip()
    try:
        parsed = yaml.safe_load(raw_front_matter) or {}
        if not isinstance(parsed, dict):
            parsed = {}
    except yaml.YAMLError:
        parsed = {}
    return parsed, body


def chunk_text(text: str, size: int = CHUNK_WORDS) -> list[str]:
    tokens = words(strip_markdown(text))
    if not tokens:
        return []
    return [" ".join(tokens[idx:idx + size]) for idx in range(0, len(tokens), size)]


def summarize_chunk(text: str, word_limit: int = 28) -> str:
    tokens = words(strip_markdown(text))
    if not tokens:
        return ""
    summary = " ".join(tokens[:word_limit]).strip()
    return summary


def embed_batch(
    client: httpx.Client,
    api_key: str,
    model: str,
    items: list[dict[str, str]],
    output_dimensionality: int | None,
) -> list[list[float]]:
    def _request():
        requests = []
        for item in items:
            request_payload = {
                "model": model,
                "content": {"parts": [{"text": item["text"]}]},
                "taskType": "RETRIEVAL_DOCUMENT",
                "title": item["title"],
            }
            if output_dimensionality:
                request_payload["outputDimensionality"] = output_dimensionality
            requests.append(request_payload)
        response = client.post(
            f"https://generativelanguage.googleapis.com/v1beta/{model}:batchEmbedContents",
            headers={
                "x-goog-api-key": api_key,
                "Content-Type": "application/json",
            },
            json={
                "requests": requests,
            },
        )
        response.raise_for_status()
        return response

    response = call_gemini_with_backoff(_request)
    payload = response.json()
    embeddings = payload.get("embeddings") or []
    if len(embeddings) != len(items):
        raise RuntimeError("Gemini batch embedding response count mismatch.")
    vectors = []
    for embedding in embeddings:
        values = embedding.get("values")
        if not values:
            raise RuntimeError("Gemini batch embedding returned no values.")
        vectors.append(values)
    return vectors


def is_rate_limit_error(exc: Exception) -> bool:
    message = str(exc).lower()
    return any(token in message for token in ["429", "rate limit", "resource_exhausted", "too many requests"])


def call_gemini_with_backoff(fn):
    last_error = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            result = fn()
            time.sleep(API_CALL_DELAY_SECONDS)
            return result
        except Exception as exc:
            last_error = exc
            if not is_rate_limit_error(exc) or attempt == MAX_RETRIES:
                raise
            wait_seconds = RATE_LIMIT_RETRY_SECONDS * attempt
            print(f"Gemini rate limit hit. Waiting {wait_seconds}s before retry {attempt + 1}/{MAX_RETRIES}...")
            time.sleep(wait_seconds)
    raise last_error


def summarize_run(client: httpx.Client, api_key: str, index_name: str, namespace: str, documents: list[dict[str, Any]]) -> str:
    counts: dict[str, int] = {}
    for document in documents:
        counts[document["type"]] = counts.get(document["type"], 0) + 1

    summary_prompt = (
        "Summarize this indexing run in under 45 words for a developer console.\n"
        f"Index: {index_name}\n"
        f"Namespace: {namespace}\n"
        f"Document count: {len(documents)}\n"
        f"Type counts: {json.dumps(counts)}"
    )
    model_name = SUMMARY_MODEL.replace("models/", "")
    response = call_gemini_with_backoff(
        lambda: _generate_summary_request(client, api_key, model_name, summary_prompt)
    )
    payload = response.json()
    candidates = payload.get("candidates") or []
    if not candidates:
        raise RuntimeError("Gemini summary returned no candidates.")
    parts = candidates[0].get("content", {}).get("parts", [])
    return "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()


def _generate_summary_request(client: httpx.Client, api_key: str, model_name: str, summary_prompt: str) -> httpx.Response:
    response = client.post(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        json={
            "contents": [{"role": "user", "parts": [{"text": summary_prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 120},
        },
    )
    response.raise_for_status()
    return response


def build_blog_documents() -> list[dict[str, Any]]:
    documents = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        front_matter, body = parse_front_matter(path.read_text(encoding="utf-8"))
        slug = path.stem.split("-", 3)[-1]
        title = front_matter.get("title") or slug.replace("-", " ").title()
        url = front_matter.get("canonical_url") or f"{SITE_URL}/blog/{slug}/"
        date = str(front_matter.get("date", "")).strip()
        description = str(front_matter.get("description", "")).strip()
        summary = str(front_matter.get("summary", "")).strip()
        categories = front_matter.get("categories") or []
        tags = front_matter.get("tags") or []
        if isinstance(categories, str):
            categories = [categories]
        if isinstance(tags, str):
            tags = [tags]
        chunks = chunk_text(
            " ".join(
                [
                    title,
                    date,
                    description,
                    summary,
                    " ".join(categories),
                    " ".join(tags),
                    body,
                ]
            )
        )
        for chunk_index, chunk in enumerate(chunks):
            documents.append(
                {
                    "id": f"blog-{slug}-{chunk_index}",
                    "title": title,
                    "url": url,
                    "type": "blog",
                    "date": date,
                    "tags": tags,
                    "summary": summary or description or summarize_chunk(chunk),
                    "chunk_text": chunk,
                    "fulltext": f"{title}\n{chunk}",
                }
            )
    return documents


def build_lab_documents(lab_path: Path) -> list[dict[str, Any]]:
    payload = json.loads(lab_path.read_text(encoding="utf-8"))
    documents = []
    for item in payload:
        title = item["title"]
        url = item["url"]
        source_text = " ".join(
            [
                title,
                item.get("summary", ""),
                item.get("business_hook", ""),
                " ".join(item.get("tags", [])),
            ]
        )
        chunks = chunk_text(source_text)
        for chunk_index, chunk in enumerate(chunks):
            documents.append(
                {
                    "id": f"lab-{slugify(title)}-{chunk_index}",
                    "title": title,
                    "url": url,
                    "type": "lab",
                    "summary": item.get("summary", "") or item.get("business_hook", "") or summarize_chunk(chunk),
                    "chunk_text": chunk,
                    "fulltext": f"{title}\n{chunk}",
                }
            )
    return documents


def infer_type_from_filename(path: Path) -> str:
    name = path.stem.lower()
    if "lab" in name or "idea" in name:
        return "lab"
    if "project" in name or "report" in name or "coursework" in name:
        return "project"
    if "experience" in name:
        return "experience"
    if "resume" in name:
        return "resume"
    return "data"


def text_from_json_item(item: dict[str, Any]) -> str:
    fragments = []
    priority_keys = [
        "title",
        "summary",
        "description",
        "one_liner",
        "business_hook",
        "motivation",
        "proposed_approach",
        "potential_impact",
        "course",
        "term",
        "role",
        "org",
        "time",
        "subtitle",
        "status",
        "location",
        "ip_note",
    ]
    for key in priority_keys:
        value = item.get(key)
        if isinstance(value, str) and value.strip():
            fragments.append(value.strip())
    for key, value in item.items():
        if key in priority_keys:
            continue
        if isinstance(value, list):
            flattened = []
            for entry in value:
                if isinstance(entry, str):
                    flattened.append(entry.strip())
                elif isinstance(entry, dict):
                    flattened.extend(str(v).strip() for v in entry.values() if str(v).strip())
            if flattened:
                fragments.append(" ".join(flattened))
        elif isinstance(value, dict):
            flattened = [str(v).strip() for v in value.values() if str(v).strip()]
            if flattened:
                fragments.append(" ".join(flattened))
        elif isinstance(value, str) and value.strip():
            fragments.append(value.strip())
    return " ".join(fragment for fragment in fragments if fragment)


def build_data_documents(data_dir: Path) -> list[dict[str, Any]]:
    documents = []
    seen_urls: set[tuple[str, str]] = set()
    for path in sorted(data_dir.glob("*.json")):
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, list):
            continue

        inferred_type = infer_type_from_filename(path)
        for idx, item in enumerate(payload):
            if not isinstance(item, dict):
                continue

            title = item.get("title") or item.get("role") or f"{path.stem}-{idx}"
            url = item.get("url") or item.get("link") or f"{SITE_URL}/{path.stem.replace('_', '-')}/"
            dedupe_key = (title, url)
            if dedupe_key in seen_urls:
                continue
            seen_urls.add(dedupe_key)

            source_text = text_from_json_item(item)
            if not source_text.strip():
                continue

            chunks = chunk_text(source_text)
            if not chunks:
                continue

            for chunk_index, chunk in enumerate(chunks):
                summary = (
                    item.get("summary")
                    or item.get("description")
                    or item.get("business_hook")
                    or item.get("one_liner")
                    or summarize_chunk(chunk)
                )
                documents.append(
                    {
                        "id": f"{path.stem}-{slugify(title)}-{chunk_index}",
                        "title": title,
                        "url": url,
                        "type": inferred_type,
                        "date": str(item.get("date", "")).strip(),
                        "tags": item.get("tags", []),
                        "summary": summary,
                        "chunk_text": chunk,
                        "fulltext": f"{title}\n{chunk}",
                    }
                )
    return documents


def main() -> None:
    load_dotenv(Path(__file__).resolve().parent / ".env")

    gemini_api_key = require_env("GEMINI_API_KEY")
    pinecone_api_key = require_env("PINECONE_API_KEY")
    pinecone_host = require_env("PINECONE_HOST")
    pinecone_index_name = require_env("PINECONE_INDEX")
    pinecone_namespace = os.getenv("PINECONE_NAMESPACE", "portfolio")
    data_dir = Path(os.getenv("DATA_DIR", str(DEFAULT_DATA_DIR))).resolve()
    embed_model = os.getenv("GEMINI_EMBED_MODEL", DEFAULT_EMBED_MODEL)
    embed_dimensions = parse_optional_int(os.getenv("GEMINI_EMBED_DIMENSIONS"))

    documents = build_blog_documents() + build_data_documents(data_dir)
    corpus = [doc["chunk_text"] for doc in documents]
    bm25 = BM25Encoder().fit(corpus)

    vectors = []
    with httpx.Client(timeout=30.0) as gemini_client:
        for start in range(0, len(documents), EMBED_BATCH_SIZE):
            batch_docs = documents[start:start + EMBED_BATCH_SIZE]
            dense_vectors = embed_batch(
                gemini_client,
                gemini_api_key,
                embed_model,
                [{"title": doc["title"], "text": doc["fulltext"]} for doc in batch_docs],
                embed_dimensions,
            )
            for document, dense_vector in zip(batch_docs, dense_vectors):
                sparse_vector = bm25.encode_documents(document["chunk_text"])
                vectors.append(
                    {
                        "id": document["id"],
                        "values": dense_vector,
                        "sparse_values": sparse_vector,
                        "metadata": {
                            "title": document["title"],
                            "url": document["url"],
                            "type": document["type"],
                            "source": document["type"],
                            "date": document.get("date", ""),
                            "tags": document.get("tags", []),
                            "summary": document.get("summary", ""),
                            "chunk_text": document["chunk_text"],
                        },
                    }
                )

        client = Pinecone(api_key=pinecone_api_key)
        index = client.Index(host=pinecone_host)

        batch_size = 50
        for idx in range(0, len(vectors), batch_size):
            index.upsert(vectors=vectors[idx:idx + batch_size], namespace=pinecone_namespace)

        print(
            f"Upserted {len(vectors)} vectors to Pinecone index '{pinecone_index_name}' "
            f"using host '{pinecone_host}' in namespace '{pinecone_namespace}'."
        )
        try:
            print(summarize_run(gemini_client, gemini_api_key, pinecone_index_name, pinecone_namespace, documents))
        except Exception as exc:
            print(f"Run summary skipped: {exc}")


if __name__ == "__main__":
    main()
