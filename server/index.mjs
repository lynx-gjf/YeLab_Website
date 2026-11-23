import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import express from 'express'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import { DatabaseSync } from 'node:sqlite'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(rootDir, 'data')
const uploadsDir = path.join(rootDir, 'uploads')
const databaseFile = path.join(dataDir, 'website.sqlite')

fs.mkdirSync(dataDir, { recursive: true })
fs.mkdirSync(uploadsDir, { recursive: true })

const publicAssetsDir = path.join(rootDir, 'public', 'assets')
if (fs.existsSync(publicAssetsDir)) {
  for (const name of fs.readdirSync(publicAssetsDir)) {
    const source = path.join(publicAssetsDir, name)
    const target = path.join(uploadsDir, name)
    if (fs.statSync(source).isFile() && !fs.existsSync(target)) {
      fs.copyFileSync(source, target)
    }
  }
}

const db = new DatabaseSync(databaseFile)
db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS page_content (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    years TEXT NOT NULL DEFAULT '',
    group_name TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS publications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT NOT NULL DEFAULT '',
    journal TEXT NOT NULL DEFAULT '',
    year INTEGER,
    doi_url TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'article',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    link_url TEXT NOT NULL DEFAULT '',
    published_at TEXT,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

const secretFile = path.join(dataDir, 'session.secret')
let sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  if (fs.existsSync(secretFile)) {
    sessionSecret = fs.readFileSync(secretFile, 'utf8').trim()
  } else {
    sessionSecret = crypto.randomBytes(48).toString('base64url')
    fs.writeFileSync(secretFile, sessionSecret, { mode: 0o600 })
  }
}

const username = (process.env.ADMIN_USERNAME || 'admin').trim()
const configuredPassword = process.env.ADMIN_PASSWORD
const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count

if (userCount === 0) {
  const password = configuredPassword || crypto.randomBytes(18).toString('base64url')
  const passwordHash = bcrypt.hashSync(password, 12)
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash)
  if (!configuredPassword) {
    console.warn(`[admin] Initial account: ${username}`)
    console.warn(`[admin] Initial password: ${password}`)
    console.warn('[admin] Store this password securely and set ADMIN_PASSWORD for subsequent starts.')
  }
} else if (configuredPassword) {
  const passwordHash = bcrypt.hashSync(configuredPassword, 12)
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, existing.id)
  } else {
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, passwordHash)
  }
}

const defaultContent = {
  home: { heroTitle: 'Welcome to The Ye Group', heroText: '', researchAreas: [], highlights: [] },
  members: { title: 'Group Members', lead: '', groups: [] },
  publications: { title: 'Publications', lead: '', items: [] },
  'prof-ye': { title: 'Prof. Xinshan Ye', lead: '', sections: [] },
  contact: { title: 'Contact Us', lead: '', address: '', telephone: '', email: '', office: '' },
}

const contentInsert = db.prepare(`
  INSERT OR IGNORE INTO page_content (key, value) VALUES (?, ?)
`)
for (const [key, value] of Object.entries(defaultContent)) {
  contentInsert.run(key, JSON.stringify(value))
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&middot;/g, '·')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
}

