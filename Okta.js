// ===================================================
//  FrogzzBotZ CJS
//  Creator : Okta — formerly known as Frogzz
//  Released : 18 September 2026
// ===================================================

const fs = require('fs')
const path = require('path')
const os = require('os')

const root = __dirname

const FrogzzBotZ = {
  name: 'FrogzzBotZ',
  version: '1.0.0',
  created: 'Okta — formerly known as Frogzz',
  release: '18 September 2026',
  prefix: '.',
  paths: {
    root,
    database: path.join(root, 'database'),
    image: path.join(root, 'image'),
    plugin: path.join(root, 'plugin'),
    session: path.join(root, 'session')
  }
}

function readJson(name, fallback) {
  const file = path.join(FrogzzBotZ.paths.database, name)
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2))
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return data
  } catch {
    return fallback
  }
}

function writeJson(name, data) {
  const file = path.join(FrogzzBotZ.paths.database, name)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function normalizeNumber(value) {
  if (!value) return ''
  let number = String(value).trim().replace(/[^0-9]/g, '')
  if (number.startsWith('0')) number = `62${number.slice(1)}`
  if (number.startsWith('8')) number = `62${number}`
  return number
}

function normalizeJid(value) {
  if (!value) return ''
  return String(value).trim()
}

function toUserJid(value) {
  const raw = normalizeJid(value)
  if (!raw) return ''
  if (raw.includes('@')) return raw
  const number = normalizeNumber(raw)
  return number ? `${number}@s.whatsapp.net` : ''
}

function getMessageText(message) {
  const content = message?.message || {}
  return content.conversation || content.extendedTextMessage?.text || content.imageMessage?.caption || content.videoMessage?.caption || content.documentMessage?.caption || ''
}

function getQuotedText(message) {
  const content = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!content) return ''
  return content.conversation || content.extendedTextMessage?.text || content.imageMessage?.caption || content.videoMessage?.caption || content.documentMessage?.caption || ''
}

function getButtonId(message) {
  const content = message?.message || {}
  const button = content.buttonsResponseMessage?.selectedButtonId || content.templateButtonReplyMessage?.selectedId || content.listResponseMessage?.singleSelectReply?.selectedRowId
  if (button) return button
  const native = content.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
  if (native) {
    try {
      const parsed = JSON.parse(native)
      return parsed.id || parsed.selected_id || parsed.button_id || ''
    } catch {}
  }
  return ''
}

function extractInput(message) {
  return getMessageText(message) || getButtonId(message)
}

function getSender(message) {
  const key = message?.key || {}
  if (key.fromMe) return key.participant || key.remoteJid || ''
  return key.participantAlt || key.participant || key.remoteJidAlt || key.remoteJid || ''
}

function getSenderNumber(message) {
  const key = message?.key || {}
  const jid = key.participantAlt || key.participant || key.remoteJidAlt || key.remoteJid || ''
  if (String(jid).endsWith('@s.whatsapp.net')) return String(jid).split('@')[0]
  if (String(key.participant || '').endsWith('@lid') && String(key.participantAlt || '').endsWith('@s.whatsapp.net')) return String(key.participantAlt).split('@')[0]
  if (String(key.remoteJidAlt || '').endsWith('@s.whatsapp.net')) return String(key.remoteJidAlt).split('@')[0]
  return String(jid).split('@')[0]
}

function getChat(message) {
  return message?.key?.remoteJid || ''
}

function isGroup(message) {
  return getChat(message).endsWith('@g.us')
}

function getMentionedJids(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || message?.message?.imageMessage?.contextInfo?.mentionedJid || []
}

function getTargetFromArgs(message, args) {
  const mentions = getMentionedJids(message)
  if (mentions.length) return mentions[0]
  const quoted = message?.message?.extendedTextMessage?.contextInfo?.participant
  if (quoted) return quoted
  const first = args[0] || ''
  return toUserJid(first)
}

function formatRupiah(value) {
  return `Rp${Number(value || 0).toLocaleString('id-ID')}`
}

function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (!value) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

function formatDuration(ms) {
  const total = Math.floor(ms / 1000)
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}

function getSystemInfo() {
  const total = os.totalmem()
  const free = os.freemem()
  return {
    platform: `${os.platform()} ${os.arch()}`,
    cpu: os.cpus()[0]?.model || 'Unknown',
    cores: os.cpus().length,
    ram: `${formatBytes(total - free)} / ${formatBytes(total)}`,
    node: process.version,
    uptime: formatDuration(process.uptime() * 1000)
  }
}

function ensureOwner(number) {
  const clean = normalizeNumber(number)
  if (!clean) return
  const owners = readJson('owner.json', [])
  if (!owners.includes(clean)) {
    owners.push(clean)
    writeJson('owner.json', owners)
  }
}

function isOwner(value) {
  const number = normalizeNumber(value)
  return readJson('owner.json', []).map(normalizeNumber).includes(number)
}

function isPremium(value) {
  const number = normalizeNumber(value)
  return readJson('premium.json', []).map(normalizeNumber).includes(number)
}

function isBlacklisted(value) {
  const number = normalizeNumber(value)
  return readJson('blacklist.json', []).map(normalizeNumber).includes(number)
}

function getSelfMode() {
  return Boolean(readJson('selfmode.json', { enabled: false }).enabled)
}


async function react(FrogzzBotZ, message, text = '✓') {
  const jid = message?.key?.remoteJid
  const id = message?.key?.id
  if (!jid || !id) return
  return FrogzzBotZ.sendMessage(jid, { react: { text, key: message.key } })
}

function getPrefix(input) {
  const first = String(input || '').trim()[0]
  return first === '.' ? '.' : FrogzzBotZ.prefix
}

function getCommand(input) {
  const text = String(input || '').trim()
  if (!text) return { command: '', args: [], prefix: '' }
  const prefix = getPrefix(text)
  if (!text.startsWith(prefix)) return { command: '', args: [], prefix: '' }
  const parts = text.slice(prefix.length).trim().split(/\s+/)
  const command = (parts.shift() || '').toLowerCase()
  return { command, args: parts, prefix }
}

module.exports = {
  FrogzzBotZ,
  readJson,
  writeJson,
  normalizeNumber,
  normalizeJid,
  toUserJid,
  getMessageText,
  getQuotedText,
  getButtonId,
  extractInput,
  getSender,
  getSenderNumber,
  getChat,
  isGroup,
  getMentionedJids,
  getTargetFromArgs,
  formatRupiah,
  formatBytes,
  formatDuration,
  getSystemInfo,
  ensureOwner,
  isOwner,
  isPremium,
  isBlacklisted,
  getSelfMode,
  getCommand,
  react
}
