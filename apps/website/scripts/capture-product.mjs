// Captures the website's product shots (src/assets/product/*.webp) from the
// real Premium extension running on the website's own playground.
//
//   npm run build:premium      # the extension, into apps/extension/dist
//   npm run website:build      # the site, into apps/website/dist
//   npm run website:capture    # every shot; or: -- --only=hero,use-support
//
// First run only: `npx playwright install chromium` (extensions need
// Playwright's Chromium; branded Chrome no longer loads unpacked ones).
//
// How it works: a static server serves apps/website/dist; Chromium loads the
// unpacked extension with a paid Premium session planted in storage; each shot
// opens a playground sample, maximizes it, opens Capann, draws real marks with
// the real tools, and screenshots the sample. Mark positions below are for a
// 1280px window with the sample's top-left at (17, 54); `tools()` shifts them
// to wherever the sample actually is, so small layout changes don't move them.
// `captureVisibleTab` reads the real window, so the window is sized with
// --window-size and --force-device-scale-factor=2 instead of an emulated
// viewport (which leaves the bottom of every capture black).
import { chromium } from 'playwright'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const WEBSITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(WEBSITE, '../..')
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback
const EXTENSION = path.resolve(REPO, arg('extension', 'apps/extension/dist'))
const SITE = path.resolve(REPO, arg('site', 'apps/website/dist'))
const OUT = path.resolve(REPO, arg('out', 'apps/website/src/assets/product'))
const ONLY = arg('only', '')
const want = (name) => !ONLY || ONLY.split(',').includes(name)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const REF = { x: 17, y: 54 } // where coordinates below assume the sample's top-left is
const FRAME_HEIGHT = 690 // CSS px of the sample kept in each shot (above its rounded bottom)
const COLORS = { red: 'rgb(239, 68, 68)', yellow: 'rgb(250, 204, 21)', green: 'rgb(34, 197, 94)' }

function check() {
  const manifestPath = path.join(EXTENSION, 'manifest.json')
  if (!existsSync(manifestPath)) throw new Error(`No extension build at ${EXTENSION}. Run npm run build:premium.`)
  if (!JSON.parse(readFileSync(manifestPath, 'utf8')).externally_connectable)
    throw new Error('The extension build is the free edition. Run npm run build:premium.')
  if (!existsSync(path.join(SITE, 'index.html'))) throw new Error(`No website build at ${SITE}. Run npm run website:build.`)
}

// ── Server: the built site, plus /media/<file> with byte ranges ─────────────
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.webm': 'video/webm' }
const media = new Map()
function serveBytes(req, res, buf, type) {
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '')
  if (!range) {
    res.writeHead(200, { 'content-type': type, 'content-length': buf.length, 'accept-ranges': 'bytes' })
    return res.end(buf)
  }
  const start = range[1] ? Number(range[1]) : 0
  const end = range[2] ? Math.min(Number(range[2]), buf.length - 1) : buf.length - 1
  res.writeHead(206, { 'content-type': type, 'content-length': end - start + 1, 'content-range': `bytes ${start}-${end}/${buf.length}`, 'accept-ranges': 'bytes' })
  res.end(buf.subarray(start, end + 1))
}
async function serve() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x')
    if (url.pathname.startsWith('/media/')) {
      const buf = media.get(path.basename(url.pathname))
      if (!buf) {
        res.writeHead(404)
        return res.end()
      }
      return serveBytes(req, res, buf, 'video/webm')
    }
    let file = path.join(SITE, decodeURIComponent(url.pathname))
    if (!file.startsWith(SITE) || !existsSync(file) || statSync(file).isDirectory()) file = path.join(SITE, 'index.html')
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    res.end(readFileSync(file))
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  return { server, origin: `http://127.0.0.1:${server.address().port}` }
}