function seedPublicationsFromVue() {
  const existingCount = db.prepare('SELECT COUNT(*) AS count FROM publications').get().count
  if (existingCount >= 150) return
  const vueFile = path.join(rootDir, 'src', 'Publications.vue')
  if (!fs.existsSync(vueFile)) return
  const source = fs.readFileSync(vueFile, 'utf8')
  const blocks = [...source.matchAll(/<div class="year-block[^"]*" id="y(\d{4})"[^>]*>([\s\S]*?)<\/ol>\s*<\/div>/g)]
  const insert = db.prepare(`
    INSERT INTO publications (title, authors, journal, year, doi_url, category, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  let imported = 0
  if (existingCount > 0) db.prepare('DELETE FROM publications').run()
  for (const block of blocks) {
    const year = Number(block[1])
    const body = block[2]
    const items = [...body.matchAll(/<li>([\s\S]*?)<\/li>/g)]
    items.forEach((item, index) => {
      const html = item[1]
      const titleMatch = html.match(/<span class="ptitle">(.*?)<\/span>/s)
      const journalMatch = html.match(/<span class="pj">(.*?)<\/span>/s)
      const doiMatch = html.match(/<a class="pdoi" href="([^"]+)"/)
      if (!titleMatch) return
      const title = decodeHtml(titleMatch[1]).trim()
      const journal = decodeHtml(journalMatch?.[1] || '').trim()
      const authorsHtml = html
        .replace(titleMatch[0], '')
        .replace(journalMatch?.[0] || '', '')
        .replace(/<span class="pnum">.*?<\/span>/s, '')
      const authors = decodeHtml(authorsHtml)
        .replace(/<br>\s*/gi, ' ')
        .replace(/DOI.*/gi, '')
        .replace(/\s+/g, ' ')
        .replace(/^,\s*/, '')
        .trim()
      insert.run(title, authors, journal, year, doiMatch?.[1] || '', 'article', index)
      imported += 1
    })
  }
  if (imported > 0) console.log(`[migration] Imported ${imported} publications into SQLite`)
}

seedPublicationsFromVue()

if (db.prepare('SELECT COUNT(*) AS count FROM members').get().count === 0) {
  db.prepare(`
    INSERT INTO members (name, role, years, group_name, photo_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'Xinshan Ye',
    'Professor / PI',
    '',
    'Principal Investigator',
    '/uploads/prof-ye.png',
    0,
  )
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))
app.use((req, res, next) => {
  const allowedOrigin = process.env.PUBLIC_ORIGIN
  if (allowedOrigin && req.headers.origin && req.headers.origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use('/uploads', express.static(uploadsDir, {
  immutable: true,
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
}))

function sign(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('base64url')
}

function createSession(user) {
  const expiresAt = Date.now() + (12 * 60 * 60 * 1000)
  const payload = Buffer.from(JSON.stringify({
    uid: user.id,
    username: user.username,
    exp: expiresAt,
  })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function readCookies(header = '') {
  const cookies = {}
  for (const pair of header.split(';')) {
    const [rawName, ...rawValue] = pair.trim().split('=')
    if (!rawName) continue
    cookies[rawName] = decodeURIComponent(rawValue.join('='))
  }
  return cookies
}

function getSession(req) {
  const token = readCookies(req.headers.cookie).admin_session
  if (!token) return null
  const separator = token.lastIndexOf('.')
  if (separator < 1) return null
  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = sign(payload)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null
  }
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!session.uid || session.exp < Date.now()) return null
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(session.uid)
    return user?.username === session.username ? user : null
  } catch {
    return null
  }
}

function requireAuth(req, res, next) {
  const user = getSession(req)
  if (!user) return res.status(401).json({ error: 'Authentication required' })
  req.user = user
  next()
}

function parseContent(value) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: 'sqlite' })
})

