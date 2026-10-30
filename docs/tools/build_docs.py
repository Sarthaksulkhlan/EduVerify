"""Rebuild README diagrams and the PDF from the maintained Markdown report.

Install: python -m pip install -r docs/tools/requirements.txt
Run: python docs/tools/build_docs.py
Requires an installed Google Chrome, or Playwright Chromium.
"""

import re
from html import escape
from pathlib import Path

import markdown
from playwright.sync_api import Error as PlaywrightError
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "docs/assets"
DOWNLOADS = ROOT / "docs/downloads"
GREEN, GOLD, INK, MUTED = "#155b4b", "#ba914b", "#182f2b", "#5b6d65"


def text(x, y, value, size=18, color=INK, weight=400):
    return (
        f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" '
        f'font-weight="{weight}">{escape(value)}</text>'
    )


def box(x, y, w, h, title, lines, accent=GREEN):
    result = f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="#fffdf8" stroke="#d6dfd8"/>'
    result += f'<rect x="{x + 18}" y="{y + 20}" width="5" height="24" rx="2" fill="{accent}"/>'
    result += text(x + 34, y + 39, title, 21, INK, 700)
    for i, line in enumerate(lines):
        result += text(x + 20, y + 73 + i * 25, line, 16, MUTED)
    return result


def arrow(x1, y1, x2, y2):
    return f'<path d="M{x1} {y1} L{x2} {y2}" stroke="{GOLD}" stroke-width="3" fill="none" marker-end="url(#arrow)"/>'