// ── Browser: Premium extension with a paid session ──────────────────────────
async function launch() {
  const id = [...createHash('sha256').update(EXTENSION).digest('hex').slice(0, 32)].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('')
  const ctx = await chromium.launchPersistentContext(mkdtempSync(path.join(tmpdir(), 'capann-capture-')), {
    channel: 'chromium',
    headless: true,
    viewport: null,
    args: [`--disable-extensions-except=${EXTENSION}`, `--load-extension=${EXTENSION}`, '--window-size=1280,940', '--force-device-scale-factor=2'],
  })
  const isOurs = (w) => w.url().startsWith(`chrome-extension://${id}/`)
  const sw = ctx.serviceWorkers().find(isOurs) ?? (await ctx.waitForEvent('serviceworker', { predicate: isOurs }))
  for (let i = 0; i < 50 && !(await sw.evaluate(() => Boolean(globalThis.chrome?.runtime?.onMessage))); i++) await sleep(100)
  await sw.evaluate(() => {
    globalThis.__downloads = []
    chrome.runtime.onMessage.addListener((m) => {
      if (m?.kind === 'download-png') globalThis.__downloads.push(m.dataUrl)
    })
    return chrome.storage.local.set({
      // checkedAt in the future: the worker never re-checks this fake token with the API.
      capann_session: { token: 't', email: 'you@example.com', paid: true, expiresAt: new Date(Date.now() + 9e9).toISOString(), checkedAt: Date.now() + 1e10 },
    })
  })
  return { ctx, sw, id }
}

// ── Page helpers ─────────────────────────────────────────────────────────────
const TAB = { feedback: 'Feedback', teach: 'Teaching', diagnose: 'Bug report' }
let shotCount = 0

/** Opens a playground sample (maximized unless told otherwise); returns the sample's rect. */
async function openSample(page, origin, which, { maximize = true } = {}) {
  await page.goto(`${origin}/playground?shot=${which}-${shotCount++}`, { waitUntil: 'load' })
  await sleep(500)
  await page.getByRole('tab', { name: TAB[which] }).click()
  if (maximize) {
    await page.getByRole('button', { name: 'Maximize sample' }).click()
    await sleep(700)
  }
  return page.evaluate(() => {
    const r = document.getElementById('pg-sample-panel').getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })
}

/** Opens Capann on this tab (the chooser), as the toolbar icon would. */
async function openCapann(page, sw) {
  const chooser = page.getByText('Draw and mark up this tab')
  const url = page.url()
  for (let i = 0; i < 25 && !(await chooser.isVisible()); i++) {
    await sw
      .evaluate(async (url) => {
        const [tab] = (await chrome.tabs.query({})).filter((t) => t.url === url)
        if (tab) await chrome.tabs.sendMessage(tab.id, { kind: 'toggle-capann-ui' })
      }, url)
      .catch(() => {})
    await sleep(400)
  }
  return chooser
}

/** Drawing helpers in reference coordinates (see the header). */
function tools(page, frame = { x: REF.x, y: REF.y }) {
  const dx = frame.x - REF.x
  const dy = frame.y - REF.y
  const at = (x, y) => [x + dx, y + dy]
  return {
    /** A sample element's box, in reference coordinates. */
    box: (text) =>
      page.evaluate(
        ([text, dx, dy]) => {
          const el = [...document.querySelectorAll('#pg-sample-panel *')].find((e) => e.children.length === 0 && e.textContent?.trim() === text)
          const b = el?.getBoundingClientRect()
          return b ? { x: b.x - dx, y: b.y - dy, w: b.width, h: b.height } : null
        },
        [text, dx, dy],
      ),
    tool: async (name) => {
      const button = page.getByRole('button', { name, exact: true })
      if ((await button.getAttribute('aria-pressed')) !== 'true') await button.click()
    },
    color: (rgb) =>
      page.evaluate((rgb) => {
        const root = document.getElementById('capann-host').shadowRoot
        ;[...root.querySelectorAll('button')].find((b) => b.style.background === rgb)?.click()
      }, rgb),
    size: async (value) => {
      const slider = page.getByRole('slider', { name: 'Size' })
      await slider.focus()
      await page.keyboard.press('Home')
      for (let i = 1; i < value; i++) await page.keyboard.press('ArrowRight')
    },
    drag: async (x1, y1, x2, y2, steps = 12) => {
      await page.mouse.move(...at(x1, y1))
      await page.mouse.down()
      await page.mouse.move(...at(x2, y2), { steps })
      await page.mouse.up()
      await sleep(200)
    },
    path: async (points) => {
      await page.mouse.move(...at(...points[0]))
      await page.mouse.down()
      for (const p of points.slice(1)) await page.mouse.move(...at(...p), { steps: 4 })
      await page.mouse.up()
      await sleep(200)
    },
    /** Comment (Comment tool) or free text (Text tool): click, type, Enter. */
    type: async (x, y, text) => {
      await page.mouse.click(...at(x, y))
      await sleep(300)
      await page.keyboard.type(text)
      await page.keyboard.press('Enter')
      await sleep(300)
    },
    click: (x, y) => page.mouse.click(...at(x, y)),
    move: (x, y) => page.mouse.move(...at(x, y), { steps: 6 }),
  }
}

