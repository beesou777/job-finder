export const resumeLayouts = [
  { id: 'executive', name: 'Executive', description: 'Centered header, full-width sections', columns: false },
  { id: 'timeline', name: 'Timeline', description: 'Contact sidebar and career timeline', columns: true },
  { id: 'slate', name: 'Slate', description: 'Dark sidebar with a spacious main column', columns: true },
  { id: 'editorial', name: 'Editorial', description: 'Serif heading and numbered sections', columns: false },
  { id: 'modern', name: 'Modern', description: 'Navy masthead and compact skills rail', columns: true },
] as const;
export type ResumeLayout = typeof resumeLayouts[number]['id'];

const headings = /^(professional summary|summary|profile|about me|skills|technical skills|experience|work experience|education|projects|languages|professional links|links|certifications|references|awards|परिचय|सीपहरू|कार्य अनुभव|शिक्षा|परियोजनाहरू|भाषाहरू|व्यावसायिक लिङ्कहरू)\s*:?$/i;
const sideHeadings = /^(skills|technical skills|languages|professional links|links|certifications|references|awards|सीपहरू|भाषाहरू|व्यावसायिक लिङ्कहरू)$/i;
const escape = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Preserves all input lines; unknown headings stay with their surrounding section. */
export function renderResumeLayout(text: string, layout: ResumeLayout, letter = false): string {
  const lines = text.replace(/\r/g, '').split('\n');
  const introduction: string[] = [];
  const sections: { title: string; lines: string[] }[] = [];
  for (const line of lines) {
    if (!letter && headings.test(line.trim())) sections.push({ title: line.trim().replace(/:$/, ''), lines: [] });
    else if (sections.length) sections[sections.length - 1].lines.push(line);
    else introduction.push(line);
  }
  const header = introduction.join('\n').split(/\n\s*\n/).filter((part) => part.trim());
  const name = header.shift() || '';
  const role = letter ? '' : header.shift() || '';
  const contact = letter ? '' : header.join('\n');
  const format = (value: string) => escape(value).replace(/\n/g, '<br>');
  const sectionHtml = (section: { title: string; lines: string[] }) => `<section><h2>${escape(section.title)}</h2>${section.lines.join('\n').trim().split(/\n\s*\n/).filter(Boolean).map((part) => `<div class="entry">${format(part)}</div>`).join('')}</section>`;
  const split = !letter && resumeLayouts.find((item) => item.id === layout)?.columns;
  const contactHtml = contact ? `<section class="contact"><h2>Contact</h2><div class="entry">${format(contact.replace(/\s*\|\s*/g, '\n'))}</div></section>` : '';
  const body = letter ? `<main>${header.map((part) => `<p>${format(part)}</p>`).join('')}</main>` : split
    ? `<div class="columns"><aside>${contactHtml}${sections.filter((section) => sideHeadings.test(section.title)).map(sectionHtml).join('')}</aside><main>${sections.filter((section) => !sideHeadings.test(section.title)).map(sectionHtml).join('')}</main></div>`
    : `<div class="contactline">${format(contact)}</div><main>${sections.map(sectionHtml).join('')}</main>`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escape(name)} — ${letter ? 'Cover letter' : 'CV'}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#e9edf2;color:#27313e;font:11pt/1.5 Arial,'Nirmala UI',sans-serif}article{width:210mm;min-height:297mm;margin:auto;background:white;padding:17mm;overflow-wrap:anywhere}header{padding-bottom:8mm}h1{margin:0;font-size:29pt;line-height:1.12;letter-spacing:-.7px}.role{margin-top:3mm;font-size:13pt;color:#52606d}h2{font-size:10pt;letter-spacing:1.7px;text-transform:uppercase;border-bottom:1px solid #89939c;padding-bottom:2mm;margin:0 0 4mm}section{margin-bottom:7mm}.entry{margin-bottom:4mm;orphans:3;widows:3}main{min-width:0}p{orphans:3;widows:3}.columns{display:grid;grid-template-columns:30% 1fr;gap:9mm}aside{font-size:9pt;min-width:0}.contactline{font-size:9pt;border-bottom:1px solid #89939c;padding-bottom:5mm;margin-bottom:6mm}header,h2{break-after:avoid}.entry{break-inside:avoid}
  .executive header{text-align:center}.executive h1{text-transform:uppercase;font-size:27pt}.executive .contactline{text-align:center}.executive section{margin-bottom:8mm}
  .timeline header{border-bottom:2px solid #6b7c8c;margin-bottom:7mm}.timeline main{border-left:1px solid #8e9ba7;padding-left:6mm}.timeline main h2{position:relative}.timeline main h2:before{content:'';position:absolute;width:2mm;height:2mm;background:#344353;border-radius:50%;left:-7.1mm;top:2mm}
  .slate{padding:0}.slate header{padding:17mm 15mm 10mm 75mm}.slate .columns{gap:0;grid-template-columns:32% 1fr;min-height:245mm}.slate aside{background:#303c4e;color:white;padding:9mm 7mm}.slate aside h2{border-color:#a5b1c0}.slate main{padding:9mm}.slate h1{color:#303c4e}
  .editorial h1{font:32pt Georgia,serif}.editorial header{border-bottom:3px solid #27313e}.editorial .contactline{padding-top:4mm}.editorial main{counter-reset:section}.editorial h2:before{counter-increment:section;content:counter(section,decimal-leading-zero) ' / ';color:#7a858d}.editorial h2{font-size:11pt;letter-spacing:1px}
  .modern header{background:#18364b;color:white;margin:-17mm -17mm 9mm;padding:14mm 17mm}.modern .role{color:#d8e5ed}.modern aside{background:#f0f4f7;padding:5mm}.modern main h2{color:#18364b;border-bottom:2px solid #18364b}.letter header{text-align:left}.letter main{display:block;padding:0}.letter{padding:20mm}
  @page{size:A4;margin:12mm}@media print{body{background:white}article{width:auto;min-height:0;margin:0;padding:5mm;box-shadow:none}.slate header{padding:8mm}.slate .columns{min-height:0}.modern header{margin:0 0 8mm;padding:8mm}aside,header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><article class="${letter ? 'executive letter' : layout}"><header><h1>${format(name)}</h1>${role ? `<div class="role">${format(role)}</div>` : ''}</header>${body}</article></body></html>`;
}
