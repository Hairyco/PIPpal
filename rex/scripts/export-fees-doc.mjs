import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const mdPath = path.join(root, 'docs', 'TRADING-FEES-AND-MARKETING-WALLET.md');
const md = fs.readFileSync(mdPath, 'utf8');
const body = marked.parse(md);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>CTOgo — Trading, Fees & Marketing Wallet</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; max-width: 820px; margin: 2rem auto; padding: 0 1.25rem 3rem; line-height: 1.55; color: #111; }
  h1,h2,h3,h4 { font-family: system-ui, -apple-system, Segoe UI, sans-serif; line-height: 1.25; }
  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.35rem; margin-top: 2rem; border-bottom: 2px solid #c8ff3d; padding-bottom: 0.35rem; }
  h3 { font-size: 1.1rem; margin-top: 1.4rem; }
  h4 { font-size: 1rem; margin-top: 1.1rem; }
  table { border-collapse: collapse; width: 100%; margin: 0.75rem 0 1.25rem; font-size: 0.92rem; font-family: system-ui, sans-serif; }
  th, td { border: 1px solid #ccc; padding: 0.45rem 0.55rem; text-align: left; vertical-align: top; }
  th { background: #f4f4f4; }
  blockquote { border-left: 4px solid #c8ff3d; margin: 1rem 0; padding: 0.5rem 1rem; background: #f7ffe8; }
  code, pre { font-family: ui-monospace, Consolas, monospace; font-size: 0.85rem; }
  pre { background: #111; color: #eaeaea; padding: 1rem; overflow-x: auto; border-radius: 8px; white-space: pre-wrap; }
  a { color: #0a7; }
  .toolbar { font-family: system-ui, sans-serif; background: #0a0c12; color: #fff; padding: 0.85rem 1.25rem; margin: 0 0 1.5rem; border-radius: 10px; display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; justify-content: space-between; }
  .toolbar button, .toolbar a { background: #c8ff3d; color: #090b14; border: 0; border-radius: 999px; padding: 0.5rem 1rem; font-weight: 700; font-size: 0.85rem; text-decoration: none; cursor: pointer; display: inline-block; }
  @media print { .toolbar { display: none; } body { margin: 0; max-width: none; } }
</style>
</head>
<body>
<div class="toolbar">
  <div><strong>CTOgo</strong> · Trading, fees & marketing wallet</div>
  <div>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
    <a href="./CTOgo-Trading-Fees-and-Marketing-Wallet.md" download>Download Markdown</a>
  </div>
</div>
${body}
</body>
</html>
`;

const publicDir = path.join(root, 'public', 'docs');
fs.mkdirSync(publicDir, { recursive: true });
const htmlName = 'CTOgo-Trading-Fees-and-Marketing-Wallet.html';
const mdName = 'CTOgo-Trading-Fees-and-Marketing-Wallet.md';
fs.writeFileSync(path.join(publicDir, htmlName), html);
fs.copyFileSync(mdPath, path.join(publicDir, mdName));

const downloads = path.join(process.env.USERPROFILE || '', 'Downloads');
if (downloads && fs.existsSync(downloads)) {
  fs.writeFileSync(path.join(downloads, htmlName), html);
  fs.copyFileSync(mdPath, path.join(downloads, mdName));
}

console.log('OK', path.join(publicDir, htmlName));
console.log('Downloads', path.join(downloads, htmlName));