/** Select tool, click empty page (deselect), then optionally hover a tool so the panel header previews it. */
async function settle(page, t, hoverTool) {
  await t.tool('Select')
  await t.click(160, 760)
  await sleep(200)
  if (hoverTool) await page.getByRole('button', { name: hoverTool, exact: true }).hover()
  else await page.mouse.move(1270, 790)
  await sleep(400)
}
async function closePanel(page) {
  await page.getByRole('button', { name: 'Close Capann' }).click()
  await sleep(500)
  await page.mouse.move(1270, 790)
}

// ── Output ──────────────────────────────────────────────────────────────────
let encoder
async function webp(png, { crop, width = 1600, quality = 0.84 } = {}) {
  const res = await encoder.evaluate(
    async ({ b64, crop, width, quality }) => {
      const img = new Image()
      img.src = `data:image/png;base64,${b64}`
      await img.decode()
      const [sx, sy, sw, sh] = crop ?? [0, 0, img.naturalWidth, img.naturalHeight]
      const w = Math.min(width, sw)
      const h = Math.round((sh * w) / sw)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d')
      g.imageSmoothingQuality = 'high'
      g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
      const blob = await new Promise((r) => c.toBlob(r, 'image/webp', quality))
      const bytes = new Uint8Array(await blob.arrayBuffer())
      let s = ''
      for (const b of bytes) s += String.fromCharCode(b)
      return { data: btoa(s), w, h }
    },
    { b64: png.toString('base64'), crop, width, quality },
  )
  return { buffer: Buffer.from(res.data, 'base64'), width: res.w, height: res.h }
}
async function save(name, png, options) {
  const out = await webp(png, options)
  writeFileSync(path.join(OUT, `${name}.webp`), out.buffer)
  console.log(`${name}.webp  ${out.width}x${out.height}  ${(out.buffer.length / 1024).toFixed(0)} KB`)
}
/** The sample's area of a full-page screenshot, at 2x. */
const sampleCrop = (frame) => [frame.x * 2, frame.y * 2, frame.width * 2, FRAME_HEIGHT * 2]

// ── Shots ────────────────────────────────────────────────────────────────────
async function markUp(ctx, sw, origin, which, draw, { panel = 'closed', hover } = {}) {
  const page = await ctx.newPage()
  const frame = await openSample(page, origin, which)
  await (await openCapann(page, sw)).click()
  await sleep(300)
  const t = tools(page, frame)
  await draw(t, page)
  await settle(page, t, hover)
  if (panel === 'closed') await closePanel(page)
  return { page, frame, t }
}

