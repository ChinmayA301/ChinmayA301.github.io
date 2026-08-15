"""Render the static companion figure for the Prime Human simulator."""

from pathlib import Path
import json

from PIL import Image, ImageDraw, ImageFont


HERE = Path(__file__).resolve().parent
OUT = HERE.parents[1] / "assets" / "blog" / "prime-human" / "domain-elimination-share.png"
FONT_CANDIDATES = {
    "regular": [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ],
    "bold": [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ],
}


def load_font(kind, size):
    for candidate in FONT_CANDIDATES[kind]:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)

with (HERE / "domain-elimination-share.json").open(encoding="utf-8") as handle:
    data = json.load(handle)

values = data["elimination_share_percent"]

W, H = 1600, 1000
BG = "#f3f0e7"
INK = "#17201c"
MUTED = "#59675e"
GRID = "#c7cbc0"
TEAL = "#315f63"
SIGNAL = "#a63f2f"

image = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(image)
title_font = load_font("bold", 54)
subtitle_font = load_font("regular", 29)
label_font = load_font("regular", 28)
value_font = load_font("bold", 25)
axis_font = load_font("regular", 20)
note_font = load_font("regular", 18)

draw.text((120, 76), "No single domain owns the first cut", font=title_font, fill=INK)
draw.text(
    (120, 148),
    "Weakest-domain attribution at the 50th-percentile floor",
    font=subtitle_font,
    fill=MUTED,
)

plot_left, plot_right = 410, 1450
plot_top, row_gap = 246, 76
bar_h = 40
max_axis = 18

for tick in range(0, max_axis + 1, 3):
    x = plot_left + int((plot_right - plot_left) * tick / max_axis)
    draw.line((x, plot_top - 12, x, plot_top + row_gap * 8 - 20), fill=GRID, width=2)
    text = f"{tick}%"
    box = draw.textbbox((0, 0), text, font=axis_font)
    draw.text((x - (box[2] - box[0]) / 2, plot_top + row_gap * 8), text, font=axis_font, fill=MUTED)

for idx, (label, value) in enumerate(values.items()):
    y = plot_top + idx * row_gap
    label_box = draw.textbbox((0, 0), label, font=label_font)
    draw.text((plot_left - 32 - (label_box[2] - label_box[0]), y + 3), label, font=label_font, fill=INK)
    bar_w = int((plot_right - plot_left) * value / max_axis)
    color = SIGNAL if label == "Physical" else TEAL
    draw.rounded_rectangle((plot_left, y, plot_left + bar_w, y + bar_h), radius=8, fill=color)
    draw.text((plot_left + bar_w + 16, y + 5), f"{value:.1f}%", font=value_font, fill=INK)

draw.text(
    (plot_left, 900),
    "Share of competitors eliminated at the first floor",
    font=axis_font,
    fill=MUTED,
)
draw.text(
    (120, 948),
    "Synthetic N=50,000 · seed 20260807 · open norms · eight-domain simulator v0.1",
    font=note_font,
    fill=MUTED,
)

OUT.parent.mkdir(parents=True, exist_ok=True)
image.save(OUT, optimize=True)
print(OUT)
