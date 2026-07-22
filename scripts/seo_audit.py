#!/usr/bin/env python3
"""Audit every URL in a sitemap for indexability and on-page SEO signals."""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
from dataclasses import asdict, dataclass, field
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET


DEFAULT_SITEMAP = "https://app.chinmayarora.com/sitemap.xml"
DEFAULT_OUTDIR = Path("audit_output")
USER_AGENT = "SEO-Self-Audit/2.0 (+https://app.chinmayarora.com)"
REQUEST_TIMEOUT = 20
POLITE_DELAY_SEC = 0.35
MIN_DESCRIPTION_CHARS = 80
MIN_WORD_COUNT = 600


@dataclass
class PageAudit:
    url: str
    status: int = 0
    title: str = ""
    description: str = ""
    description_length: int = 0
    has_og_image: bool = False
    has_og_title: bool = False
    has_og_description: bool = False
    has_canonical: bool = False
    canonical_matches: bool = False
    has_article_schema: bool = False
    has_h1: bool = False
    h1_count: int = 0
    word_count: int = 0
    outbound_links: int = 0
    internal_links: int = 0
    has_bluf_or_tldr: bool = False
    issues: list[str] = field(default_factory=list)
    priority_score: int = 0


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.text_parts: list[str] = []
        self.links: list[str] = []
        self.description = ""
        self.og: dict[str, str] = {}
        self.canonical = ""
        self.h1_count = 0
        self.json_ld: list[str] = []
        self._in_title = False
        self._in_json_ld = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "a" and values.get("href"):
            self.links.append(values["href"].strip())
        elif tag == "meta":
            if values.get("name", "").lower() == "description":
                self.description = values.get("content", "").strip()
            if values.get("property", "").lower().startswith("og:"):
                self.og[values["property"].lower()] = values.get("content", "").strip()
        elif tag == "link" and "canonical" in values.get("rel", "").lower().split():
            self.canonical = values.get("href", "").strip()
        elif tag == "script" and values.get("type", "").lower() == "application/ld+json":
            self._in_json_ld = True
            self.json_ld.append("")

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False
        elif tag.lower() == "script" and self._in_json_ld:
            self._in_json_ld = False

    def handle_data(self, data: str) -> None:
        clean = " ".join(data.split())
        if not clean:
            return
        if self._in_title:
            self.title_parts.append(clean)
        if self._in_json_ld:
            self.json_ld[-1] += data
        else:
            self.text_parts.append(clean)


def fetch(url: str) -> tuple[int, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=REQUEST_TIMEOUT) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return response.status, response.read().decode(charset, errors="replace")
    except HTTPError as exc:
        return exc.code, ""
    except (URLError, TimeoutError) as exc:
        return 0, f"__FETCH_ERROR__: {exc}"


def parse_sitemap(sitemap_url: str) -> list[str]:
    status, body = fetch(sitemap_url)
    if status != 200:
        raise SystemExit(f"Could not fetch sitemap {sitemap_url}: HTTP {status}")
    root = ET.fromstring(body)
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls: list[str] = []
    for sitemap in root.findall("sm:sitemap", namespace):
        location = sitemap.find("sm:loc", namespace)
        if location is not None and location.text:
            urls.extend(parse_sitemap(location.text.strip()))
    for entry in root.findall("sm:url", namespace):
        location = entry.find("sm:loc", namespace)
        if location is not None and location.text:
            urls.append(location.text.strip())
    return urls


def normalized_url(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}{parsed.path.rstrip('/')}"


def has_article_schema(blocks: list[str]) -> bool:
    for raw in blocks:
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            if re.search(r'"@type"\s*:\s*"(?:TechArticle|Article|BlogPosting)"', raw):
                return True
            continue
        nodes = payload.get("@graph", []) if isinstance(payload, dict) else []
        if isinstance(payload, dict):
            nodes = [payload, *nodes]
        for node in nodes:
            if isinstance(node, dict) and node.get("@type") in {"TechArticle", "Article", "BlogPosting"}:
                return True
    return False


