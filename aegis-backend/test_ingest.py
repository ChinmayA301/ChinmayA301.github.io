from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from types import SimpleNamespace

import httpx


MODULE_PATH = Path(__file__).with_name("ingest.py")
SPEC = importlib.util.spec_from_file_location("portfolio_ingest", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Could not load ingestion module: {MODULE_PATH}")
ingest = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(ingest)


def document(document_id: str, chunk_text: str = "same chunk") -> dict:
    return {
        "id": document_id,
        "title": "Example",
        "url": "https://app.chinmayarora.com/example/",
        "type": "page",
        "summary": "Summary",
        "chunk_text": chunk_text,
        "fulltext": f"Example\n{chunk_text}",
    }


class FakeIndex:
    def __init__(self, existing_vectors=None, listed_ids=None):
        self.existing_vectors = existing_vectors or {}
        self.listed_ids = listed_ids or []
        self.fetch_calls = []
        self.events = []

    def fetch(self, *, ids, namespace):
        self.fetch_calls.append((list(ids), namespace))
        return SimpleNamespace(
            vectors={
                vector_id: self.existing_vectors[vector_id]
                for vector_id in ids
                if vector_id in self.existing_vectors
            }
        )

    def list(self, *, namespace, limit):
        self.events.append(("list", namespace, limit))
        yield SimpleNamespace(vectors=[SimpleNamespace(id=vector_id) for vector_id in self.listed_ids])

    def upsert(self, *, vectors, namespace):
        self.events.append(("upsert", [vector["id"] for vector in vectors], namespace))

    def delete(self, *, ids, namespace):
        self.events.append(("delete", list(ids), namespace))


class IngestionCacheTests(unittest.TestCase):
    def test_embedding_fingerprint_changes_with_content(self):
        original = document("doc-1", "alpha")
        changed = document("doc-1", "beta")

        first = ingest.embedding_fingerprint(original, "models/gemini-embedding-001", 1024)
        second = ingest.embedding_fingerprint(original, "models/gemini-embedding-001", 1024)
        different = ingest.embedding_fingerprint(changed, "models/gemini-embedding-001", 1024)

        self.assertEqual(first, second)
        self.assertNotEqual(first, different)

    def test_partition_reuses_fingerprinted_and_legacy_vectors(self):
        current = [document("fingerprinted"), document("legacy"), document("changed", "new")]
        fingerprint = ingest.embedding_fingerprint(current[0], "models/gemini-embedding-001", 3)
        existing = {
            "fingerprinted": SimpleNamespace(
                values=[0.1, 0.2, 0.3],
                metadata={"embedding_fingerprint": fingerprint},
            ),
            "legacy": SimpleNamespace(
                values=[0.4, 0.5, 0.6],
                metadata={"title": "Example", "chunk_text": "same chunk"},
            ),
            "changed": SimpleNamespace(
                values=[0.7, 0.8, 0.9],
                metadata={"title": "Example", "chunk_text": "old"},
            ),
        }

        reused, pending, legacy_count = ingest.partition_embeddings(
            current,
            existing,
            "models/gemini-embedding-001",
            3,
        )

        self.assertEqual(set(reused), {"fingerprinted", "legacy"})
        self.assertEqual([item["id"] for item in pending], ["changed"])
        self.assertEqual(legacy_count, 1)

    def test_dimension_mismatch_forces_reembedding(self):
        current = document("doc-1")
        existing = SimpleNamespace(
            values=[0.1, 0.2],
            metadata={"title": "Example", "chunk_text": "same chunk"},
        )

        reusable = ingest.reusable_dense_embedding(
            existing,
            current,
            "models/gemini-embedding-001",
            3,
        )

        self.assertIsNone(reusable)

    def test_existing_vector_fetch_is_batched(self):
        vectors = {
            f"doc-{idx}": SimpleNamespace(values=[float(idx)], metadata={})
            for idx in range(5)
        }
        index = FakeIndex(existing_vectors=vectors)

        fetched = ingest.fetch_existing_vectors(
            index,
            "portfolio",
            list(vectors),
            batch_size=2,
        )

        self.assertEqual(set(fetched), set(vectors))
        self.assertEqual([len(call[0]) for call in index.fetch_calls], [2, 2, 1])


class RetryTests(unittest.TestCase):
    def test_retry_uses_server_floor_and_exponential_backoff(self):
        request = httpx.Request("POST", "https://generativelanguage.googleapis.com/test")
        response = httpx.Response(
            429,
            request=request,
            headers={"Retry-After": "7"},
            json={"error": {"status": "RESOURCE_EXHAUSTED", "message": "rate limit"}},
        )
        error = httpx.HTTPStatusError("rate limited", request=request, response=response)
        attempts = []
        waits = []

        def operation():
            attempts.append(1)
            if len(attempts) < 3:
                raise error
            return "ok"

        result = ingest.call_gemini_with_backoff(
            operation,
            max_retries=3,
            base_delay_seconds=2,
            max_delay_seconds=20,
            success_delay_seconds=0,
            sleep_fn=waits.append,
            random_fn=lambda _start, _end: 0,
        )

        self.assertEqual(result, "ok")
        self.assertEqual(len(attempts), 3)
        self.assertEqual(waits, [7.0, 7.0])

    def test_non_retryable_error_fails_immediately(self):
        attempts = []
        waits = []

        def operation():
            attempts.append(1)
            raise ValueError("invalid request")

        with self.assertRaisesRegex(ValueError, "invalid request"):
            ingest.call_gemini_with_backoff(
                operation,
                max_retries=4,
                success_delay_seconds=0,
                sleep_fn=waits.append,
            )

        self.assertEqual(len(attempts), 1)
        self.assertEqual(waits, [])


class PineconeReconciliationTests(unittest.TestCase):
    def test_upserts_complete_set_before_deleting_stale_ids(self):
        index = FakeIndex(listed_ids=["current-a", "stale", "current-b"])
        vectors = [
            {"id": "current-a", "values": [0.1]},
            {"id": "current-b", "values": [0.2]},
        ]

        stale_count = ingest.reconcile_pinecone_index(
            index,
            "portfolio",
            vectors,
            prune_stale=True,
            batch_size=1,
        )

        mutation_events = [event for event in index.events if event[0] != "list"]
        self.assertEqual(stale_count, 1)
        self.assertEqual(
            mutation_events,
            [
                ("upsert", ["current-a"], "portfolio"),
                ("upsert", ["current-b"], "portfolio"),
                ("delete", ["stale"], "portfolio"),
            ],
        )


if __name__ == "__main__":
    unittest.main()
