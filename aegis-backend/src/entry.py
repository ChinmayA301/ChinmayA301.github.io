from __future__ import annotations

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
APP_SITE_URL = "https://app.chinmayarora.com"
AEGIS_LIVE_URL = "https://aegisai-5wz.pages.dev"
CORS_HEADERS = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
}
KEYWORD_BOOSTS = {
    "analytics": 1.45,
    "automation": 1.35,
    "customer": 1.25,
    "data": 1.35,
    "efficiency": 1.35,
    "growth": 1.25,
    "operations": 1.45,
    "platform": 1.25,
    "product": 1.35,
    "risk": 1.35,
    "strategy": 1.35,
}
SOURCE_WEIGHTS = {
    "project": 0.08,
    "experience": 0.08,
    "skills": 0.06,
    "coursework": 0.055,
    "report": 0.05,
    "blog": 0.04,
    "page": 0.035,
    "resume": 0.035,
    "profile": 0.035,
    "lab": 0.025,
    "manual_context": 0.02,
}
MATCH_STOPWORDS = {
    "about", "after", "also", "and", "are", "been", "being", "build", "built", "company", "could",
    "data", "from", "have", "into", "more", "that", "their", "this", "through", "using", "with", "work",
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
CURATED_CONTEXT_MATCHES = [
    {
        "id": "manual-operations-control-tower",
        "score": 0.7,
        "source": "project",
        "title": "Operations Control Tower",
        "url": "https://github.com/ChinmayA301/Operations-Control-Tower",
        "summary": (
            "Converted 98k real orders into a validated star schema, executive KPI layer, supplier-risk score, "
            "and intervention-ready operations views."
        ),
        "tags": ["Analytics Engineering", "SQL", "Operations", "BI", "Data Quality"],
    },
    {
        "id": "manual-polyrag",
        "score": 0.7,
        "source": "project",
        "title": "PolyRAG: Multi-Model Governance RAG",
        "url": "https://chinmaya301-polyrag.hf.space",
        "summary": (
            "Citation-grounded retrieval system with shared evidence, multi-model comparison, OCR fallback, "
            "evaluation, FastAPI, Docker, and a hosted demo."
        ),
        "tags": ["RAG", "AI Engineering", "Retrieval", "Evaluation", "FastAPI"],
    },
    {
        "id": "manual-marketmaker",
        "score": 0.7,
        "source": "experience",
        "title": "Data Science / ML Internship at MarketMakerCRE",
        "url": f"{APP_SITE_URL}/experience/",
        "summary": (
            "Built Python scraping and ETL pipelines that improved commercial-real-estate data acquisition speed "
            "4x, then applied explainable ML and deployed FastAPI services."
        ),
        "tags": ["Python", "ETL", "Machine Learning", "FastAPI", "Real Estate"],
    },
    {
        "id": "manual-responsible-ml",
        "score": 0.7,
        "source": "project",
        "title": "Healthcare Readmission Risk with Fairness & Calibration",
        "url": "https://github.com/ChinmayA301/Risk-Prediction-with-Fairness-Geography",
        "summary": (
            "Leakage-controlled healthcare benchmark with calibration, subgroup error analysis, SHAP, Fairlearn, "
            "and an evidence-based recommendation not to deploy the model as-is."
        ),
        "tags": ["Responsible ML", "Healthcare", "Fairness", "Calibration", "Model Evaluation"],
    },
    {
        "id": "manual-confetti",
        "score": 0.7,
        "source": "experience",
        "title": "Data Analyst / Marketing Analytics Internship at Confetti AI",
        "url": f"{APP_SITE_URL}/experience/",
        "summary": "Ran A/B tests, engagement analysis, and campaign reporting that improved targeted conversion by about 25%.",
        "tags": ["Experimentation", "Marketing Analytics", "A/B Testing", "Product Analytics"],
    },
    {
        "id": "manual-finance-bi",
        "score": 0.7,
        "source": "experience",
        "title": "Financial Analytics & BI Consulting",
        "url": f"{APP_SITE_URL}/experience/",
        "summary": (
            "Built Power BI, SQL, and Excel finance workflows that improved reporting speed by about 40% and "
            "reduced manual reconciliation errors by about 20%."
        ),
        "tags": ["Power BI", "SQL", "Finance", "Automation", "KPI Design"],
    },
    {
        "id": "manual-career-audit",
        "score": 0.7,
        "source": "blog",
        "title": "Data Science Career Audit",
        "url": f"{APP_SITE_URL}/blog/data-science-career-audit/",
        "summary": "Analyzed 728k public job postings plus a 2026 snapshot to measure how AI is changing data-science role expectations.",
        "tags": ["NLP", "Labor Market", "Research", "Data Science", "AI Strategy"],
    },
    {
        "id": "manual-aegis-platform",
        "score": 0.7,
        "source": "project",
        "title": "Aegis AI Governance & Readiness Platform",
        "url": AEGIS_LIVE_URL,
        "summary": "Readiness scorecards, risk registers, human-review gates, monitoring logic, and evidence trails for safer AI adoption.",
        "tags": ["AI Governance", "Compliance", "Audit Readiness", "Responsible AI"],
    },
]


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


def normalize_match_url(title: str | None, url: str | None) -> str:
    title_text = (title or "").lower()
    raw_url = (url or "").strip()
    if "aegis" in title_text:
        return AEGIS_LIVE_URL
    if not raw_url:
        return APP_SITE_URL

    parsed = urlparse(raw_url)
    if parsed.netloc in {"chinmayarora.com", "www.chinmayarora.com"}:
        path = parsed.path or "/"
        suffix = ""
        if parsed.query:
            suffix += f"?{parsed.query}"
        if parsed.fragment:
            suffix += f"#{parsed.fragment}"
        return f"{APP_SITE_URL}{path}{suffix}"
    return raw_url


def curated_context_matches(query_text: str = "") -> list[dict[str, Any]]:
    return rerank_and_diversify_matches([dict(match) for match in CURATED_CONTEXT_MATCHES], query_text, limit=6)


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9][a-z0-9\-\+\.]{1,}", text.lower())