def audit_page(url: str) -> PageAudit:
    audit = PageAudit(url=url)
    status, body = fetch(url)
    audit.status = status
    if status != 200:
        audit.issues.append(f"HTTP {status}")
        audit.priority_score = 100
        return audit

    parser = PageParser()
    parser.feed(body)
    text = " ".join(parser.text_parts)
    audit.title = " ".join(parser.title_parts)
    audit.description = parser.description
    audit.description_length = len(audit.description)
    audit.has_og_image = bool(parser.og.get("og:image"))
    audit.has_og_title = bool(parser.og.get("og:title"))
    audit.has_og_description = bool(parser.og.get("og:description"))
    audit.has_canonical = bool(parser.canonical)
    audit.canonical_matches = audit.has_canonical and normalized_url(parser.canonical) == normalized_url(url)
    audit.has_article_schema = has_article_schema(parser.json_ld)
    audit.h1_count = parser.h1_count
    audit.has_h1 = parser.h1_count > 0
    audit.word_count = len(text.split())
    audit.has_bluf_or_tldr = any(
        marker in text[:1500].lower() for marker in ("bluf", "tl;dr", "tldr", "key takeaways")
    )

    site_host = urlparse(url).netloc
    for href in parser.links:
        if href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        target = urlparse(urljoin(url, href))
        if target.netloc == site_host:
            audit.internal_links += 1
        elif target.scheme in {"http", "https"}:
            audit.outbound_links += 1

    is_post = urlparse(url).path.startswith("/blog/") and urlparse(url).path != "/blog/"
    checks = [
        (not audit.title, "Missing <title>", 10),
        (not audit.description, "Missing meta description", 15),
        (bool(audit.description) and audit.description_length < MIN_DESCRIPTION_CHARS,
         f"Description too short ({audit.description_length} chars)", 8),
        (not audit.has_og_image, "Missing og:image", 8),
        (not audit.has_og_title, "Missing og:title", 3),
        (not audit.has_og_description, "Missing og:description", 3),
        (not audit.has_canonical, "Missing canonical link", 5),
        (audit.has_canonical and not audit.canonical_matches, f"Canonical mismatch: {parser.canonical}", 5),
        (is_post and not audit.has_article_schema, "Missing Article/TechArticle JSON-LD schema", 6),
        (audit.h1_count == 0, "No <h1> found", 8),
        (audit.h1_count > 1, f"Multiple <h1> tags ({audit.h1_count})", 3),
        (is_post and audit.word_count < MIN_WORD_COUNT, f"Thin content ({audit.word_count} words)", 4),
        (is_post and not audit.has_bluf_or_tldr, "No BLUF/TL;DR/Key takeaways near the top", 4),
        (is_post and audit.outbound_links < 3, f"Few outbound links ({audit.outbound_links})", 2),
        (is_post and audit.internal_links < 2, f"Few internal links ({audit.internal_links})", 3),
    ]
    for failed, issue, score in checks:
        if failed:
            audit.issues.append(issue)
            audit.priority_score += score
    return audit


def write_csv(audits: list[PageAudit], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(asdict(audits[0]).keys()))
        writer.writeheader()
        for audit in audits:
            row = asdict(audit)
            row["issues"] = " | ".join(audit.issues)
            writer.writerow(row)


def write_report(audits: list[PageAudit], path: Path) -> None:
    total = len(audits)
    lines = [
        "# SEO Audit Report - app.chinmayarora.com", "", f"**Total pages audited:** {total}", "",
        "## Aggregate view", "",
        f"- Missing meta description: **{sum(not item.description for item in audits)}/{total}**",
        f"- Missing og:image: **{sum(not item.has_og_image for item in audits)}/{total}**",
        f"- Missing canonical: **{sum(not item.has_canonical for item in audits)}/{total}**",
        f"- Missing Article JSON-LD on posts: **{sum('Missing Article/TechArticle JSON-LD schema' in item.issues for item in audits)}/{total}**",
        f"- No BLUF/TL;DR on posts: **{sum('No BLUF/TL;DR/Key takeaways near the top' in item.issues for item in audits)}/{total}**",
        f"- Thin blog content: **{sum(any(issue.startswith('Thin content') for issue in item.issues) for item in audits)}/{total}**",
        "", "## Per-page issues, sorted by priority", "",
    ]
    for audit in sorted(audits, key=lambda item: item.priority_score, reverse=True):
        if audit.issues:
            lines.extend([
                f"### {audit.url}", "", f"- Priority score: **{audit.priority_score}**",
                f"- Word count: {audit.word_count}",
                f"- Outbound links: {audit.outbound_links} | Internal links: {audit.internal_links}",
                *[f"- {issue}" for issue in audit.issues], "",
            ])
    clean = [audit.url for audit in audits if not audit.issues]
    if clean:
        lines.extend(["## Pages with no issues detected", "", *[f"- {url}" for url in clean]])
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sitemap", default=DEFAULT_SITEMAP)
    parser.add_argument("--out", default=str(DEFAULT_OUTDIR))
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--delay", type=float, default=POLITE_DELAY_SEC)
    args = parser.parse_args()
    output = Path(args.out)
    output.mkdir(parents=True, exist_ok=True)
    urls = parse_sitemap(args.sitemap)
    if args.limit:
        urls = urls[:args.limit]
    print(f"Auditing {len(urls)} URLs from {args.sitemap}", file=sys.stderr)
    audits: list[PageAudit] = []
    for index, url in enumerate(urls, 1):
        print(f"[{index}/{len(urls)}] {url}", file=sys.stderr)
        audits.append(audit_page(url))
        if index < len(urls):
            time.sleep(max(0, args.delay))
    if not audits:
        raise SystemExit("Sitemap contains no URLs")
    write_csv(audits, output / "seo_audit.csv")
    write_report(audits, output / "seo_audit_report.md")
    print(f"Wrote {output / 'seo_audit.csv'}", file=sys.stderr)
    print(f"Wrote {output / 'seo_audit_report.md'}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