app.post('/api/auth/login', (req, res) => {
  const usernameValue = typeof req.body?.username === 'string' ? req.body.username.trim() : ''
  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!usernameValue || !password) {
    return res.status(400).json({ error: 'Username and password are required' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(usernameValue)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const token = createSession(user)
  res.setHeader('Set-Cookie', [
    `admin_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${12 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  ].join(', '))
  res.json({ username: user.username })
})

app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', `admin_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)
  res.json({ ok: true })
})

app.get('/api/auth/me', (req, res) => {
  const user = getSession(req)
  if (!user) return res.status(401).json({ authenticated: false })
  res.json({ authenticated: true, username: user.username })
})

app.get('/api/content/:key', (req, res) => {
  const key = req.params.key.replace(/[^a-z0-9-]/gi, '').slice(0, 64)
  const row = db.prepare('SELECT key, value, updated_at FROM page_content WHERE key = ?').get(key)
  if (!row) return res.status(404).json({ error: 'Content not found' })
  res.json({ key: row.key, value: parseContent(row.value), updatedAt: row.updated_at })
})

app.get('/api/content', requireAuth, (_req, res) => {
  const rows = db.prepare('SELECT key, value, updated_at FROM page_content ORDER BY key').all()
  res.json(rows.map(row => ({
    key: row.key,
    value: parseContent(row.value),
    updatedAt: row.updated_at,
  })))
})

app.put('/api/content/:key', requireAuth, (req, res) => {
  const key = req.params.key.replace(/[^a-z0-9-]/gi, '').slice(0, 64)
  if (!key || req.body === undefined) {
    return res.status(400).json({ error: 'A valid key and value are required' })
  }
  const value = typeof req.body === 'object' && 'value' in req.body ? req.body.value : req.body
  db.prepare(`
    INSERT INTO page_content (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now')
  `).run(key, JSON.stringify(value))
  res.json({ key, value })
})

app.get('/api/members', (_req, res) => {
  const rows = db.prepare('SELECT * FROM members ORDER BY sort_order, id').all()
  res.json(rows)
})

app.post('/api/members', requireAuth, (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  if (!name) return res.status(400).json({ error: 'Member name is required' })
  const result = db.prepare(`
    INSERT INTO members (name, role, years, group_name, photo_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    name,
    String(req.body.role || ''),
    String(req.body.years || ''),
    String(req.body.groupName || req.body.group_name || ''),
    String(req.body.photoUrl || req.body.photo_url || ''),
    Number.isFinite(Number(req.body.sortOrder ?? req.body.sort_order)) ? Number(req.body.sortOrder ?? req.body.sort_order) : 0,
  )
  res.status(201).json(db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid))
})

app.put('/api/members/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Member not found' })
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : existing.name
  if (!name) return res.status(400).json({ error: 'Member name is required' })
  db.prepare(`
    UPDATE members SET
      name = ?,
      role = ?,
      years = ?,
      group_name = ?,
      photo_url = ?,
      sort_order = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name,
    String(req.body.role ?? existing.role),
    String(req.body.years ?? existing.years),
    String(req.body.groupName ?? req.body.group_name ?? existing.group_name),
    String(req.body.photoUrl ?? req.body.photo_url ?? existing.photo_url),
    Number.isFinite(Number(req.body.sortOrder ?? req.body.sort_order ?? existing.sort_order))
      ? Number(req.body.sortOrder ?? req.body.sort_order ?? existing.sort_order)
      : existing.sort_order,
    id,
  )
  res.json(db.prepare('SELECT * FROM members WHERE id = ?').get(id))
})

app.delete('/api/members/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const result = db.prepare('DELETE FROM members WHERE id = ?').run(id)
  if (result.changes === 0) return res.status(404).json({ error: 'Member not found' })
  res.status(204).end()
})

app.get('/api/publications', (_req, res) => {
  const rows = db.prepare('SELECT * FROM publications ORDER BY year DESC, sort_order, id').all()
  res.json(rows)
})

app.post('/api/publications', requireAuth, (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  if (!title) return res.status(400).json({ error: 'Publication title is required' })
  const result = db.prepare(`
    INSERT INTO publications (title, authors, journal, year, doi_url, category, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    String(req.body.authors || ''),
    String(req.body.journal || ''),
    req.body.year ? Number(req.body.year) : null,
    String(req.body.doiUrl || req.body.doi_url || ''),
    String(req.body.category || 'article'),
    Number.isFinite(Number(req.body.sortOrder ?? req.body.sort_order)) ? Number(req.body.sortOrder ?? req.body.sort_order) : 0,
  )
  res.status(201).json(db.prepare('SELECT * FROM publications WHERE id = ?').get(result.lastInsertRowid))
})

app.put('/api/publications/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM publications WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Publication not found' })
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : existing.title
  if (!title) return res.status(400).json({ error: 'Publication title is required' })
  db.prepare(`
    UPDATE publications SET
      title = ?, authors = ?, journal = ?, year = ?, doi_url = ?, category = ?,
      sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title,
    String(req.body.authors ?? existing.authors),
    String(req.body.journal ?? existing.journal),
    req.body.year === undefined ? existing.year : (req.body.year ? Number(req.body.year) : null),
    String(req.body.doiUrl ?? req.body.doi_url ?? existing.doi_url),
    String(req.body.category ?? existing.category),
    Number.isFinite(Number(req.body.sortOrder ?? req.body.sort_order ?? existing.sort_order))
      ? Number(req.body.sortOrder ?? req.body.sort_order ?? existing.sort_order)
      : existing.sort_order,
    id,
  )
  res.json(db.prepare('SELECT * FROM publications WHERE id = ?').get(id))
})

app.delete('/api/publications/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const result = db.prepare('DELETE FROM publications WHERE id = ?').run(id)
  if (result.changes === 0) return res.status(404).json({ error: 'Publication not found' })
  res.status(204).end()
})

app.get('/api/news', (req, res) => {
  const includeUnpublished = getSession(req) !== null
  const rows = includeUnpublished
    ? db.prepare('SELECT * FROM news ORDER BY published_at DESC, sort_order, id DESC').all()
    : db.prepare("SELECT * FROM news WHERE published = 1 ORDER BY published_at DESC, sort_order, id DESC").all()
  res.json(rows)
})

app.post('/api/news', requireAuth, (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  if (!title) return res.status(400).json({ error: 'News title is required' })
  const result = db.prepare(`
    INSERT INTO news (title, summary, content, image_url, link_url, published_at, published, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title,
    String(req.body.summary || ''),
    String(req.body.content || ''),
    String(req.body.imageUrl || req.body.image_url || ''),
    String(req.body.linkUrl || req.body.link_url || ''),
    req.body.publishedAt || req.body.published_at || null,
    req.body.published === false ? 0 : 1,
    Number.isFinite(Number(req.body.sortOrder ?? req.body.sort_order)) ? Number(req.body.sortOrder ?? req.body.sort_order) : 0,
  )
  res.status(201).json(db.prepare('SELECT * FROM news WHERE id = ?').get(result.lastInsertRowid))
})

app.put('/api/news/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM news WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'News not found' })
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : existing.title
  if (!title) return res.status(400).json({ error: 'News title is required' })
  db.prepare(`
    UPDATE news SET
      title = ?, summary = ?, content = ?, image_url = ?, link_url = ?, published_at = ?,
      published = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title,
    String(req.body.summary ?? existing.summary),
    String(req.body.content ?? existing.content),
    String(req.body.imageUrl ?? req.body.image_url ?? existing.image_url),
    String(req.body.linkUrl ?? req.body.link_url ?? existing.link_url),
    req.body.publishedAt ?? req.body.published_at ?? existing.published_at,
    req.body.published === undefined ? existing.published : (req.body.published ? 1 : 0),
    Number.isFinite(Number(req.body.sortOrder ?? req.body.sort_order ?? existing.sort_order))
      ? Number(req.body.sortOrder ?? req.body.sort_order ?? existing.sort_order)
      : existing.sort_order,
    id,
  )
  res.json(db.prepare('SELECT * FROM news WHERE id = ?').get(id))
})

app.delete('/api/news/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  const result = db.prepare('DELETE FROM news WHERE id = ?').run(id)
  if (result.changes === 0) return res.status(404).json({ error: 'News not found' })
  res.status(204).end()
})

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '')
      callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`)
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
    }
    callback(null, true)
  },
})

app.post('/api/uploads', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image file is required' })
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
    size: req.file.size,
  })
})

app.get('/api/media', requireAuth, (_req, res) => {
  const files = fs.readdirSync(uploadsDir)
    .filter(name => name !== '.gitkeep')
    .map(name => {
      const file = path.join(uploadsDir, name)
      const stats = fs.statSync(file)
      return {
        filename: name,
        url: `/uploads/${name}`,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      }
    })
    .filter(file => !fs.statSync(path.join(uploadsDir, file.filename)).isDirectory())
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt))
  res.json(files)
})

app.delete('/api/media/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename)
  const file = path.join(uploadsDir, filename)
  if (!filename || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return res.status(404).json({ error: 'Media file not found' })
  }
  fs.unlinkSync(file)
  res.status(204).end()
})

app.get('/admin', (_req, res) => {
  res.setHeader('X-Admin-Route', 'backend')
  res.sendFile(path.join(rootDir, 'server', 'admin.html'))
})

app.get('/admin/', (_req, res) => {
  res.setHeader('X-Admin-Route', 'backend')
  res.sendFile(path.join(rootDir, 'server', 'admin.html'))
})

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'File exceeds 10 MB' : 'Invalid upload' })
  }
  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})

const distDir = path.join(rootDir, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

const port = Number(process.env.PORT || 3000)
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
