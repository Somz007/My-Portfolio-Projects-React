/**
 * build.mjs — assembles the combined GitHub Pages bundle.
 * ─────────────────────────────────────────────────────────────────
 * Projects 1–3 are independent Vite apps. This script:
 *   1. Builds each one (npm run build → its own dist/)
 *   2. Copies each build into the root dist/<project>/ folder
 *   3. Generates a landing page (dist/index.html) linking to all three
 *
 * Project 4 (Flask) is server-side Python and cannot run on GitHub
 * Pages — it's listed on the landing page as "source only" with a link
 * to its folder.
 *
 * Run with:  npm run build
 * Deploy with: npm run deploy   (build + gh-pages -d dist)
 */
import { execSync } from 'node:child_process'
import { existsSync, rmSync, mkdirSync, cpSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const DIST      = join(ROOT, 'dist')

/* Vite projects to build and deploy. */
const VITE_PROJECTS = [
  { dir: 'project-01-tmdb-movie-app', name: 'TMDB Movie App' },
  { dir: 'project-02-github-jobs-app', name: 'GitHub Jobs App' },
  { dir: 'project-03-photo-gallery',  name: 'Photo Gallery' },
]

/** Run a shell command in a given directory, streaming output. */
function run(cmd, cwd) {
  console.log(`\n→ ${cmd}  (in ${cwd.replace(ROOT, '.')})`)
  execSync(cmd, { cwd, stdio: 'inherit' })
}

/* ── 1. Clean the output directory ──────────────────────────────── */
console.log('Cleaning dist/ …')
rmSync(DIST, { recursive: true, force: true })
mkdirSync(DIST, { recursive: true })

/* ── 2. Build each Vite project and copy into dist/<project>/ ────── */
for (const project of VITE_PROJECTS) {
  const projectPath = join(ROOT, project.dir)

  // Install dependencies only if node_modules is missing (keeps re-runs fast).
  if (!existsSync(join(projectPath, 'node_modules'))) {
    run('npm install', projectPath)
  }

  run('npm run build', projectPath)

  // Copy the project's build output into the combined dist folder.
  cpSync(join(projectPath, 'dist'), join(DIST, project.dir), { recursive: true })
  console.log(`✓ ${project.dir} → dist/${project.dir}/`)
}

/* ── 3. Generate the landing page ───────────────────────────────── */
writeFileSync(join(DIST, 'index.html'), landingPage(), 'utf8')
console.log('\n✓ Landing page written to dist/index.html')
console.log('✓ Build complete. Deploy with: npm run deploy\n')

/**
 * Returns the HTML for the portfolio landing page.
 * Self-contained — inline CSS, no external build step.
 */
function landingPage() {
  const cards = [
    {
      href: 'project-01-tmdb-movie-app/',
      num: '01',
      title: 'TMDB Movie App',
      desc: 'Search and browse movies with a slide-in detail panel, cast, and ratings.',
      stack: ['React 18', 'Vite', 'TMDB API', 'CSS Modules'],
      accent: '#E8C87A',
    },
    {
      href: 'project-02-github-jobs-app/',
      num: '02',
      title: 'DevJobs Board',
      desc: 'Remote developer job board with live filters and client-side pagination.',
      stack: ['React 18', 'Vite', 'Remotive API', 'DOMPurify'],
      accent: '#58A6FF',
    },
    {
      href: 'project-03-photo-gallery/',
      num: '03',
      title: 'Luminary Gallery',
      desc: 'Upload photos to a real-time masonry grid with Google sign-in and a lightbox.',
      stack: ['React 18', 'Firebase', 'Cloudinary', 'Vite'],
      accent: '#E85D26',
    },
  ]

  const cardHtml = cards.map((c) => `
      <a class="card" href="${c.href}" style="--accent:${c.accent}">
        <span class="num">${c.num}</span>
        <h2>${c.title}</h2>
        <p>${c.desc}</p>
        <div class="stack">${c.stack.map((s) => `<span>${s}</span>`).join('')}</div>
        <span class="go">View live →</span>
      </a>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Portfolio — Somz007</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0B0B12;
      --surface: #14141F;
      --border: #24243A;
      --text: #ECEAF4;
      --muted: #7C7C97;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Space Grotesk', system-ui, sans-serif;
      min-height: 100vh;
      line-height: 1.6;
      background-image: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(120,90,220,0.10), transparent 70%);
    }
    .wrap { max-width: 1100px; margin: 0 auto; padding: 80px 24px 64px; }
    header { margin-bottom: 56px; }
    .eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
      color: var(--muted); margin-bottom: 16px;
    }
    h1 { font-size: clamp(32px, 6vw, 52px); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; }
    .lede { color: var(--muted); font-size: 17px; margin-top: 16px; max-width: 560px; }
    .links { margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; }
    .links a {
      font-family: 'JetBrains Mono', monospace; font-size: 13px;
      color: var(--text); text-decoration: none;
      border: 1px solid var(--border); border-radius: 8px;
      padding: 8px 16px; transition: border-color .2s, background .2s;
    }
    .links a:hover { border-color: var(--muted); background: var(--surface); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .card {
      position: relative; display: flex; flex-direction: column;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 28px; text-decoration: none; color: inherit;
      transition: transform .25s cubic-bezier(0.16,1,0.3,1), border-color .25s;
      overflow: hidden;
    }
    .card::before {
      content: ''; position: absolute; inset: 0 0 auto 0; height: 3px;
      background: var(--accent); opacity: 0; transition: opacity .25s;
    }
    .card:hover { transform: translateY(-4px); border-color: var(--accent); }
    .card:hover::before { opacity: 1; }
    .num {
      font-family: 'JetBrains Mono', monospace; font-size: 13px;
      color: var(--accent); font-weight: 500;
    }
    .card h2 { font-size: 21px; font-weight: 700; margin: 12px 0 8px; }
    .card p { color: var(--muted); font-size: 14px; flex: 1; }
    .stack { display: flex; flex-wrap: wrap; gap: 6px; margin: 18px 0 16px; }
    .stack span {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: var(--muted); border: 1px solid var(--border);
      border-radius: 999px; padding: 3px 10px;
    }
    .go { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--accent); font-weight: 500; }
    .flask {
      grid-column: 1 / -1; display: flex; align-items: center; gap: 16px;
      background: transparent; border: 1px dashed var(--border);
      border-radius: 16px; padding: 20px 28px; color: var(--muted); font-size: 14px;
    }
    .flask strong { color: var(--text); font-weight: 500; }
    .flask a { color: #6FA8FF; text-decoration: none; }
    footer {
      margin-top: 56px; padding-top: 24px; border-top: 1px solid var(--border);
      color: var(--muted); font-family: 'JetBrains Mono', monospace; font-size: 13px;
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }
    footer a { color: var(--text); text-decoration: none; }
    footer a:hover { color: var(--muted); }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <p class="eyebrow">React Portfolio</p>
      <h1>Four projects in React,<br>Firebase & Flask.</h1>
      <p class="lede">
        A movie browser, a job board, a real-time photo gallery, and a full-stack
        blog — each built to explore a different corner of modern web development.
      </p>
      <div class="links">
        <a href="https://github.com/Somz007/My-Portfolio-Projects-React" target="_blank" rel="noopener">GitHub Repo</a>
        <a href="https://github.com/Somz007" target="_blank" rel="noopener">@Somz007</a>
      </div>
    </header>

    <main class="grid">
${cardHtml}
      <div class="flask">
        <span style="font-size:22px">🐍</span>
        <div>
          <strong>Project 04 — Flask Microblog</strong> is a Python/Flask server app and
          can't run on GitHub Pages.
          <a href="https://github.com/Somz007/My-Portfolio-Projects-React/tree/main/project-04-flask-microblog" target="_blank" rel="noopener">View the source & run instructions →</a>
        </div>
      </div>
    </main>

    <footer>
      <span>Built by Semeshan</span>
      <a href="https://github.com/Somz007" target="_blank" rel="noopener">github.com/Somz007</a>
    </footer>
  </div>
</body>
</html>
`
}