def meaningful_tokens(text: str) -> set[str]:
    return {
        token
        for token in tokenize(text)
        if token not in MATCH_STOPWORDS and len(token) > 2
    }


def match_searchable_text(match: dict[str, Any]) -> str:
    tags = match.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]
    return " ".join(
        str(value or "")
        for value in [match.get("title"), match.get("summary"), " ".join(str(tag) for tag in tags)]
    )


def rerank_and_diversify_matches(
    matches: list[dict[str, Any]],
    query_text: str,
    limit: int = 8,
) -> list[dict[str, Any]]:
    query_tokens = meaningful_tokens(query_text)
    ranked: list[dict[str, Any]] = []
    evidence_terms = {
        "auc", "benchmark", "built", "calibration", "deployed", "evaluation", "improved", "reduced",
        "result", "results", "tested", "validated",
    }

    for original in dedupe_matches(matches):
        item = dict(original)
        source = str(item.get("source") or "portfolio").lower()
        candidate_tokens = meaningful_tokens(match_searchable_text(item))
        shared_tokens = sorted(query_tokens & candidate_tokens)
        raw_score = float(item.get("score") or 0)
        overlap_bonus = min(len(shared_tokens), 6) * 0.012
        evidence_bonus = 0.025 if candidate_tokens & evidence_terms else 0
        relevance_score = raw_score + SOURCE_WEIGHTS.get(source, 0.02) + overlap_bonus + evidence_bonus

        item["retrieval_score"] = round(raw_score, 6)
        item["score"] = round(relevance_score, 6)
        if shared_tokens:
            item["match_reason"] = f"Matches company signals around {', '.join(shared_tokens[:3])}."
        else:
            item["match_reason"] = f"Strong {source.replace('_', ' ')} evidence for the identified priorities."
        ranked.append(item)

    ranked.sort(key=lambda item: item.get("score") or 0, reverse=True)
    selected: list[dict[str, Any]] = []
    source_counts: Counter[str] = Counter()
    selected_ids: set[str] = set()

    for item in ranked:
        source = str(item.get("source") or "portfolio").lower()
        if source_counts[source] >= 2:
            continue
        selected.append(item)
        selected_ids.add(str(item.get("id") or f"{item.get('title')}|{item.get('url')}"))
        source_counts[source] += 1
        if len(selected) >= limit:
            return selected

    for item in ranked:
        item_id = str(item.get("id") or f"{item.get('title')}|{item.get('url')}")
        if item_id in selected_ids:
            continue
        selected.append(item)
        if len(selected) >= limit:
            break
    return selected


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
        f"Hi {visitor_name}, I would start by identifying {company_name}'s highest-cost decision, data, product, or "
        f"operational bottleneck for a {job_title}. My portfolio spans analytics engineering, applied ML, RAG, "
        f"experimentation, responsible AI, product systems, and research, so I would match the strongest tested work "
        f"to that priority rather than forcing a single solution."
    ).strip()
    return trim_to_complete_sentence(pitch, limit=850)


