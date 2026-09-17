export const resumeLayouts = [
  { id: 'stockholm', name: 'Stockholm', description: 'Resume.io #1 Flagship · 2-Column with details sidebar, skill pills & clear timeline', columns: true },
  { id: 'dublin', name: 'Dublin', description: 'Resume.io Modern · Top accent band, career timeline dots, clean project badges', columns: false },
  { id: 'madrid', name: 'Madrid', description: 'Resume.io Bold · High-impact ATS single-column, bold section banners', columns: false },
  { id: 'vancouver', name: 'Vancouver', description: 'Resume.io Minimalist · Clean Nordic sans, airy margins, subtle rules', columns: false },
  { id: 'sydney', name: 'Sydney', description: 'Resume.io Executive · Navy masthead header with balanced 2-column grid', columns: true },
  // Backward-compatible aliases:
  { id: 'slate', name: 'Stockholm (Dark)', description: 'Resume.io Stockholm with dark contrast sidebar', columns: true },
  { id: 'modern', name: 'Modern Tech', description: 'Clean tech layout with link badges and skill pills', columns: false },
  { id: 'executive', name: 'Executive ATS', description: 'Classic single-column corporate layout', columns: false },
  { id: 'timeline', name: 'Tech Engineer', description: 'Silicon Valley standard with timeline connectors', columns: true },
  { id: 'editorial', name: 'Editorial Clean', description: 'Numbered sections and serif typography', columns: false },
] as const;

export type ResumeLayout = typeof resumeLayouts[number]['id'];

const headingsRegex = /^(professional summary|summary|8ummary|profile|about me|skills|8kill\s*8|technical skills|core competencies|experience|work experience|professional experience|employment history|education|academic background|projects|key projects|featured projects|personal projects|project8|languages|language8|professional links|links|certifications|references|awards|परिचय|सीपहरू|कार्य अनुभव|शिक्षा|परियोजनाहरू|भाषाहरू|व्यावसायिक लिङ्कहरू)\s*:?$/i;
const sideHeadingsRegex = /^(skills|8kill\s*8|technical skills|core competencies|languages|language8|professional links|links|certifications|references|awards|details|contact|सीपहरू|भाषाहरू|व्यावसायिक लिङ्कहरू)$/i;

function cleanHeading(title: string): string {
  const normalized = title.trim().replace(/:$/, '');
  const lower = normalized.toLowerCase();
  if (lower === '8ummary' || lower === 'summary') return 'Profile';
  if (lower === '8kill 8' || lower === '8kills' || lower === 'skills') return 'Skills';
  if (lower === 'experience' || lower === 'work experience') return 'Employment History';
  if (lower === 'project8' || lower === 'projects') return 'Projects';
  if (lower === 'language8' || lower === 'languages') return 'Languages';
  if (lower === 'education') return 'Education';
  if (lower === 'links' || lower === 'professional links') return 'Links';
  return normalized;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]!));
}

// Inline SVGs matching Resume.io icon style
const icons = {
  mail: `<svg class="cv-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  phone: `<svg class="cv-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  pin: `<svg class="cv-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  link: `<svg class="cv-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  github: `<svg class="cv-ico" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
  linkedin: `<svg class="cv-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28"/></svg>`,
};