def save_svg(name, height, title, body):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="{height}" viewBox="0 0 1200 {height}" role="img" aria-labelledby="title">
<title id="title">{escape(title)}</title>
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="{GOLD}"/></marker></defs>
<rect width="1200" height="{height}" rx="22" fill="#f5f2e9"/>
<g font-family="Segoe UI, Arial, sans-serif">{body}</g></svg>'''
    (ASSETS / name).write_text(svg, encoding="utf-8")


def diagrams():
    ASSETS.mkdir(parents=True, exist_ok=True)
    body = '<rect x="0" y="0" width="1200" height="355" rx="22" fill="#123e34"/>'
    body += '<circle cx="1080" cy="40" r="230" fill="none" stroke="#346455" stroke-width="2"/><circle cx="1080" cy="40" r="180" fill="none" stroke="#346455" stroke-width="2"/>'
    body += text(58, 61, "SIH26263  /  STUDENT DATA GOVERNANCE", 16, "#d6b87b", 600)
    body += text(55, 145, "EduVerify", 68, "#fffaf0", 700)
    body += text(58, 200, "Explainable student records.", 30, "#fffaf0", 500)
    body += text(58, 242, "Accountable verification.", 30, "#fffaf0", 500)
    body += text(
        58, 309, "INGEST  /  VALIDATE  /  REVIEW  /  VERIFY", 16, "#d6b87b", 600
    )
    body += text(910, 309, "SYNTHETIC PROTOTYPE", 15, "#d6b87b", 600)
    save_svg(
        "eduverify-banner.svg",
        355,
        "EduVerify: explainable student records, accountable verification",
        body,
    )

    body = text(40, 55, "From submitted records to scoped evidence", 30, INK, 700)
    body += text(
        40,
        87,
        "Implemented service capabilities · portal integration is incomplete",
        17,
        MUTED,
    )
    steps = [
        ("01  Import", ["Synthetic CSV", "Institution context"]),
        ("02  Validate", ["Explain row findings", "Protect identifiers"]),
        ("03  Commit", ["Recheck intake", "Persist eligible rows"]),
        ("04  Investigate", ["Masked candidates", "Human decisions"]),
    ]
    for i, (title, lines) in enumerate(steps):
        x = 40 + i * 295
        body += box(x, 125, 235, 133, title, lines)
        if i < 3:
            body += arrow(x + 240, 191, x + 280, 191)
    body += box(
        40,
        310,
        530,
        134,
        "05  Authorize and verify",
        [
            "Verifier grant + student consent + permitted claims",
            "Five-minute, audience-bound Ed25519 record check",
        ],
    )
    body += box(
        610,
        310,
        550,
        134,
        "Evidence boundaries",
        [
            "A duplicate candidate is not a fraud verdict.",
            "A signed record check is not official identity verification.",
        ],
        GOLD,
    )
    body += text(
        40,
        484,
        "Review and issuance are separate services; no universal review-to-issuance gate is asserted.",
        16,
        MUTED,
    )
    save_svg(
        "eduverify-workflow.svg",
        515,
        "EduVerify ingestion, validation, capacity, review and consent-scoped record-check workflow",
        body,
    )

    body = text(
        40, 55, "One interface. Two API modes. Distinct trust boundaries.", 29, INK, 700
    )
    body += text(
        40,
        87,
        "Local runtime shown; Vercel configuration routes /api requests directly to FastAPI.",
        17,
        MUTED,
    )
    body += box(
        40,
        125,
        330,
        147,
        "React frontend",
        [
            "Student + administration portals",
            "Same-origin /api/v1 client",
            "Some state remains browser-local",
        ],
    )
    body += box(
        435,
        125,
        330,
        147,
        "Express host / proxy",
        [
            "Vite in development",
            "Fixture mode or upstream proxy",
            "Live failures do not fall back",
        ],
    )
    body += arrow(375, 197, 422, 197)
    body += box(
        830,
        125,
        330,
        147,
        "Fixture API",
        [
            "Synthetic in-memory state",
            "Simulated sessions/signatures",
            "Resets when server restarts",
        ],
        GOLD,
    )
    body += arrow(771, 197, 817, 197)
    body += text(785, 180, "mock", 14, MUTED)
    body += box(
        435,
        350,
        330,
        172,
        "FastAPI services",
        [
            "Auth + tenant policies",
            "Ingestion + duplicate review",
            "Consent + Ed25519 checks",
            "Hash-linked audit writes",
        ],
    )
    body += arrow(600, 278, 600, 338)
    body += text(615, 316, "live", 15, MUTED)
    body += box(
        830,
        350,
        330,
        172,
        "PostgreSQL 16",
        [
            "Durable domain records",
            "Sessions, consent, credentials",
            "Five migration revisions",
            "Separate worker still planned",
        ],
    )
    body += arrow(771, 430, 817, 430)
    body += text(
        40,
        575,
        "Backend capabilities do not imply all portal screens are wired to them. No government integration is implemented.",
        16,
        MUTED,
    )
    save_svg(
        "eduverify-architecture.svg",
        610,
        "EduVerify local architecture with fixture and persistent backend modes",
        body,
    )


def report_pdf(browser):
    source = (ROOT / "docs/FEATURES-AND-USP.md").read_text(encoding="utf-8")
    content = markdown.markdown(source, extensions=["tables", "fenced_code"])

    def absolute_link(match):
        href = match.group(1)
        if href.startswith(("http:", "https:", "#")):
            return match.group(0)
        local = (ROOT / "docs" / href).resolve().relative_to(ROOT).as_posix()
        return f'href="https://github.com/Sarthaksulkhlan/EduVerify/blob/main/{local}"'

    content = re.sub(r'href="([^"]+)"', absolute_link, content)
    html = (
        """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>EduVerify — Feature and USP Analysis</title><style>
    @page { size: A4; margin: 20mm 17mm 20mm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #213b33; }
    h1 { font-size: 29pt; line-height: 1.15; margin: 14mm 0 8mm; color: #155b4b; }
    h2 { font-size: 17pt; margin-top: 10mm; border-top: 2px solid #ba914b; padding-top: 4mm; break-after: avoid; }
    h3 { font-size: 12pt; color: #155b4b; margin-top: 6mm; break-after: avoid; }
    p, li { orphans: 3; widows: 3; }
    a { color: #176a57; text-decoration: none; overflow-wrap: anywhere; }
    code { font-family: Consolas, monospace; font-size: 8.5pt; overflow-wrap: anywhere; }
    table { border-collapse: collapse; width: 100%; font-size: 8.3pt; margin: 5mm 0; table-layout: fixed; }
    th { background: #155b4b; color: white; text-align: left; }
    td, th { padding: 7px; border: 1px solid #d5ded7; vertical-align: top; overflow-wrap: anywhere; }
    tr { break-inside: avoid; } thead { display: table-header-group; }
    tr:nth-child(even) td { background: #f4f5ef; }
    strong { color: #173c30; } li { margin-bottom: 3mm; }
    </style></head><body>"""
        + content
        + "</body></html>"
    )
    page = browser.new_page()
    page.set_content(html, wait_until="load")
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    page.pdf(
        path=str(DOWNLOADS / "EduVerify-Features-and-USP.pdf"),
        format="A4",
        print_background=True,
        display_header_footer=True,
        header_template='<div style="font-size:8px;width:100%;margin:0 17mm;color:#65776d">EDUVERIFY / FEATURE &amp; USP ANALYSIS / 30 OCTOBER 2026</div>',
        footer_template='<div style="font-size:8px;width:100%;margin:0 17mm;color:#65776d">Synthetic prototype · Source snapshot 769ce2e <span style="float:right"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
    )
    page.close()


if __name__ == "__main__":
    diagrams()
    with sync_playwright() as playwright:
        try:
            browser = playwright.chromium.launch(channel="chrome", headless=True)
        except PlaywrightError:
            browser = playwright.chromium.launch(headless=True)
        report_pdf(browser)
        browser.close()
    print(
        "Generated three SVG diagrams and docs/downloads/EduVerify-Features-and-USP.pdf"
    )