const SHOTS = {
  // Hero: the Northwind review with the panel open.
  hero: (env) =>
    markUp(env.ctx, env.sw, env.origin, 'feedback', async (t) => {
      await t.tool('Ellipse')
      await t.color(COLORS.yellow)
      await t.drag(584, 211, 926, 339)
      await t.tool('Arrow')
      await t.drag(520, 600, 712, 636)
      await t.tool('Comment')
      await t.type(684, 214, 'Up from 74%. Ship it?')
    }, { panel: 'open', hover: 'Comment' }),

  // Who it's for: one per audience, panel closed so the page and marks show.
  'use-founders': async ({ ctx, sw, origin }) => {
    const page = await ctx.newPage()
    const frame = await openSample(page, origin, 'feedback')
    await openCapann(page, sw)
    await page.getByText('Capture this tab with camera and audio').click()
    await page.getByRole('button', { name: 'Start recording' }).waitFor({ timeout: 10000 }).catch(() => {})
    await sleep(800)
    await shareStatus(sw, page.url(), '5b2e91c4', 12_600_000)
    await page.mouse.move(400, 700)
    await sleep(1000)
    return { page, frame }
  },
  'use-feedback': (env) =>
    markUp(env.ctx, env.sw, env.origin, 'feedback', async (t) => {
      await t.tool('Highlighter')
      await t.color(COLORS.yellow)
      await t.size(18)
      await t.drag(278, 199, 480, 199, 20)
      await t.size(4)
      await t.tool('Rectangle')
      await t.color(COLORS.red)
      await t.drag(272, 340, 1240, 704)
      await t.tool('Comment')
      await t.type(640, 640, 'Can the total sit next to Pay?')
    }),
  'use-consultants': (env) =>
    markUp(env.ctx, env.sw, env.origin, 'diagnose', async (t) => {
      await t.tool('Comment')
      await t.type(420, 262, 'Say how to fix it, not just what failed')
      await t.tool('Ellipse')
      await t.color(COLORS.yellow)
      await t.drag(40, 668, 440, 734)
      await t.tool('Comment')
      await t.type(446, 700, 'Only one of these should look primary')
    }),
  'use-teach': (env) =>
    markUp(env.ctx, env.sw, env.origin, 'teach', async (t) => {
      const heat = await t.box('Heat the water')
      await t.tool('Ellipse')
      await t.color(COLORS.red)
      await t.drag(heat.x - 40, heat.y - 18, heat.x + heat.w + 108, heat.y + heat.h + 18)
      await t.tool('Comment')
      await t.type(heat.x + 70, heat.y - 20, 'Start with step 1')
      await t.tool('Highlighter')
      await t.color(COLORS.yellow)
      await t.size(18)
      await t.drag(246, 536, 376, 536, 20)
      await t.size(4)
    }),
  'use-support': (env) =>
    markUp(env.ctx, env.sw, env.origin, 'feedback', async (t) => {
      await t.tool('Ellipse')
      await t.color(COLORS.green)
      await t.drag(708, 604, 1222, 666)
      await t.tool('Comment')
      await t.type(736, 516, 'Enter the new card, then press Pay')
    }),
  'use-agencies': (env) =>
    markUp(env.ctx, env.sw, env.origin, 'teach', async (t) => {
      await t.tool('Comment')
      await t.type(392, 152, 'Client: can this fit on one line?')
      await t.tool('Rectangle')
      await t.color(COLORS.red)
      await t.drag(50, 424, 708, 474)
      await t.tool('Comment')
      await t.type(706, 449, 'Make the steps clickable')
    }),

  // Feature deck.
  'deck-annotate': async (env) => {
    const shot = await markUp(env.ctx, env.sw, env.origin, 'teach', async (t) => {
      await t.tool('Pencil')
      await t.color(COLORS.red)
      const loop = []
      for (let a = 0; a <= Math.PI * 2.15; a += Math.PI / 14) loop.push([322 + 64 * Math.cos(a), 232 + 30 * Math.sin(a)])
      await t.path(loop)
      await t.tool('Text')
      await t.type(420, 205, 'Key idea')
    }, { panel: 'open', hover: 'Text' })
    await shot.t.tool('Text')
    await shot.t.move(800, 700)
    await sleep(300)
    return shot
  },
  'deck-attention': async ({ ctx, sw, origin }) => {
    const page = await ctx.newPage()
    const frame = await openSample(page, origin, 'feedback')
    await (await openCapann(page, sw)).click()
    const t = tools(page, frame)
    await t.tool('Spotlight')
    await t.move(700, 260)
    await sleep(500)
    return { page, frame }
  },
  'deck-screenshot': async ({ ctx, sw, origin }) => {
    const page = await ctx.newPage()
    const frame = await openSample(page, origin, 'feedback')
    await (await openCapann(page, sw)).click()
    const t = tools(page, frame)
    await t.tool('Ellipse')
    await t.color(COLORS.yellow)
    await t.drag(584, 211, 926, 339)
    await t.tool('Screenshot')
    await t.drag(268, 140, 1248, 712)
    await page.getByRole('button', { name: 'Save', exact: true }).waitFor({ timeout: 10000 })
    await t.tool('Arrow')
    await page.mouse.move(1270, 790)
    await sleep(600)
    return { page, frame }
  },
  'deck-record': async ({ ctx, sw, origin }) => {
    const page = await ctx.newPage()
    const frame = await openSample(page, origin, 'diagnose')
    await openCapann(page, sw)
    await page.getByText('Capture this tab with camera and audio').click()
    await page.getByRole('button', { name: 'Start recording' }).waitFor({ timeout: 10000 }).catch(() => {})
    await sleep(1200)
    return { page, frame }
  },
}

