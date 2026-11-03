const fs = require('fs');
const path = require('path');

function generateHtml(mdPath, outPath, lang = 'en', title = 'SLT LegalEdge - Definitive System Manual') {
  let md = fs.readFileSync(mdPath, 'utf8');

  function renderMarkdown(content) {
    const lines = content.split('\n');
    let inTable = false;
    let inMermaid = false;
    let mermaidCode = [];
    let html = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Mermaid code block start
      if (line.trim().startsWith('```mermaid')) {
        inMermaid = true;
        mermaidCode = [];
        continue;
      }
      if (inMermaid) {
        if (line.trim().startsWith('```')) {
          inMermaid = false;
          html.push(`<div class="mermaid-container"><pre class="mermaid">${mermaidCode.join('\n')}</pre></div>`);
          continue;
        }
        mermaidCode.push(line);
        continue;
      }

      // Skip generic code fences
      if (line.trim().startsWith('```')) {
        continue;
      }

      // Images
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const caption = imgMatch[1];
        const relPath = imgMatch[2];
        const absPath = path.resolve(path.dirname(mdPath), relPath);
        let imgSrc = relPath;

        if (fs.existsSync(absPath)) {
          const ext = path.extname(absPath).slice(1);
          const b64 = fs.readFileSync(absPath).toString('base64');
          imgSrc = `data:image/${ext};base64,${b64}`;
        }

        html.push(`
          <div class="img-container">
            <img src="${imgSrc}" alt="${caption}" />
            <div class="caption">📸 ${caption}</div>
          </div>
        `);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        html.push(`<h1>${line.slice(2)}</h1>`);
        continue;
      }
      if (line.startsWith('## ')) {
        html.push(`<h2>${line.slice(3)}</h2>`);
        continue;
      }
      if (line.startsWith('### ')) {
        html.push(`<h3>${line.slice(4)}</h3>`);
        continue;
      }
      if (line.startsWith('#### ')) {
        html.push(`<h4>${line.slice(5)}</h4>`);
        continue;
      }

      // Horizontal Rule
      if (line.trim() === '---') {
        html.push('<hr/>');
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        html.push(`<blockquote>${line.slice(2)}</blockquote>`);
        continue;
      }

      // Tables
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (!inTable) {
          inTable = true;
          html.push('<table>');
          const headers = line.split('|').filter(c => c.trim().length > 0).map(c => `<th>${c.trim()}</th>`).join('');
          html.push(`<thead><tr>${headers}</tr></thead><tbody>`);
          i++; // skip separator line |:---|:---|
          continue;
        } else {
          const cols = line.split('|').filter(c => c.trim().length > 0).map(c => `<td>${c.trim()}</td>`).join('');
          html.push(`<tr>${cols}</tr>`);
          continue;
        }
      } else if (inTable) {
        inTable = false;
        html.push('</tbody></table>');
      }

      // List items
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        html.push(`<li>${line.trim().slice(2)}</li>`);
        continue;
      }

      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        html.push(`<li><strong>${numMatch[1]}.</strong> ${numMatch[2]}</li>`);
        continue;
      }

      // Paragraph
      if (line.trim().length > 0) {
        html.push(`<p>${line}</p>`);
      }
    }

    if (inTable) html.push('</tbody></table>');

    let finalHtml = html.join('\n');

    // Inline formatting
    finalHtml = finalHtml
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

    return finalHtml;
  }

  const rendered = renderMarkdown(md);

  const fullHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    });
  </script>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans Sinhala", sans-serif;
      line-height: 1.75;
      color: #1e293b;
      background: #0b1329;
      margin: 0;
      padding: 30px 15px;
    }
    .wrapper {
      max-width: 980px;
      margin: 0 auto;
      background: #ffffff;
      padding: 50px 60px;
      border-radius: 16px;
      box-shadow: 0 12px 50px rgba(0,0,0,0.35);
    }
    h1 {
      color: #0f172a;
      font-size: 28px;
      border-bottom: 3px solid #0284c7;
      padding-bottom: 14px;
      margin-top: 0;
      line-height: 1.3;
    }
    h2 {
      color: #0369a1;
      font-size: 22px;
      margin-top: 42px;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 10px;
    }
    h3 {
      color: #0284c7;
      font-size: 18px;
      margin-top: 30px;
    }
    h4 {
      color: #334155;
      font-size: 16px;
      margin-top: 22px;
    }
    blockquote {
      background: #f0f9ff;
      border-left: 5px solid #0284c7;
      margin: 20px 0;
      padding: 14px 22px;
      color: #0369a1;
      border-radius: 0 8px 8px 0;
      font-size: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 26px 0;
      font-size: 14px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 12px 14px;
      text-align: left;
    }
    th {
      background: #0284c7;
      color: #ffffff;
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    tr:hover {
      background: #f1f5f9;
    }
    code {
      background: #f1f5f9;
      color: #0284c7;
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 13px;
      font-family: Consolas, monospace;
      border: 1px solid #e2e8f0;
    }
    .img-container {
      margin: 30px 0;
      text-align: center;
      background: #0f172a;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.18);
    }
    .img-container img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      display: block;
      margin: 0 auto;
      border: 1px solid #334155;
    }
    .caption {
      margin-top: 12px;
      font-size: 13px;
      color: #94a3b8;
      font-weight: 500;
      letter-spacing: 0.3px;
    }
    .mermaid-container {
      margin: 24px 0;
      background: #f8fafc;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    li {
      margin-bottom: 8px;
    }
    hr {
      border: 0;
      height: 1px;
      background: #cbd5e1;
      margin: 36px 0;
    }
    a {
      color: #0284c7;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }
    .action-bar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 24px;
    }
    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.4);
      transition: background 0.2s ease;
    }
    .btn-print:hover {
      background: #0369a1;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .wrapper {
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .action-bar {
        display: none;
      }
      .img-container {
        background: white;
        padding: 0;
        box-shadow: none;
      }
      .img-container img {
        border: 1px solid #ccc;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="action-bar">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
    ${rendered}
  </div>
</body>
</html>`;

  fs.writeFileSync(outPath, fullHtml);
  console.log(`Generated: ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
}

// 1. Sinhala Manual
const siMd = path.join(__dirname, '../docs/SLT_LegalEdge_Definitive_System_Manual_SI.md');
const siHtml = path.join(__dirname, '../docs/SLT_LegalEdge_Definitive_System_Manual_SI.html');
generateHtml(siMd, siHtml, 'si', 'SLT LegalEdge - Definitive System Manual (නිරූපණ අත්පොත)');

// 2. English Manual
const enMd = path.join(__dirname, '../docs/SLT_LegalEdge_Definitive_System_Manual_EN.md');
const enHtml = path.join(__dirname, '../docs/SLT_LegalEdge_Definitive_System_Manual_EN.html');
generateHtml(enMd, enHtml, 'en', 'SLT LegalEdge - Definitive System Manual (English Edition)');
