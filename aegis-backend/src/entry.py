import json
import math
import re
import hashlib
from urllib.parse import urlparse
from collections import Counter
from typing import Any

from workers import Response, WorkerEntrypoint, fetch


ALLOWED_ORIGINS = {
    "https://app.chinmayarora.com",
    "https://chinmayarora.com",
}
CORS_HEADERS = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
}
KEYWORD_BOOSTS = {
    "ra": 3.5,
    "aegis": 4.0,
    "audit": 3.0,
    "auditing": 3.0,
    "governance": 2.8,
    "govtech": 2.6,
    "minnesota": 2.5,
    "hennepin": 2.8,
    "segmentation": 2.4,
    "rag": 2.4,
    "compliance": 2.8,
}
EMBED_MODEL_ALIASES = {
    "models/text-embedding-004": "models/gemini-embedding-001",
    "models/text-embedding-001": "models/gemini-embedding-001",
    "text-embedding-004": "models/gemini-embedding-001",
    "text-embedding-001": "models/gemini-embedding-001",
    "gemini-embedding-001": "models/gemini-embedding-001",
}
GENERATE_MODEL_ALIASES = {
    "models/gemini-1.5-flash": "models/gemini-2.5-flash",
    "gemini-1.5-flash": "models/gemini-2.5-flash",
    "models/gemini-2.0-flash": "models/gemini-2.0-flash",
    "gemini-2.0-flash": "models/gemini-2.0-flash",
    "models/gemini-2.5-flash": "models/gemini-2.5-flash",
    "gemini-2.5-flash": "models/gemini-2.5-flash",
}


def build_cors_headers(origin: str | None) -> dict[str, str]:
    headers = dict(CORS_HEADERS)
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
    else:
        headers["Access-Control-Allow-Origin"] = "https://app.chinmayarora.com"
    return headers


def json_response(payload: dict[str, Any], status: int = 200, origin: str | None = None) -> Response:
    headers = build_cors_headers(origin)
    headers["Content-Type"] = "application/json; charset=utf-8"
    return Response(json.dumps(payload), status=status, headers=headers)


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9][a-z0-9\-\+\.]{1,}", text.lower())


def sparse_vector_from_text(text: str) -> dict[str, list[float]]:
    counts = Counter(tokenize(text))
    indices = []
    values = []
    for token, count in counts.items():
        index = int(hashlib.sha1(token.encode("utf-8")).hexdigest()[:8], 16) % 1000003
        weight = 1.0 + math.log1p(count)
        weight *= KEYWORD_BOOSTS.get(token, 1.0)
        indices.append(index)
        values.append(round(weight, 6))
    return {"indices": indices, "values": values}


def normalize_embed_model(model: str | None) -> str:
    if not model:
        return "models/gemini-embedding-001"
    candidate = model.strip()
    if "text-embedding-" in candidate:
        return "models/gemini-embedding-001"
    normalized = EMBED_MODEL_ALIASES.get(candidate, candidate)
    if not normalized.startswith("models/"):
        normalized = f"models/{normalized}"
    return normalized


def normalize_pinecone_host(host: str | None) -> str:
    if not host:
        return ""
    normalized = host.strip().rstrip("/")
    if normalized.startswith("https://"):
        normalized = normalized[len("https://"):]
    elif normalized.startswith("http://"):
        normalized = normalized[len("http://"):]
    return normalized


def normalize_generate_model(model: str | None) -> str:
    if not model:
        return "models/gemini-2.5-flash"
    candidate = model.strip()
    normalized = GENERATE_MODEL_ALIASES.get(candidate, candidate)
    if not normalized.startswith("models/"):
        normalized = f"models/{normalized}"
    return normalized


def parse_embed_dimensions(value: Any) -> int | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    try:
        dimensions = int(text)
    except ValueError:
        return None
    return dimensions if dimensions > 0 else None


def is_sparse_unsupported(body: str) -> bool:
    lowered = body.lower()
    return "does not support sparse values" in lowered or "only indexes that are sparse or using dotproduct are supported" in lowered


def is_gemini_quota_error(message: str) -> bool:
    lowered = (message or "").lower()
    return (
        "gemini embed http 429" in lowered
        or "resource_exhausted" in lowered
        or "quota exceeded" in lowered
        or "embed_content_free_tier_requests" in lowered
    )


async def post_json(url: str, headers: dict[str, str], payload: dict[str, Any], service: str) -> Any:
    try:
        response = await fetch(
            url,
            method="POST",
            headers=headers,
            body=json.dumps(payload),
        )
    except Exception as exc:
        raise ValueError(f"{service} connection error: {exc}") from exc

    if response.status >= 400:
        body = (await response.text()).strip()
        if len(body) > 500:
            body = body[:500]
        raise ValueError(f"{service} HTTP {response.status}: {body or response.status_text}")
    return await response.json()


