#!/usr/bin/env python3
"""Generate deterministic 1200x630 social cards for the portfolio blog."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "images"
SANS_FONT = "/System/Library/Fonts/SFNS.ttf"
MONO_FONT = "/System/Library/Fonts/SFNSMono.ttf"

CARDS = [
    {
        "file": "default-og.png",
        "label": "DATA SCIENCE / APPLIED AI",
        "title": "Chinmay Arora",
        "subtitle": "Research, engineering, governance, and decision systems",
        "accent": "#d98655",
    },
    {
        "file": "og-aegis-ai-governance.png",
        "label": "AI GOVERNANCE / AEGIS",
        "title": "Building the Trust Layer for High-Risk AI Adoption",
        "subtitle": "Privacy, vendor risk, human oversight, and audit evidence",
        "accent": "#73cfa9",
    },
    {
        "file": "og-signalgraph.png",
        "label": "OPEN-SOURCE INTELLIGENCE / SIGNALGRAPH",
        "title": "Replacing GitHub's Fake Star Economy",
        "subtitle": "Credibility-adjusted signals for technical diligence",
        "accent": "#78aef2",
    },
    {
        "file": "og-wax-seal.png",
        "label": "PROVENANCE / WAX SEAL",
        "title": "Designing Human-Legible Trust and Tamper Evidence",
        "subtitle": "Cryptographic rigor with visible provenance states",
        "accent": "#dc765f",
    },
    {
        "file": "og-higgs-bayesian-optimization.png",
        "label": "BAYESIAN OPTIMIZATION / HIGGS GRAPH",
        "title": "When Search-Space Design Determines the Result",
        "subtitle": "An honest influence-maximization experiment",
        "accent": "#e5b858",
    },
    {
        "file": "og-finbizinfo-rag.png",
        "label": "FINANCIAL NLP / FINBIZINFO",
        "title": "Citation-Grounded Balance-Sheet RAG",
        "subtitle": "OCR, retrieval, structured extraction, and reviewable evidence",
        "accent": "#72c6d8",
    },
]


def font(size: int, mono: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(MONO_FONT if mono else SANS_FONT, size=size)


def wrap(draw: ImageDraw.ImageDraw, text: str, selected_font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=selected_font)[2] <= width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def title_font_and_lines(draw: ImageDraw.ImageDraw, title: str) -> tuple[ImageFont.FreeTypeFont, list[str]]:
    for size in range(66, 43, -2):
        selected = font(size)
        lines = wrap(draw, title, selected, 900)
        if len(lines) <= 3:
            return selected, lines
    selected = font(42)
    return selected, wrap(draw, title, selected, 900)


def render(card: dict[str, str]) -> None:
    image = Image.new("RGB", (1200, 630), "#111519")
    draw = ImageDraw.Draw(image)

    for x in range(0, 1201, 80):
        draw.line((x, 0, x, 630), fill="#182027", width=1)
    for y in range(0, 631, 80):
        draw.line((0, y, 1200, y), fill="#182027", width=1)

    accent = card["accent"]
    draw.rectangle((0, 0, 18, 630), fill=accent)
    draw.rectangle((86, 86, 145, 92), fill=accent)
    draw.text((86, 112), card["label"], font=font(22, mono=True), fill=accent)

    selected_font, title_lines = title_font_and_lines(draw, card["title"])
    y = 192
    line_height = selected_font.size + 9
    for line in title_lines:
        draw.text((86, y), line, font=selected_font, fill="#f1f3f4")
        y += line_height

    y = max(y + 18, 410)
    subtitle_font = font(27)
    for line in wrap(draw, card["subtitle"], subtitle_font, 940):
        draw.text((88, y), line, font=subtitle_font, fill="#aeb7be")
        y += 36

    draw.line((86, 546, 1114, 546), fill="#374149", width=1)
    draw.text((86, 568), "CHINMAY ARORA", font=font(19, mono=True), fill="#f1f3f4")
    domain = "APP.CHINMAYARORA.COM"
    domain_font = font(19, mono=True)
    domain_width = draw.textbbox((0, 0), domain, font=domain_font)[2]
    draw.text((1114 - domain_width, 568), domain, font=domain_font, fill="#8d989f")

    image.save(OUTPUT / card["file"], format="PNG", optimize=True)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for card in CARDS:
        render(card)
        print(f"generated {card['file']}")


if __name__ == "__main__":
    main()
