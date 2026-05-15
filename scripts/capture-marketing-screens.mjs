/**
 * Starts a local Vite dev server, captures marketing PNGs, then stops the server.
 * Usage: node scripts/capture-marketing-screens.mjs
 *
 * Requires: npm install (playwright). Run once: npx playwright install chromium
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { spawn, execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { setTimeout as delay } from 'timers/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'public', 'marketing');
mkdirSync(outDir, { recursive: true });

const port = Number(process.env.CAPTURE_PORT || 5930);
const base = `http://127.0.0.1:${port}`;

function startVite() {
  const proc = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--port', String(port), '--host', '127.0.0.1', '--strictPort'],
    {
      cwd: root,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    },
  );
  return proc;
}

async function waitForServerReady() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) return;
    } catch {
      /* not ready */
    }
    await delay(250);
  }
  throw new Error(`Server at ${base} did not become ready in time`);
}

const viteProc = startVite();

viteProc.stderr?.on('data', (d) => {
  const s = d.toString();
  if (s.includes('error')) process.stderr.write(s);
});

try {
  await waitForServerReady();

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 780 },
  });
  page.setDefaultTimeout(60000);

  const shots = [
    ['screenshot=home', 'home-screen.png'],
    ['screenshot=answers_review', 'answers-prep-screen.png'],
    ['screenshot=draft_answer', 'draft-answer-screen.png'],
  ];

  for (const [query, file] of shots) {
    await page.goto(`${base}/?${query}`, { waitUntil: 'load' });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(outDir, file), fullPage: true });
    console.log('Wrote', join('public/marketing', file));
  }

  await browser.close();
} finally {
  if (process.platform === 'win32' && viteProc.pid) {
    try {
      execSync(`taskkill /F /T /PID ${viteProc.pid}`, { stdio: 'ignore' });
    } catch {
      /* process may already be gone */
    }
  } else {
    viteProc.kill('SIGTERM');
    await delay(300);
    try {
      viteProc.kill('SIGKILL');
    } catch {
      /* already exited */
    }
  }
}