def build_fallback_pitch(visitor_name: str, company_name: str, job_title: str, research_packet: dict[str, Any]) -> str:
    pitch = (
        f"Hi {visitor_name}, it looks like {company_name} is navigating modernization, governance, and data-operations "
        f"pressure. My work in AI audit, public-sector analytics, and venture design is directly relevant for a {job_title} "
        f"trying to turn fragmented systems into measurable decision support."
    ).strip()
    return trim_to_complete_sentence(pitch, limit=700)


def build_grounded_fallback_pitch(
    visitor_name: str,
    company_name: str,
    job_title: str,
    research_packet: dict[str, Any],
    matches: list[dict[str, Any]],
) -> str:
    top_match = matches[0] if matches else {}
    top_title = top_match.get("title") or "my public-sector AI work"
    top_source = top_match.get("source") or "portfolio"
    summary = top_match.get("summary") or ""
    summary_clause = f" {summary}" if summary else ""
    pitch = (
        f"Hi {visitor_name}, it looks like {company_name} is dealing with modernization and governance pressure. "
        f"My {top_source} work on {top_title} is directly relevant for a {job_title} trying to operationalize safer, "
        f"more measurable AI and digital transformation decisions.{summary_clause}"
    ).strip()
    return trim_to_complete_sentence(pitch, limit=700)


def clean_pitch_text(text: str) -> str:
    cleaned = " ".join((text or "").split()).strip()
    cleaned = cleaned.strip("\"' ")
    return trim_to_complete_sentence(cleaned, limit=700)


def trim_to_complete_sentence(text: str, limit: int = 700) -> str:
    cleaned = " ".join((text or "").split()).strip()
    if len(cleaned) <= limit:
        return cleaned
    truncated = cleaned[:limit].rstrip()
    sentence_end = max(truncated.rfind(". "), truncated.rfind("! "), truncated.rfind("? "))
    if sentence_end > 40:
        return truncated[: sentence_end + 1].strip()
    last_space = truncated.rfind(" ")
    if last_space > 40:
        return truncated[:last_space].strip()
    return truncated


def pitch_is_usable(text: str) -> bool:
    if not text:
        return False
    if len(text) < 60:
        return False
    if text.endswith(("As", "It", "Hi", "Hello", "My")):
        return False
    return len(text.split()) >= 12


def dedupe_matches(matches: list[dict[str, Any]]) -> list[dict[str, Any]]:
    deduped: dict[tuple[str, str], dict[str, Any]] = {}
    for match in matches:
        key = (match.get("title") or "", match.get("url") or "")
        existing = deduped.get(key)
        if existing is None or (match.get("score") or 0) > (existing.get("score") or 0):
            deduped[key] = match
    return sorted(deduped.values(), key=lambda item: item.get("score") or 0, reverse=True)


def debug_enabled(env: Any) -> bool:
    value = getattr(env, "DEBUG_RAG", None)
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def error_payload(message: str, exc: Exception | None = None, env: Any = None) -> dict[str, Any]:
    payload: dict[str, Any] = {"error": message}
    if exc is not None and debug_enabled(env):
        payload["details"] = str(exc)
        payload["exception_type"] = type(exc).__name__
    return payload