/** A finished share job, as the worker relays it to the page (Record view: "Link copied"). */
async function shareStatus(sw, url, id, size) {
  await sw.evaluate(
    async ({ url, id, size, now }) => {
      const [tab] = (await chrome.tabs.query({})).filter((t) => t.url === url)
      const link = { id, url: `https://api.capann.duowork.tech/r/${id}.webm`, size, uploadedAt: new Date(now).toISOString(), expiresAt: new Date(now + 7 * 86400e3).toISOString() }
      await chrome.tabs.sendMessage(tab.id, {
        kind: 'share-status',
        status: { sessionId: 'demo', filename: 'capann.webm', upload: { state: 'uploaded', link }, copy: 'skipped', done: true },
      })
    },
    { url, id, size, now: Date.now() },
  )
}

/** A short recording of marks scrolling with the lesson page, for the player shot. */
async function recordScrollingDemo({ ctx, sw, origin }) {
  const page = await ctx.newPage()
  await openSample(page, origin, 'teach', { maximize: false })
  await page.evaluate(() => {
    const el = document.getElementById('pg-sample-panel')
    window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 24, behavior: 'instant' })
  })
  await sleep(400)
  await (await openCapann(page, sw)).click()
  const t = tools(page, REF) // absolute page coordinates here
  const heat = await t.box('Heat the water')
  await t.tool('Ellipse')
  await t.color(COLORS.red)
  await t.drag(heat.x - 38, heat.y - 16, heat.x + heat.w + 120, heat.y + heat.h + 16)
  await t.tool('Arrow')
  await t.drag(heat.x + heat.w + 260, heat.y - 80, heat.x + heat.w + 132, heat.y - 4)
  await page.getByRole('button', { name: 'Arrow', exact: true }).click() // drawing off
  await page.mouse.move(640, 760)
  await sleep(400)
  const base = await page.evaluate(() => scrollY)
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
  const offsets = [...Array(18).fill(0), ...Array.from({ length: 42 }, (_, i) => 320 * ease((i + 1) / 42)), ...Array(18).fill(320), ...Array.from({ length: 42 }, (_, i) => 320 * (1 - ease((i + 1) / 42)))]
  const frames = []
  for (const dy of offsets) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), base + dy)
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    frames.push((await page.screenshot({ type: 'jpeg', quality: 90, scale: 'css' })).toString('base64'))
  }
  await page.close()
  const data = await encoder.evaluate(async (frames) => {
    const images = await Promise.all(
      frames.map(async (b64) => {
        const img = new Image()
        img.src = `data:image/jpeg;base64,${b64}`
        await img.decode()
        return img
      }),
    )
    const canvas = document.createElement('canvas')
    canvas.width = 1280
    canvas.height = Math.round((images[0].naturalHeight * 1280) / images[0].naturalWidth)
    const g = canvas.getContext('2d')
    g.drawImage(images[0], 0, 0, canvas.width, canvas.height)
    const recorder = new MediaRecorder(canvas.captureStream(30), { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 1_400_000 })
    const chunks = []
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.start()
    for (const img of images) {
      g.drawImage(img, 0, 0, canvas.width, canvas.height)
      await new Promise((r) => setTimeout(r, 1000 / 30))
    }
    await new Promise((r) => setTimeout(r, 200))
    const stopped = new Promise((r) => (recorder.onstop = r))
    recorder.stop()
    await stopped
    const bytes = new Uint8Array(await new Blob(chunks).arrayBuffer())
    let s = ''
    for (const b of bytes) s += String.fromCharCode(b)
    return btoa(s)
  }, frames)
  media.set('scrolling-marks.webm', Buffer.from(data, 'base64'))
}

