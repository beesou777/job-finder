from html import escape
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "PROJECT_PROPOSAL.md"
OUTPUT = ROOT / "PROJECT_PROPOSAL.docx"


def xml_escape(text: str) -> str:
    return escape(text, quote=False)


def run(text: str, bold: bool = False, size: int = 24) -> str:
    bold_xml = "<w:b/>" if bold else ""
    return (
        "<w:r>"
        f"<w:rPr>{bold_xml}<w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/>"
        f"<w:sz w:val=\"{size}\"/><w:szCs w:val=\"{size}\"/></w:rPr>"
        f"<w:t xml:space=\"preserve\">{xml_escape(text)}</w:t>"
        "</w:r>"
    )


def paragraph(
    text: str = "",
    *,
    align: str = "both",
    bold: bool = False,
    size: int = 24,
    spacing: int = 360,
    before: int = 0,
    after: int = 160,
) -> str:
    return (
        "<w:p>"
        "<w:pPr>"
        f"<w:jc w:val=\"{align}\"/>"
        f"<w:spacing w:before=\"{before}\" w:after=\"{after}\" w:line=\"{spacing}\" w:lineRule=\"auto\"/>"
        "</w:pPr>"
        f"{run(text, bold=bold, size=size)}"
        "</w:p>"
    )


def page_break() -> str:
    return "<w:p><w:r><w:br w:type=\"page\"/></w:r></w:p>"


def numbered(text: str, level: int = 0) -> str:
    left = 720 + (level * 360)
    hanging = 360
    return (
        "<w:p>"
        "<w:pPr>"
        "<w:jc w:val=\"both\"/>"
        f"<w:ind w:left=\"{left}\" w:hanging=\"{hanging}\"/>"
        "<w:spacing w:after=\"120\" w:line=\"360\" w:lineRule=\"auto\"/>"
        "</w:pPr>"
        f"{run(text, size=24)}"
        "</w:p>"
    )


def table(rows: list[list[str]]) -> str:
    cols = len(rows[0]) if rows else 0
    cell_width = int(9000 / max(cols, 1))
    table_xml = [
        "<w:tbl>",
        "<w:tblPr><w:tblW w:w=\"0\" w:type=\"auto\"/>"
        "<w:jc w:val=\"center\"/>"
        "<w:tblBorders>"
        "<w:top w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"000000\"/>"
        "<w:left w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"000000\"/>"
        "<w:bottom w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"000000\"/>"
        "<w:right w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"000000\"/>"
        "<w:insideH w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"000000\"/>"
        "<w:insideV w:val=\"single\" w:sz=\"4\" w:space=\"0\" w:color=\"000000\"/>"
        "</w:tblBorders></w:tblPr>",
    ]
    for row_index, row in enumerate(rows):
        table_xml.append("<w:tr>")
        for cell in row:
            table_xml.append(
                "<w:tc>"
                f"<w:tcPr><w:tcW w:w=\"{cell_width}\" w:type=\"dxa\"/></w:tcPr>"
                + paragraph(cell, align="center" if row_index == 0 else "both", bold=row_index == 0, after=80)
                + "</w:tc>"
            )
        table_xml.append("</w:tr>")
    table_xml.append("</w:tbl>")
    table_xml.append(paragraph("", after=120))
    return "".join(table_xml)


def parse_markdown(md: str) -> str:
    body: list[str] = []

    body.append(paragraph("Project Proposal", align="center", bold=True, size=32, after=260))
    body.append(paragraph("Nepal Job Aggregator and Hiring Intelligence Platform", align="center", bold=True, size=28, after=520))
    body.append(paragraph("Course Title: Project III", align="center", size=24, after=120))
    body.append(paragraph("Course Code: CACS452", align="center", size=24, after=120))
    body.append(paragraph("Submitted By: ____________________", align="center", size=24, after=120))
    body.append(paragraph("Symbol No.: ____________________", align="center", size=24, after=120))
    body.append(paragraph("Submitted To: ____________________", align="center", size=24, after=120))
    body.append(paragraph("Date: ____________________", align="center", size=24, after=120))
    body.append(page_break())

    lines = md.splitlines()
    i = 0
    while i < len(lines):
        raw = lines[i].rstrip()
        line = raw.strip()
        if not line:
            i += 1
            continue

        if line == "# Project Proposal":
            i += 1
            continue

        if line.startswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            rows = []
            for table_line in table_lines:
                cells = [c.strip() for c in table_line.strip("|").split("|")]
                if all(set(c) <= {"-", ":", " "} for c in cells):
                    continue
                rows.append(cells)
            if rows:
                body.append(table(rows))
            continue

        if line.startswith("## "):
            body.append(paragraph(line[3:], align="left", bold=True, size=32, before=240, after=180))
        elif line.startswith("### "):
            body.append(paragraph(line[4:], align="left", bold=True, size=28, before=180, after=120))
        elif line[0:2].isdigit() and ". " in line[:4]:
            body.append(numbered(line))
        elif len(line) > 3 and line[0].isdigit() and line[1] == ".":
            body.append(numbered(line))
        elif line.startswith("["):
            body.append(paragraph(line, align="left", size=24, after=120))
        else:
            body.append(paragraph(line))
        i += 1

    return "".join(body)


def document_xml(body: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    {body}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1800" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>
"""


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""

RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""

DOCUMENT_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
"""

STYLES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>
"""

CORE = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Project Proposal</dc:title>
  <dc:subject>Nepal Job Aggregator and Hiring Intelligence Platform</dc:subject>
  <dc:creator>Codex</dc:creator>
</cp:coreProperties>
"""

APP = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Word</Application>
</Properties>
"""


def main() -> None:
    md = SOURCE.read_text(encoding="utf-8")
    body = parse_markdown(md)
    with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as docx:
        docx.writestr("[Content_Types].xml", CONTENT_TYPES)
        docx.writestr("_rels/.rels", RELS)
        docx.writestr("word/_rels/document.xml.rels", DOCUMENT_RELS)
        docx.writestr("word/document.xml", document_xml(body))
        docx.writestr("word/styles.xml", STYLES)
        docx.writestr("docProps/core.xml", CORE)
        docx.writestr("docProps/app.xml", APP)
    print(OUTPUT)


if __name__ == "__main__":
    main()
