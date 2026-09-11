#!/usr/bin/env python3
"""Generate a PDF curriculum pack from the markdown source.

Workflow:
  1. Read the curriculum markdown
  2. Parse a small subset of MD (headings, lists, code fences, tables-as-text)
  3. Render pages with fpdf2 + Arial Unicode
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
MD_PATH = ROOT / "Exhausted-or-Nauseous-Full-Curriculum-Pack.md"
PDF_PATH = ROOT / "Exhausted-or-Nauseous-Full-Curriculum-Pack.pdf"

FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
MONO = "/Library/Fonts/SourceCodePro-Regular.ttf"


class CurriculumPDF(FPDF):
    def __init__(self) -> None:
        super().__init__(format="letter", unit="mm")
        self.set_auto_page_break(auto=True, margin=18)
        # Arial Unicode for all weights — avoids bold-metric edge cases with multi_cell
        self.add_font("Body", "", FONT)
        self.add_font("Body", "B", FONT)
        self.add_font("Mono", "", MONO)
        self.in_code = False

    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_x(self.l_margin)
        self.set_font("Body", "", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 6, "Exhausted or Nauseous - Full Curriculum Pack", align="L")
        self.ln(8)
        self.set_draw_color(200, 200, 200)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(4)

    def footer(self) -> None:
        self.set_y(-14)
        self.set_x(self.l_margin)
        self.set_font("Body", "", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"{self.page_no()}", align="C")

    def write_body(self, text: str, size: float = 10, leading: float = 5.2, bold: bool = False) -> None:
        self.set_x(self.l_margin)
        self.set_font("Body", "B" if bold else "", size)
        self.multi_cell(0, leading, text)


def clean_inline(text: str) -> str:
    text = text.replace("**", "")
    text = text.replace("__", "")
    text = text.replace("`", "")
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text


def render(md: str, pdf: CurriculumPDF) -> None:
    lines = md.splitlines()
    i = 0
    pdf.add_page()
    # Cover block
    pdf.set_text_color(27, 42, 74)
    pdf.write_body("Exhausted or Nauseous", size=26, leading=11, bold=True)
    pdf.set_text_color(0, 156, 78)
    pdf.write_body("Full Curriculum Pack", size=15, leading=8, bold=True)
    pdf.ln(3)
    pdf.set_text_color(40, 40, 40)
    pdf.write_body(
        "Build a Social Status App with Expo 56 & Supabase\n"
        "Source: this repository · Pack v1.0 · August 2026",
        size=11,
        leading=6,
    )
    pdf.ln(5)
    pdf.set_draw_color(27, 42, 74)
    pdf.set_line_width(0.6)
    pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
    pdf.ln(6)

    # Skip the duplicate H1/H2 cover lines in the MD body
    while i < len(lines) and (
        lines[i].startswith("# Exhausted")
        or lines[i].startswith("## Full Curriculum")
        or lines[i].startswith("**Course:**")
        or lines[i].startswith("**Product:**")
        or lines[i].startswith("**Source")
        or lines[i].startswith("**Expo")
        or lines[i].startswith("**Estimated")
        or lines[i].startswith("**Pack")
        or lines[i].strip() == "---"
        or lines[i].strip() == ""
    ):
        if lines[i].startswith("**") and ":" in lines[i]:
            pdf.set_text_color(60, 60, 60)
            pdf.write_body(clean_inline(lines[i]), size=10, leading=5)
        i += 1

    pdf.ln(3)

    while i < len(lines):
        line = lines[i]
        raw = line.rstrip()

        if raw.startswith("```"):
            pdf.in_code = not pdf.in_code
            pdf.ln(2)
            i += 1
            continue

        if pdf.in_code:
            pdf.set_x(pdf.l_margin)
            pdf.set_font("Mono", "", 8)
            pdf.set_text_color(30, 30, 30)
            pdf.set_fill_color(245, 245, 248)
            safe = raw.replace("\t", "  ")
            pdf.multi_cell(0, 4.2, safe if safe else " ", fill=True)
            i += 1
            continue

        if raw.strip() == "---":
            pdf.ln(2)
            pdf.set_draw_color(210, 210, 210)
            y = pdf.get_y()
            pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
            pdf.ln(5)
            i += 1
            continue

        if raw.startswith("# "):
            pdf.add_page()
            pdf.set_text_color(27, 42, 74)
            pdf.write_body(clean_inline(raw[2:]), size=17, leading=8, bold=True)
            pdf.ln(2)
            i += 1
            continue

        if raw.startswith("## "):
            if pdf.get_y() > 240:
                pdf.add_page()
            pdf.ln(3)
            pdf.set_text_color(27, 42, 74)
            pdf.write_body(clean_inline(raw[3:]), size=13, leading=7, bold=True)
            pdf.ln(1)
            i += 1
            continue

        if raw.startswith("### "):
            if pdf.get_y() > 250:
                pdf.add_page()
            pdf.ln(2)
            pdf.set_text_color(0, 100, 60)
            pdf.write_body(clean_inline(raw[4:]), size=11, leading=6, bold=True)
            pdf.ln(1)
            i += 1
            continue

        if raw.startswith("|") and "|" in raw[1:]:
            if all(c in "-|: " for c in raw):
                i += 1
                continue
            cells = [c.strip() for c in raw.strip("|").split("|")]
            text = "  ·  ".join(clean_inline(c) for c in cells if c != "")
            pdf.set_text_color(35, 35, 35)
            pdf.write_body("• " + text, size=9, leading=5)
            i += 1
            continue

        if re.match(r"^[-*] ", raw) or re.match(r"^\d+\. ", raw):
            content = re.sub(r"^[-*] ", "", raw)
            content = re.sub(r"^\d+\. ", "", content)
            pdf.set_text_color(35, 35, 35)
            pdf.write_body("• " + clean_inline(content), size=10, leading=5)
            i += 1
            continue

        if raw.strip() == "":
            pdf.ln(2)
            i += 1
            continue

        pdf.set_text_color(35, 35, 35)
        pdf.write_body(clean_inline(raw), size=10, leading=5.2)
        i += 1


def main() -> int:
    print("[curriculum] reading markdown…")
    if not MD_PATH.exists():
        print(f"[curriculum] missing {MD_PATH}", file=sys.stderr)
        return 1
    md = MD_PATH.read_text(encoding="utf-8")
    print("[curriculum] rendering PDF…")
    pdf = CurriculumPDF()
    pdf.set_margins(16, 16, 16)
    render(md, pdf)
    pdf.output(str(PDF_PATH))
    print(f"[curriculum] wrote {PDF_PATH}")
    print(f"[curriculum] pages: {pdf.page_no()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
