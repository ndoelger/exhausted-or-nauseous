# Curriculum pack

Full course materials for building **Exhausted or Nauseous** (Expo 56 + Supabase).

| File | Purpose |
|------|---------|
| `Exhausted-or-Nauseous-Full-Curriculum-Pack.md` | Editable source (recommended for diffs) |
| `Exhausted-or-Nauseous-Full-Curriculum-Pack.pdf` | Print / share version |
| `generate_curriculum_pdf.py` | Regenerate the PDF from the markdown |

## Regenerate the PDF

```bash
# one-time: python3 -m venv .venv-curriculum && .venv-curriculum/bin/pip install fpdf2
.venv-curriculum/bin/python curriculum/generate_curriculum_pdf.py
```

Companion syllabus UI: Cursor canvas `lesson-plan.canvas.tsx` (same section/lecture IDs).