def build_grounded_fallback_pitch(
    visitor_name: str,
    company_name: str,
    job_title: str,
    research_packet: dict[str, Any],
    matches: list[dict[str, Any]],
) -> str:
    top_match = matches[0] if matches else {}
    second_match = matches[1] if len(matches) > 1 else {}
    top_title = top_match.get("title") or "my applied data and AI portfolio"
    second_title = second_match.get("title")
    research_findings = research_packet.get("findings") or []
    research_signal = (research_findings[0].get("snippet") or "").strip() if research_findings else ""
    if len(research_signal) > 150:
        research_signal = research_signal[:147].rstrip() + "..."
    priority_clause = f" One current signal is: {research_signal}" if research_signal else ""
    evidence_clause = f" and {second_title}" if second_title else ""
    pitch = (
        f"Hi {visitor_name}, I mapped {company_name}'s current signals to the strongest relevant evidence in my "
        f"portfolio: {top_title}{evidence_clause}. Those examples show how I frame the operating problem, build the "
        f"data or AI system, and test whether it improves the decision for a {job_title}.{priority_clause}"
    ).strip()
    return trim_to_complete_sentence(pitch, limit=850)


def clean_pitch_text(text: str) -> str:
    cleaned = " ".join((text or "").split()).strip()
    cleaned = cleaned.strip("\"' ")
    return trim_to_complete_sentence(cleaned, limit=850)


def trim_to_complete_sentence(text: str, limit: int = 850) -> str:
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
                    "service": "cai-portfolio-architect",
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
                    fallback_query = " ".join(
                        [
                            company_name,
                            job_title,
                            *[
                                f"{item.get('title', '')} {item.get('snippet', '')}"
                                for item in research_packet.get("findings", [])
                            ],
                        ]
                    )
                    matches = curated_context_matches(fallback_query)
                else:
                    raise RuntimeError(f"retrieval_phase failed: {type(exc).__name__}: {exc}") from exc

            if matches and retrieval_degraded:
                pitch = build_grounded_fallback_pitch(visitor_name, company_name, job_title, research_packet, matches)
            elif matches:
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
            "portfolio_matches": matches[:6],
            "pitch": pitch,
        }
        if retrieval_degraded:
            payload["notice"] = (
                "Portfolio retrieval is temporarily rate-limited. Returning a diversified set of curated portfolio evidence."
            )
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
            f"{company_name} 2026 strategic priorities challenges annual report technology operations growth",
            f"{company_name} recent news product customer data AI efficiency risk priorities",
            f"{company_name} {job_title} responsibilities priorities hiring transformation analytics",
        ]

        findings: list[dict[str, str]] = []
        seen_links: set[str] = set()
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
                link = (item.get("link") or "").strip()
                if link and link in seen_links:
                    continue
                if link:
                    seen_links.add(link)
                findings.append(
                    {
                        "query": query,
                        "title": item.get("title", ""),
                        "link": link,
                        "snippet": snippet,
                    }
                )

        if findings:
            return {"mode": "company_research", "findings": findings[:6]}

        fallback = {
            "query": f"{job_title} solution mapping fallback",
            "title": f"General expert mode for {job_title}",
            "link": "",
            "snippet": (
                f"No verified company-specific research was found. Personalize the pitch for a {job_title} who likely "
                "cares about the company's highest-priority growth, customer, operating, data, product, risk, or "
                "technology constraint. Select the strongest portfolio evidence for that constraint without assuming "
                "the answer must be an AI-governance project."
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
            "Identify the company's highest-priority pain points, then retrieve the strongest relevant evidence from "
            "Chinmay's complete body of work: shipped and evaluated projects, professional experience, technical "
            "skills, coursework, research studies, blog explorations, analytics systems, applied AI, and lab ventures. "
            "Prefer concrete outcomes and directly transferable methods. Do not default to Aegis or governance unless "
            "the company evidence makes governance a leading priority. Return distinct work rather than repeated chunks "
            "from one project."
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
                    "topK": 24,
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
                    "topK": 24,
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
                    "url": normalize_match_url(metadata.get("title"), metadata.get("url")),
                    "summary": metadata.get("summary") or metadata.get("description"),
                    "tags": metadata.get("tags", []),
                }
            )
        match_query = f"{company_name} {job_title} {research_text}"
        return rerank_and_diversify_matches(matches, match_query, limit=8)

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
            for item in matches[:8]
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

Write a personalized consultative pitch under 120 words.
Requirements:
- Lead with the one or two highest-priority company pain points supported by the research findings.
- Connect those pain points to the strongest one or two portfolio matches, regardless of whether they are projects,
  professional experience, coursework, research, technical writing, or venture work.
- Prefer evidence with concrete outcomes, evaluation, deployment, or directly transferable methods.
- Do not mention Aegis unless it genuinely ranks among the strongest matches for the company evidence.
- Do not repeat the same project family or force governance, public-sector, or RAG language into every pitch.
- Explain why the selected evidence transfers to this company instead of merely listing titles.
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
                    "maxOutputTokens": 190,
                },
            },
            "Gemini generate",
        )

        candidates = payload.get("candidates") or []
        if not candidates:
            raise ValueError("Gemini returned no candidates.")
        parts = candidates[0].get("content", {}).get("parts", [])
        return "\n".join(part.get("text", "") for part in parts if part.get("text")).strip()
