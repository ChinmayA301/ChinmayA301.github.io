#!/usr/bin/env python3
"""Validate the standalone Brain Vomit build before a Cloudflare deployment."""

from __future__ import annotations

import re
import sys
from pathlib import Path


def fail(message: str) -> None:
    raise SystemExit(f"Brain Vomit build validation failed: {message}")


output = Path(sys.argv[1] if len(sys.argv) > 1 else "_site_brainvomit")
required = [
    output / "index.html",
    output / "privacy" / "index.html",
    output / "robots.txt",
    output / "sitemap.xml",
    output / "feed.xml",
    output / "_headers",
    output / "_redirects",
]

for path in required:
    if not path.is_file():
        fail(f"missing {path.relative_to(output)}")

html_files = sorted(output.rglob("*.html"))
if len(html_files) < 30:
    fail(f"expected the article archive, found only {len(html_files)} HTML files")

canonical_pattern = re.compile(r'<link rel="canonical" href="([^"]+)"')
asset_pattern = re.compile(r'(?:href|src)=["\'](/[^"\'#?]*)')
bad_canonicals: list[str] = []
legacy_links: list[str] = []
broken_internal_links: list[str] = []

for path in html_files:
    text = path.read_text(encoding="utf-8")
    canonicals = canonical_pattern.findall(text)
    is_supporting_artifact = "blog-artifacts" in path.parts
    if path.name != "404.html" and not is_supporting_artifact:
        if len(canonicals) != 1 or not canonicals[0].startswith("https://brainvomit.blog/"):
            bad_canonicals.append(str(path.relative_to(output)))
    if 'href="/blog/' in text or "href='/blog/" in text:
        legacy_links.append(str(path.relative_to(output)))
    for target in asset_pattern.findall(text):
        candidate = output / target.lstrip("/")
        if target.endswith("/"):
            candidate = candidate / "index.html"
        if not candidate.exists():
            broken_internal_links.append(f"{path.relative_to(output)} -> {target}")

if bad_canonicals:
    fail(f"invalid canonicals in: {', '.join(bad_canonicals[:8])}")
if legacy_links:
    fail(f"legacy /blog links in: {', '.join(legacy_links[:8])}")
if broken_internal_links:
    fail(f"broken internal links: {', '.join(broken_internal_links[:100])}")

sitemap = (output / "sitemap.xml").read_text(encoding="utf-8")
if "https://brainvomit.blog/" not in sitemap:
    fail("sitemap does not contain the new domain")
if "app.chinmayarora.com/blog" in sitemap:
    fail("sitemap still contains legacy blog URLs")
if sitemap.count("<loc>") != len(list(Path("_posts").glob("*.md"))) + 2:
    fail("sitemap must contain only the publication home, privacy page, and posts")

robots = (output / "robots.txt").read_text(encoding="utf-8")
if "Sitemap: https://brainvomit.blog/sitemap.xml" not in robots:
    fail("robots.txt does not advertise the new sitemap")

for forbidden in ("projects", "experience", "ideas", "intelligence", "resumes", "coursework"):
    if (output / forbidden).exists():
        fail(f"portfolio-only path leaked into standalone build: /{forbidden}/")

print(f"Brain Vomit build validated: {len(html_files)} HTML pages, root canonicals, sitemap, feed, and Cloudflare controls.")
