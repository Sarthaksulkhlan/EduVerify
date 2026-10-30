# Documentation assets

- `eduverify-banner.svg`: original editable vector banner, using the project's green/gold palette.
- `eduverify-workflow.svg`: service-capability diagram; does not imply complete UI integration or a universal review gate.
- `eduverify-architecture.svg`: current local runtime, separating fixture memory from FastAPI/PostgreSQL.
- `eduverify-home.png`: actual 1440 × 1000 browser capture of [the public website](https://eduverify-eight.vercel.app/) on 30 October 2026. No authenticated session or personal record was used.
- `weave-hero.svg`: previous project banner retained for historical references.

The new SVGs are code-generated vector assets, not application screenshots. Their source and PDF exporter are in [build_docs.py](../tools/build_docs.py). The Markdown report is the maintained source for the PDF.

## Rebuild

```bash
python -m pip install -r docs/tools/requirements.txt
python docs/tools/build_docs.py
```

The exporter uses installed Google Chrome, or Playwright Chromium (`python -m playwright install chromium`). Documentation tools are separate from application dependencies. Rebuilding does not recapture the public website. Refresh the screenshot separately when the design changes, and update its capture date in the README. Review PDF pagination after report edits; the PDF turns source links into GitHub links for standalone reading.