/** Converts markdown links, raw URLs, emails, and bolding into safe, clickable HTML */
export function parseRichText(text: string): string {
  let escaped = escapeHtml(text);

  // Markdown links: [Label](url)
  escaped = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="cv-link">$1 <span class="cv-arrow">↗</span></a>'
  );

  // Raw URLs: https://... or http://... (not already in href)
  escaped = escaped.replace(
    /(?<!href=")(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="cv-link">$1 <span class="cv-arrow">↗</span></a>'
  );

  // GitHub without protocol
  escaped = escaped.replace(
    /(?<!href=")(?:www\.)?(github\.com\/[a-zA-Z0-9_\-\.\/]+)/g,
    `<a href="https://$1" target="_blank" rel="noopener noreferrer" class="cv-link cv-link-badge">${icons.github} $1 <span class="cv-arrow">↗</span></a>`
  );

  // LinkedIn without protocol
  escaped = escaped.replace(
    /(?<!href=")(?:www\.)?(linkedin\.com\/in\/[a-zA-Z0-9_\-\.\/]+)/g,
    `<a href="https://$1" target="_blank" rel="noopener noreferrer" class="cv-link cv-link-badge">${icons.linkedin} $1 <span class="cv-arrow">↗</span></a>`
  );

  // Emails
  escaped = escaped.replace(
    /(?<!href="mailto:)([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g,
    '<a href="mailto:$1" class="cv-link cv-email">$1</a>'
  );

  // Bold **text**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  escaped = escaped.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  return escaped;
}

/** Parses contact items and attaches appropriate icons */
function renderContactItemWithIcon(rawItem: string): string {
  const trimmed = rawItem.trim();
  const lower = trimmed.toLowerCase();

  // Email
  if (lower.includes('@') && !lower.includes('github') && !lower.includes('linkedin')) {
    return `<span class="cv-contact-item">${icons.mail} ${parseRichText(trimmed)}</span>`;
  }
  // Phone
  if (/(?:\+|phone|tel|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{10,}\b)/i.test(lower) && !lower.includes('http') && !lower.includes('github')) {
    return `<span class="cv-contact-item">${icons.phone} ${parseRichText(trimmed)}</span>`;
  }
  // GitHub
  if (lower.includes('github')) {
    return `<span class="cv-contact-item">${icons.github} ${parseRichText(trimmed)}</span>`;
  }
  // LinkedIn
  if (lower.includes('linkedin')) {
    return `<span class="cv-contact-item">${icons.linkedin} ${parseRichText(trimmed)}</span>`;
  }
  // Website / Link
  if (lower.startsWith('http') || lower.includes('.com') || lower.includes('.io') || lower.includes('.dev') || lower.includes('.net') || lower.includes('www.')) {
    return `<span class="cv-contact-item">${icons.link} ${parseRichText(trimmed)}</span>`;
  }
  // Location
  return `<span class="cv-contact-item">${icons.pin} ${parseRichText(trimmed)}</span>`;
}

/** Parses skills text into modern Resume.io style tags/chips */
function renderSkillsHtml(lines: string[]): string {
  const fullText = lines.join('\n').trim();
  if (!fullText) return '';

  const catLines = fullText.split('\n').filter(Boolean);
  const isCategorized = catLines.length > 1 && catLines.every((line) => line.includes(':'));

  if (isCategorized) {
    return `<div class="cv-skill-categories">${catLines.map((catLine) => {
      const idx = catLine.indexOf(':');
      const category = catLine.substring(0, idx).trim();
      const items = catLine.substring(idx + 1).split(',').map((s) => s.trim()).filter(Boolean);
      return `<div class="cv-skill-category-row">
        <div class="cv-skill-cat-title">${escapeHtml(category)}</div>
        <div class="cv-skill-tags">${items.map((item) => `<span class="cv-skill-pill">${parseRichText(item)}</span>`).join('')}</div>
      </div>`;
    }).join('')}</div>`;
  }

  const skills = fullText.split(/[,\n]/).map((s) => s.trim().replace(/^-\s*/, '')).filter(Boolean);
  return `<div class="cv-skill-tags">${skills.map((skill) => `<span class="cv-skill-pill">${parseRichText(skill)}</span>`).join('')}</div>`;
}

/** Parses experience, education, or project blocks in Resume.io style */
function renderEntryBlock(entryText: string): string {
  const lines = entryText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return '';

  const headerLine = lines[0] || '';
  const remaining = lines.slice(1);

  let dateLine = '';
  const bullets: string[] = [];
  const descriptionLines: string[] = [];

  for (let i = 0; i < remaining.length; i++) {
    const line = remaining[i];
    if (i === 0 && /(?:present|\d{4}|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b)/i.test(line) && !line.startsWith('-') && !line.startsWith('•')) {
      dateLine = line;
    } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      bullets.push(line.replace(/^[-•*]\s*/, ''));
    } else {
      descriptionLines.push(line);
    }
  }

  const parts = headerLine.split(/\s*\|\s*/);
  const primaryTitle = parts[0] || '';
  const secondaryMeta = parts.slice(1).join(' · ');

  return `
    <div class="cv-entry">
      <div class="cv-entry-header">
        <div class="cv-entry-title-group">
          <span class="cv-entry-title">${parseRichText(primaryTitle)}</span>
          ${secondaryMeta ? `<span class="cv-entry-subtitle">${parseRichText(secondaryMeta)}</span>` : ''}
        </div>
        ${dateLine ? `<div class="cv-entry-date">${parseRichText(dateLine)}</div>` : ''}
      </div>
      ${descriptionLines.length ? `<div class="cv-entry-desc">${descriptionLines.map((l) => `<p>${parseRichText(l)}</p>`).join('')}</div>` : ''}
      ${bullets.length ? `<ul class="cv-entry-bullets">${bullets.map((b) => `<li>${parseRichText(b)}</li>`).join('')}</ul>` : ''}
    </div>
  `;
}

function renderSectionHtml(section: { title: string; lines: string[] }): string {
  const cleaned = cleanHeading(section.title);
  const lower = cleaned.toLowerCase();

  let bodyHtml = '';
  if (lower.includes('skill')) {
    bodyHtml = renderSkillsHtml(section.lines);
  } else if (lower.includes('history') || lower.includes('experience') || lower.includes('project') || lower.includes('education')) {
    const rawEntries = section.lines.join('\n').trim().split(/\n\s*\n/).filter(Boolean);
    bodyHtml = rawEntries.map(renderEntryBlock).join('');
  } else {
    const rawParagraphs = section.lines.join('\n').trim().split(/\n\s*\n/).filter(Boolean);
    bodyHtml = rawParagraphs.map((para) => {
      const lines = para.split('\n');
      const hasBullets = lines.some((l) => l.trim().startsWith('-') || l.trim().startsWith('•'));
      if (hasBullets) {
        return `<ul class="cv-entry-bullets">${lines.map((l) => `<li>${parseRichText(l.replace(/^[-•*]\s*/, ''))}</li>`).join('')}</ul>`;
      }
      return `<p class="cv-paragraph">${parseRichText(para).replace(/\n/g, '<br>')}</p>`;
    }).join('');
  }

  return `
    <section class="cv-section cv-section-${escapeHtml(lower.replace(/\s+/g, '-'))}">
      <h2 class="cv-section-title"><span>${escapeHtml(cleaned)}</span></h2>
      <div class="cv-section-content">${bodyHtml}</div>
    </section>
  `;
}

function parseHeader(introLines: string[], letter: boolean) {
  const cleanLine = (l: string) => l.trim().replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '');
  const nonBlank = introLines.map(cleanLine).filter(Boolean);
  if (!nonBlank.length) return { name: '', role: '', contactItems: [] as string[], letterBody: [] as string[] };

  const emailRegex = /([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/;
  const phoneRegex = /(?:\+|phone|tel|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{10,}\b)/i;
  const linkRegex = /(?:https?:\/\/|github\.com|linkedin\.com|\[.+\]\(.+\))/i;
  const isContact = (str: string) => emailRegex.test(str) || phoneRegex.test(str) || linkRegex.test(str);

  if (letter) {
    const name = nonBlank[0] || '';
    let contactLineIdx = -1;
    for (let i = 1; i < nonBlank.length; i++) {
      if (isContact(nonBlank[i])) {
        contactLineIdx = i;
        break;
      }
    }
    const contactItems = contactLineIdx !== -1
      ? nonBlank[contactLineIdx].split(/[|\n]/).map((s) => s.trim()).filter(Boolean)
      : [];
    const bodyStartIdx = contactLineIdx !== -1 ? contactLineIdx + 1 : 1;
    const letterBody = nonBlank.slice(bodyStartIdx);
    return { name, role: '', contactItems, letterBody };
  }

  // Check if everything is squeezed into 1 line or piped
  if (nonBlank.length === 1 && (isContact(nonBlank[0]) || nonBlank[0].includes('|'))) {
    const single = nonBlank[0];
    const emailMatch = single.match(emailRegex);
    if (emailMatch && emailMatch.index !== undefined) {
      const before = single.substring(0, emailMatch.index).trim();
      const after = single.substring(emailMatch.index).trim();
      const contactItems = after.split(/[|\n]/).map((s) => s.trim()).filter(Boolean);

      if (before.includes('|')) {
        const p = before.split('|').map((s) => s.trim()).filter(Boolean);
        return { name: p[0] || '', role: p.slice(1).join(' · '), contactItems, letterBody: [] };
      }

      const roleMatch = before.match(
        /\b(full\s*stack|frontend|backend|software|web|mobile|devops|cloud|data|ui\/ux|product|project|qa|lead|senior|junior|intern)?\s*(developer|engineer|designer|architect|lead|manager|specialist|consultant|analyst|officer|intern)\b/i
      );
      if (roleMatch && roleMatch.index !== undefined && roleMatch.index > 0) {
        return {
          name: before.substring(0, roleMatch.index).trim(),
          role: before.substring(roleMatch.index).trim(),
          contactItems,
          letterBody: [],
        };
      }
      return { name: before, role: '', contactItems, letterBody: [] };
    }

    // Split by pipe
    const segments = single.split('|').map((s) => s.trim()).filter(Boolean);
    const name = segments[0] || '';
    let role = '';
    const contactItems: string[] = [];
    for (let i = 1; i < segments.length; i++) {
      if (!role && !isContact(segments[i]) && i === 1) {
        role = segments[i];
      } else {
        contactItems.push(segments[i]);
      }
    }
    return { name, role, contactItems, letterBody: [] };
  }

  // Multi-line header (single newlines or double newlines)
  let name = nonBlank[0] || '';
  let role = '';
  let contactLines: string[] = [];

  if (name.includes('|')) {
    const p = name.split('|').map((s) => s.trim()).filter(Boolean);
    name = p[0] || '';
    role = p.slice(1).join(' · ');
    contactLines = nonBlank.slice(1);
  } else if (nonBlank.length > 1) {
    if (isContact(nonBlank[1])) {
      contactLines = nonBlank.slice(1);
    } else {
      role = nonBlank[1];
      contactLines = nonBlank.slice(2);
    }
  }

  const contactItems = contactLines
    .flatMap((l) => l.split(/[|\n]/))
    .map((s) => s.trim())
    .filter(Boolean);

  return { name, role, contactItems, letterBody: [] };
}

/** Preserves all input lines; unknown headings stay with their surrounding section. */
export function renderResumeLayout(text: string, layout: ResumeLayout, letter = false): string {
  const lines = text.replace(/\r/g, '').split('\n');
  const introduction: string[] = [];
  const sections: { title: string; lines: string[] }[] = [];

  for (const line of lines) {
    if (!letter && headingsRegex.test(line.trim())) {
      sections.push({ title: cleanHeading(line.trim()), lines: [] });
    } else if (sections.length) {
      sections[sections.length - 1].lines.push(line);
    } else {
      introduction.push(line);
    }
  }

  const { name, role, contactItems, letterBody } = parseHeader(introduction, letter);

  // Resume.io Layout classification
  const isStockholm = layout === 'stockholm' || layout === 'slate';
  const isSydney = layout === 'sydney';
  const isDublin = layout === 'dublin' || layout === 'timeline';
  const isMadrid = layout === 'madrid';
  const isVancouver = layout === 'vancouver' || layout === 'editorial';

  const isColumns = !letter && (isStockholm || isSydney);

  const contactBarHtml = contactItems.length ? `
    <div class="cv-contact-bar">
      ${contactItems.map(renderContactItemWithIcon).join('')}
    </div>
  ` : '';

  // Sydney displays contact items in the navy header masthead.
  // Single-column templates (Dublin, Madrid, Vancouver) and Letter display it in the header.
  // Stockholm and Slate display it in the sidebar under "Details".
  const showContactInHeader = !letter ? (isSydney || !isColumns) : true;
  const showContactInSidebar = isStockholm;

  let bodyHtml = '';
  if (letter) {
    const letterParagraphs = letterBody && letterBody.length > 0
      ? letterBody
      : introduction.filter(Boolean).slice(2);
    bodyHtml = `<main class="cv-letter-body">${letterParagraphs.map((part) => `<p>${parseRichText(part).replace(/\n/g, '<br>')}</p>`).join('')}</main>`;
  } else if (isColumns) {
    const sideSections = sections.filter((s) => sideHeadingsRegex.test(s.title));
    const mainSections = sections.filter((s) => !sideHeadingsRegex.test(s.title));

    bodyHtml = `
      <div class="cv-columns">
        <aside class="cv-aside">
          ${showContactInSidebar && contactItems.length ? `
            <section class="cv-section cv-section-details">
              <h2 class="cv-section-title"><span>Details</span></h2>
              <div class="cv-sidebar-contact">
                ${contactItems.map(renderContactItemWithIcon).join('')}
              </div>
            </section>
          ` : ''}
          ${sideSections.map(renderSectionHtml).join('')}
        </aside>
        <main class="cv-main">
          ${mainSections.map(renderSectionHtml).join('')}
        </main>
      </div>
    `;
  } else {
    bodyHtml = `
      <main class="cv-main-single">
        ${sections.map(renderSectionHtml).join('')}
      </main>
    `;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <title>${escapeHtml(name)} — ${letter ? 'Cover letter' : 'Resume'}</title>
  <style>
    *, *:before, *:after { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eaedf2;
      color: #1e2532;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.8pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    article {
      width: 210mm;
      min-height: 297mm;
      margin: 20px auto;
      background: #ffffff;
      padding: 16mm 18mm;
      overflow-wrap: break-word;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    /* Header */
    header { padding-bottom: 4mm; }
    h1 {
      margin: 0;
      font-size: 24pt;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.4px;
      color: #0f172a;
      text-transform: none;
    }
    .cv-role {
      margin-top: 2mm;
      font-size: 11.5pt;
      font-weight: 600;
      color: #1a91f0;
      letter-spacing: 0.2px;
    }

    /* Resume.io Inline SVG Icons */
    .cv-ico {
      width: 13px;
      height: 13px;
      vertical-align: middle;
      display: inline-block;
      margin-right: 4px;
      flex-shrink: 0;
      color: #64748b;
    }

    /* Contact Bar */
    .cv-contact-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2.5mm 5mm;
      font-size: 8.8pt;
      color: #475569;
      margin-top: 3mm;
      padding-bottom: 3.5mm;
      border-bottom: 1px solid #e2e8f0;
    }
    .cv-contact-item {
      display: inline-flex;
      align-items: center;
      gap: 1.5px;
    }

    /* Links */
    a.cv-link {
      color: #1a91f0;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s;
    }
    a.cv-link:hover { text-decoration: underline; color: #0b69c7; }
    .cv-arrow { font-size: 8pt; opacity: 0.8; margin-left: 1px; }
    .cv-link-badge {
      display: inline-flex;
      align-items: center;
      background: #f0f7ff;
      border: 1px solid #bae0fd;
      color: #0b69c7;
      padding: 1.5px 7px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: 600;
      margin-left: 2px;
    }

    /* Sections */
    .cv-section { margin-bottom: 5.5mm; break-inside: avoid; }
    .cv-section-title {
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 1.5mm;
      margin: 0 0 3.5mm 0;
      display: flex;
      align-items: center;
    }

    /* Entries (Experience, Education, Projects) */
    .cv-entry { margin-bottom: 3.8mm; break-inside: avoid; }
    .cv-entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 2mm;
      margin-bottom: 1mm;
    }
    .cv-entry-title-group { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2mm; }
    .cv-entry-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .cv-entry-subtitle {
      font-size: 9.5pt;
      font-weight: 600;
      color: #475569;
    }
    .cv-entry-date {
      font-size: 8.5pt;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
    }
    .cv-entry-desc {
      font-size: 9pt;
      color: #334155;
      margin: 1mm 0;
    }
    .cv-entry-desc p { margin: 0 0 1mm 0; }

    /* Bullets */
    .cv-entry-bullets {
      margin: 1.5mm 0 0 0;
      padding-left: 4.5mm;
      font-size: 9.2pt;
      line-height: 1.55;
      color: #334155;
    }
    .cv-entry-bullets li {
      margin-bottom: 1mm;
      padding-left: 1mm;
    }
    .cv-paragraph {
      margin: 0 0 2mm 0;
      font-size: 9.2pt;
      line-height: 1.6;
      color: #334155;
    }

    /* Skills - Resume.io Pill Style */
    .cv-skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5mm 2mm;
      margin-top: 1mm;
    }
    .cv-skill-pill {
      display: inline-block;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #1e293b;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 8.5pt;
      font-weight: 600;
    }
    .cv-skill-categories { display: flex; flex-direction: column; gap: 2.5mm; }
    .cv-skill-category-row { font-size: 9pt; }
    .cv-skill-cat-title { color: #0f172a; font-weight: 700; margin-bottom: 1mm; font-size: 8.8pt; }

    /* Two Columns */
    .cv-columns {
      display: grid;
      grid-template-columns: 33% 1fr;
      gap: 8mm;
    }
    .cv-aside { font-size: 8.8pt; }
    .cv-aside .cv-section-title { font-size: 9.2pt; }
    .cv-sidebar-contact { display: flex; flex-direction: column; gap: 2.5mm; font-size: 8.8pt; }
    .cv-sidebar-contact .cv-contact-item { word-break: break-all; }
    .cv-main { min-width: 0; }

    /* =========================================================
       RESUME.IO TEMPLATES SPECIFIC STYLES
       ========================================================= */

    /* 1. STOCKHOLM (Resume.io #1 Template) */
    .stockholm header { border-bottom: 2px solid #0f172a; padding-bottom: 4.5mm; margin-bottom: 6mm; }
    .stockholm h1 { font-size: 24pt; font-weight: 800; letter-spacing: -0.3px; color: #0f172a; }
    .stockholm .cv-role { color: #1a91f0; font-size: 11.5pt; font-weight: 600; margin-top: 2mm; }
    .stockholm .cv-section-title {
      border-bottom: 1.5px solid #0f172a;
      color: #0f172a;
    }
    .stockholm .cv-skill-pill {
      background: #f8fafc;
      border-color: #cbd5e1;
      color: #0f172a;
    }
    .stockholm .cv-sidebar-contact {
      display: flex;
      flex-direction: column;
      gap: 2.5mm;
      font-size: 8.8pt;
      color: #334155;
    }
    .stockholm .cv-sidebar-contact .cv-contact-item {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      word-break: break-all;
    }
    .stockholm .cv-sidebar-contact .cv-ico {
      margin-top: 2px;
      flex-shrink: 0;
      color: #1a91f0;
    }

    /* 2. DUBLIN (Resume.io Modern Classic) */
    .dublin { padding-top: 18mm; }
    .dublin:before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4.5mm;
      background: #1a91f0;
    }
    .dublin header { padding-bottom: 2mm; margin-bottom: 5mm; }
    .dublin h1 { font-size: 24pt; font-weight: 800; color: #0f172a; }
    .dublin .cv-role { color: #1a91f0; font-size: 11.5pt; font-weight: 600; margin-top: 1.5mm; }
    .dublin .cv-contact-bar {
      margin-top: 3mm;
      padding-bottom: 3.5mm;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .dublin .cv-section-title {
      border-bottom: 2px solid #1a91f0;
      color: #0f172a;
    }
    .dublin .cv-main-single {
      border-left: 2px solid #e2e8f0;
      padding-left: 6mm;
      margin-left: 2mm;
    }
    .dublin .cv-section-employment-history .cv-entry,
    .dublin .cv-section-projects .cv-entry {
      position: relative;
    }
    .dublin .cv-section-employment-history .cv-entry:before,
    .dublin .cv-section-projects .cv-entry:before {
      content: '';
      position: absolute;
      left: -8.1mm;
      top: 1.5mm;
      width: 3.2mm;
      height: 3.2mm;
      background: #1a91f0;
      border-radius: 50%;
    }

    /* 3. MADRID (Resume.io Bold ATS Single-Column) */
    .madrid header { padding-bottom: 2mm; margin-bottom: 5mm; }
    .madrid h1 { font-size: 26pt; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; }
    .madrid .cv-role {
      color: #1a91f0;
      font-size: 11.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 1.5mm;
    }
    .madrid .cv-contact-bar {
      margin-top: 3mm;
      padding-bottom: 3.5mm;
      border-bottom: 2px solid #0f172a;
    }
    .madrid .cv-section-title {
      background: #0f172a;
      color: #ffffff;
      padding: 1.8mm 3mm;
      border-radius: 4px;
      border-bottom: none;
      letter-spacing: 1px;
    }
    .madrid .cv-skill-pill {
      background: #e2e8f0;
      border: none;
      font-weight: 600;
    }

    /* 4. VANCOUVER (Resume.io Minimalist Nordic) */
    .vancouver header { text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 5mm; margin-bottom: 6mm; }
    .vancouver h1 { font-size: 23pt; font-weight: 700; letter-spacing: 0.8px; color: #1e293b; text-align: center; }
    .vancouver .cv-role { text-align: center; color: #64748b; font-size: 11pt; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2mm; }
    .vancouver .cv-contact-bar {
      justify-content: center;
      border-bottom: none;
      padding-bottom: 0;
      margin-top: 3mm;
    }
    .vancouver .cv-section-title {
      border-bottom: 1px solid #cbd5e1;
      color: #334155;
    }

    /* 5. SYDNEY (Resume.io Executive) */
    .sydney { padding: 0; }
    .sydney header {
      background: #0f172a;
      color: #ffffff;
      padding: 12mm 16mm 8mm;
    }
    .sydney h1 {
      color: #ffffff;
      font-size: 24pt;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .sydney .cv-role {
      color: #60a5fa;
      font-size: 12pt;
      font-weight: 600;
      margin-top: 2mm;
    }
    .sydney header .cv-contact-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 3mm 6mm;
      margin-top: 4mm;
      padding-bottom: 0;
      border-bottom: none;
      font-size: 8.8pt;
      color: #cbd5e1;
    }
    .sydney header .cv-contact-bar .cv-ico {
      color: #93c5fd;
    }
    .sydney header .cv-contact-bar a.cv-link {
      color: #93c5fd;
    }
    .sydney header .cv-contact-bar a.cv-link:hover {
      color: #ffffff;
    }
    .sydney .cv-columns {
      padding: 6mm 16mm 14mm;
      gap: 8mm;
    }
    .sydney .cv-aside {
      background: #f8fafc;
      padding: 5mm 5mm;
      border-radius: 6px;
    }

    /* 6. SLATE ALIAS (Stockholm Dark) */
    .slate { padding: 0; }
    .slate header { padding: 12mm 15mm 6mm 15mm; border-bottom: 1px solid #e2e8f0; }
    .slate h1 { font-size: 24pt; font-weight: 800; color: #0f172a; }
    .slate .cv-role { color: #1a91f0; font-size: 11.5pt; font-weight: 600; margin-top: 1.5mm; }
    .slate .cv-columns { gap: 0; min-height: 250mm; }
    .slate aside {
      background: #0f172a;
      color: #e2e8f0;
      padding: 8mm 6mm;
    }
    .slate aside h1, .slate aside h2, .slate aside strong { color: #ffffff; }
    .slate aside .cv-section-title { border-color: #334155; color: #94a3b8; }
    .slate aside .cv-skill-pill {
      background: #1e293b;
      border-color: #334155;
      color: #f8fafc;
    }
    .slate aside a.cv-link { color: #60a5fa; }
    .slate aside .cv-sidebar-contact {
      color: #cbd5e1;
    }
    .slate aside .cv-sidebar-contact .cv-ico {
      color: #60a5fa;
    }
    .slate main { padding: 8mm 10mm; }

    /* Cover Letter */
    .letter { padding: 20mm 22mm; }
    .letter header { text-align: left; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 4mm; margin-bottom: 6mm; }
    .letter h1 { font-size: 22pt; font-weight: 700; color: #0f172a; }
    .letter .cv-contact-bar { margin-top: 2.5mm; padding-bottom: 0; border-bottom: none; color: #64748b; }
    .letter .cv-letter-body p { margin-bottom: 4mm; font-size: 10pt; line-height: 1.6; color: #1e293b; }

    /* Print styling */
    @page { size: A4; margin: 8mm; }
    @media print {
      body { background: #ffffff !important; }
      article {
        width: 100% !important;
        min-height: auto !important;
        margin: 0 !important;
        padding: 4mm 6mm !important;
        box-shadow: none !important;
      }
      .slate aside, .sydney header, .dublin:before, .madrid .cv-section-title { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .cv-entry, .cv-section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <article class="${letter ? 'letter' : layout}">
    <header>
      <h1>${parseRichText(name)}</h1>
      ${role ? `<div class="cv-role">${parseRichText(role)}</div>` : ''}
      ${showContactInHeader ? contactBarHtml : ''}
    </header>
    ${bodyHtml}
  </article>
</body>
</html>`;
}