/** The deck's Premium card: a shared recording playing in the Links tab's player. */
async function player(env) {
  if (!media.has('scrolling-marks.webm')) await recordScrollingDemo(env)
  const { ctx, sw, id } = env
  const now = Date.now()
  const links = ['8f3c2a71', 'c41d09be', '2e7f5a13'].map((linkId, i) => ({
    id: linkId,
    url: `https://api.capann.duowork.tech/r/${linkId}.webm`,
    size: [8_400_000, 23_100_000, 4_200_000][i],
    uploadedAt: new Date(now - [2, 26, 74][i] * 3600e3).toISOString(),
    expiresAt: new Date(now + 7 * 86400e3 - [2, 26, 74][i] * 3600e3).toISOString(),
  }))
  await sw.evaluate((links) => chrome.storage.local.set({ capann_links: links }), links)
  // The API isn't running: answer the signed-in list, and serve every link as the demo recording.
  await ctx.route('**/api/links/list', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ email: 'you@example.com', now: new Date(now).toISOString(), retentionSeconds: 604800, items: links.map((l) => ({ ...l, remainingSeconds: Math.round((Date.parse(l.expiresAt) - now) / 1000) })) }),
    }),
  )
  await ctx.route('https://api.capann.duowork.tech/r/*', (route) => route.fulfill({ status: 200, contentType: 'video/webm', body: media.get('scrolling-marks.webm') }))
  const panel = await ctx.newPage()
  await panel.goto(`chrome-extension://${id}/sidepanel.html#links`)
  await sleep(1200)
  await panel.getByRole('button', { name: 'Play' }).first().click()
  await panel.getByRole('dialog').waitFor()
  await sleep(2600)
  await panel.evaluate(() => document.querySelector('dialog video')?.pause())
  const png = await panel.screenshot({ clip: { x: 260, y: 120, width: 760, height: 520 } })
  await panel.close()
  await save('player', png, { width: 1520 })
}

/** "Why go Premium?": a screenshot framed by Capann's own Screenshot tool (default style). */
async function styledScreenshot({ ctx, sw, origin }) {
  const page = await ctx.newPage()
  const frame = await openSample(page, origin, 'feedback')
  await (await openCapann(page, sw)).click()
  const t = tools(page, frame)
  await t.tool('Ellipse')
  await t.color(COLORS.yellow)
  await t.drag(584, 211, 926, 339)
  await t.tool('Arrow')
  await t.drag(520, 600, 712, 636)
  await t.tool('Comment')
  await t.type(1186, 619, 'Make Pay stand out more?')
  await t.tool('Screenshot')
  await t.drag(268, 212, 1248, 712)
  await page.getByRole('button', { name: 'Save', exact: true }).waitFor({ timeout: 10000 })
  await sleep(600)
  const before = await sw.evaluate(() => globalThis.__downloads.length)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  let dataUrl = null
  for (let i = 0; i < 60 && !dataUrl; i++) {
    dataUrl = await sw.evaluate((n) => globalThis.__downloads[n] ?? null, before)
    await sleep(150)
  }
  await page.close()
  if (!dataUrl) throw new Error('styled-screenshot: no download')
  await save('styled-screenshot', Buffer.from(dataUrl.split(',')[1], 'base64'))
}

// ── Run ─────────────────────────────────────────────────────────────────────
check()
mkdirSync(OUT, { recursive: true })
const { server, origin } = await serve()
const { ctx, sw, id } = await launch()
encoder = await ctx.newPage()
await encoder.goto(`${origin}/encoder`)
const env = { ctx, sw, id, origin }
try {
  for (const [name, shoot] of Object.entries(SHOTS)) {
    if (!want(name)) continue
    const { page, frame } = await shoot(env)
    await save(name, await page.screenshot(), { crop: sampleCrop(frame) })
    await page.close()
  }
  if (want('player')) await player(env)
  if (want('styled-screenshot')) await styledScreenshot(env)
} finally {
  await ctx.close()
  server.close()
}