class Default(WorkerEntrypoint):
    async def fetch(self, request):
        origin = request.headers.get("Origin")
        if origin and origin not in ALLOWED_ORIGINS:
            return json_response({"error": "Origin not allowed."}, status=403, origin=origin)

        if request.method == "GET":
            path = urlparse(str(request.url)).path
            if path == "/favicon.ico":
                return Response("", status=204, headers=build_cors_headers(origin))
            return json_response(
                {
                    "status": "ok",
                    "service": "aegis-consultative-rag",
                },
                origin=origin,
            )

        if request.method == "OPTIONS":
            return Response("", status=204, headers=build_cors_headers(origin))

        if request.method != "POST":
            return json_response(
                {"error": "Method not allowed. Send a POST request with visitor_name and company_name."},
                status=405,
                origin=origin,
            )

        try:
            body = await request.json()
        except Exception:
            return json_response({"error": "Invalid JSON body."}, status=400, origin=origin)

        visitor_name = (body.get("visitor_name") or "").strip()
        company_name = (body.get("company_name") or "").strip()
        job_title = (body.get("job_title") or "technical leader").strip()

        if not visitor_name or not company_name:
            return json_response(
                {"error": "visitor_name and company_name are required."},
                status=400,
                origin=origin,
            )

        try:
            retrieval_degraded = False
            try:
                research_packet = await self.fetch_company_research(company_name, job_title)
            except Exception as exc:
                raise RuntimeError(f"research_phase failed: {type(exc).__name__}: {exc}") from exc

            try:
                matches = await self.query_portfolio_matches(visitor_name, company_name, job_title, research_packet)
            except Exception as exc:
                if is_gemini_quota_error(str(exc)):
                    retrieval_degraded = True
                    matches = []
                else:
                    raise RuntimeError(f"retrieval_phase failed: {type(exc).__name__}: {exc}") from exc

            if matches:
                try:
                    pitch = await self.generate_pitch(visitor_name, company_name, job_title, research_packet, matches)
                except Exception as exc:
                    raise RuntimeError(f"synthesis_phase failed: {type(exc).__name__}: {exc}") from exc
            else:
                pitch = build_fallback_pitch(visitor_name, company_name, job_title, research_packet)
        except ValueError as exc:
            return json_response(error_payload(str(exc), exc, self.env), status=500, origin=origin)
        except Exception as exc:
            return json_response(error_payload("Failed to build consultative pitch.", exc, self.env), status=500, origin=origin)

        payload = {
            "visitor_name": visitor_name,
            "company_name": company_name,
            "job_title": job_title,
            "mode": research_packet["mode"],
            "research": research_packet["findings"],
            "portfolio_match_count": len(matches),
            "portfolio_matches": matches[:4],
            "pitch": pitch,
        }
        if retrieval_degraded:
            payload["notice"] = "Portfolio retrieval is temporarily rate-limited. Returning a research-based pitch."
        if debug_enabled(self.env):
            payload["retrieval_debug"] = {
                "namespace": self.env.PINECONE_NAMESPACE,
                "index": self.env.PINECONE_INDEX,
                "embed_dimensions": parse_embed_dimensions(getattr(self.env, "GEMINI_EMBED_DIMENSIONS", None)),
                "degraded": retrieval_degraded,
            }
        return json_response(payload, origin=origin)

    async def fetch_company_research(self, company_name: str, job_title: str) -> dict[str, Any]:
        serper_api_key = self.env.SERPER_API_KEY
        if not serper_api_key:
            raise ValueError("Missing SERPER_API_KEY secret.")

        queries = [
            f"{company_name} AI governance digital backlog data platform challenge",
            f"{company_name} compliance automation risk audit transformation",
            f"{company_name} {job_title} priorities data AI modernization",
        ]

        findings: list[dict[str, str]] = []
        for query in queries:
            try:
                payload = await post_json(
                    "https://google.serper.dev/search",
                    {
                        "X-API-KEY": serper_api_key,
                        "Content-Type": "application/json",
                    },
                    {"q": query, "num": 4},
                    "Serper search",
                )
            except Exception:
                continue

            for item in payload.get("organic", [])[:2]:
                snippet = (item.get("snippet") or "").strip()
                if not snippet:
                    continue
                findings.append(
                    {
                        "query": query,
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": snippet,
                    }
                )

        if findings:
            return {"mode": "company_research", "findings": findings[:5]}

        fallback = {
            "query": f"{job_title} solution mapping fallback",
            "title": f"General expert mode for {job_title}",
            "link": "",
            "snippet": (
                f"No verified company-specific research was found. Personalize the pitch for a {job_title} who likely "
                "cares about AI governance, operational analytics, RAG systems, and measurable implementation outcomes."
            ),
        }
        return {"mode": "general_expert", "findings": [fallback]}

    async def query_portfolio_matches(
        self,
        visitor_name: str,
        company_name: str,
        job_title: str,
        research_packet: dict[str, Any],
    ) -> list[dict[str, Any]]:
        pinecone_api_key = self.env.PINECONE_API_KEY
        pinecone_host = normalize_pinecone_host(self.env.PINECONE_HOST)
        pinecone_index_name = self.env.PINECONE_INDEX
        pinecone_namespace = self.env.PINECONE_NAMESPACE
        gemini_api_key = self.env.GEMINI_API_KEY
        embed_model = normalize_embed_model(self.env.GEMINI_EMBED_MODEL)
        embed_dimensions = parse_embed_dimensions(getattr(self.env, "GEMINI_EMBED_DIMENSIONS", None))

        if not pinecone_api_key or not pinecone_host or not pinecone_index_name:
            raise ValueError("Missing PINECONE_API_KEY secret, PINECONE_HOST secret, or PINECONE_INDEX var.")
        if not gemini_api_key:
            raise ValueError("Missing GEMINI_API_KEY secret.")

        findings = research_packet["findings"]
        research_text = "\n".join(
            f"{item['title']}: {item['snippet']}"
            for item in findings
        )
        retrieval_brief = (
            f"Visitor {visitor_name} from {company_name} with role focus {job_title}. "
            f"Company research summary: {research_text}. "
            "Retrieve portfolio projects, lab ventures, and blog insights that solve governance, audit, RAG, "
            "segmentation, public-sector analytics, or AI operations pain points."
        )

        dense_vector = await self.embed_text(retrieval_brief, gemini_api_key, embed_model, embed_dimensions)
        sparse_vector = sparse_vector_from_text(retrieval_brief)

        try:
            results = await post_json(
                f"https://{pinecone_host}/query",
                {
                    "Api-Key": pinecone_api_key,
                    "Content-Type": "application/json",
                    "X-Pinecone-API-Version": "2024-07",
                },
                {
                    "namespace": pinecone_namespace,
                    "vector": dense_vector,
                    "sparseVector": sparse_vector,
                    "topK": 6,
                    "includeMetadata": True,
                },
                "Pinecone query",
            )
        except ValueError as exc:
            if not is_sparse_unsupported(str(exc)):
                raise
            results = await post_json(
                f"https://{pinecone_host}/query",
                {
                    "Api-Key": pinecone_api_key,
                    "Content-Type": "application/json",
                    "X-Pinecone-API-Version": "2024-07",
                },
                {
                    "namespace": pinecone_namespace,
                    "vector": dense_vector,
                    "topK": 6,
                    "includeMetadata": True,
                },
                "Pinecone dense query",
            )

        matches = []
        for match in results.get("matches", []):
            metadata = match.get("metadata") or {}
            matches.append(
                {
                    "id": match.get("id"),
                    "score": match.get("score"),
                    "source": metadata.get("source"),
                    "title": metadata.get("title"),
                    "url": metadata.get("url"),
                    "summary": metadata.get("summary") or metadata.get("description"),
                    "tags": metadata.get("tags", []),
                }
            )
        return dedupe_matches(matches)

    async def generate_pitch(
        self,
        visitor_name: str,
        company_name: str,
        job_title: str,
        research_packet: dict[str, Any],
        matches: list[dict[str, Any]],
    ) -> str:
        gemini_api_key = self.env.GEMINI_API_KEY
        gemini_model = normalize_generate_model(self.env.GEMINI_MODEL)
        if not gemini_api_key or not gemini_model:
            raise ValueError("Missing GEMINI_API_KEY secret or GEMINI_MODEL var.")

        research_mode = research_packet["mode"]
        findings_block = "\n".join(
            f"- {item['title']}: {item['snippet']}"
            for item in research_packet["findings"]
        )
        matches_block = "\n".join(
            f"- [{item.get('source')}] {item.get('title')}: {item.get('summary')} ({item.get('url')})"
            for item in matches[:5]
        )

        prompt = f"""
Act as a Solutions Architect for Chinmay Arora's portfolio.

Visitor: {visitor_name}
Company: {company_name}
Job title context: {job_title}
Research mode: {research_mode}

Research findings:
{findings_block}

Portfolio matches:
{matches_block}

Write a personalized outbound-style pitch under 100 words.
Requirements:
- Explicitly connect the company's likely problem to Chinmay's solution.
- Mention at least one relevant project, one lab venture, or one blog insight when supported by the matches.
- If research mode is general_expert, speak to the visitor's job_title priorities instead of pretending company-specific facts.
- Sound concise, credible, and consultative.
- Return plain text only, as one complete paragraph.
"""

        response = await self.call_gemini_generate(prompt, gemini_api_key, gemini_model)
        cleaned = clean_pitch_text(response)
        if pitch_is_usable(cleaned):
            return cleaned
        return build_grounded_fallback_pitch(visitor_name, company_name, job_title, research_packet, matches)

    async def embed_text(self, text: str, gemini_api_key: str, model: str, dimensions: int | None) -> list[float]:
        model_name = normalize_embed_model(model).replace("models/", "")
        request_payload = {
            "model": f"models/{model_name}",
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_QUERY",
        }
        if dimensions:
            request_payload["outputDimensionality"] = dimensions
        payload = await post_json(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:embedContent",
            {
                "x-goog-api-key": gemini_api_key,
                "Content-Type": "application/json",
            },
            request_payload,
            "Gemini embed",
        )

        values = payload.get("embedding", {}).get("values")
        if not values:
            raise ValueError("Gemini embedding call returned no values.")
        return values

    async def call_gemini_generate(self, prompt: str, gemini_api_key: str, model: str) -> str:
        model_name = normalize_generate_model(model).replace("models/", "")
        payload = await post_json(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent",
            {
                "x-goog-api-key": gemini_api_key,
                "Content-Type": "application/json",
            },
            {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.55,
                    "topP": 0.9,
                    "maxOutputTokens": 180,
                },
            },
            "Gemini generate",
        )

        candidates = payload.get("candidates") or []
        if not candidates:
            raise ValueError("Gemini returned no candidates.")
        parts = candidates[0].get("content", {}).get("parts", [])
        return "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()
