// ===================================================
//  FrogzzBotZ CJS
//  Creator : Frogzz/Yoga/Okta
//  Rrealesed : 18 September 2026
// ===================================================

const path = require('path')
const readline = require('readline')
const pino = require('pino')
const { Boom } = require('@hapi/boom')
const {
  FrogzzBotZ: BotInfo,
  ensureOwner,
  getSelfMode,
  getButtonId,
  getMessageText,
  react
} = require('./Okta')
const { createContext } = require('./lib/message')
const { handleCommand } = require('./lib/command')

let makeWASocket
let DisconnectReason
let useMultiFileAuthState
let delay
let Browsers
let reconnectAttempts = 0
let reconnectTimer = null
let connecting = false
let pairingRequested = false
let pairingInProgress = false
let activeBot = null
let stopped = false

const logger = pino({ level: process.env.LOG_LEVEL || 'silent' })
const sessionPath = path.join(__dirname, 'session')
const MAX_RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAYS = [5000, 10000, 20000, 30000, 60000]

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => {
    rl.close()
    resolve(answer.trim())
  }))
}

function getInputText(message) {
  return getMessageText(message) || getButtonId(message)
}

function clearReconnectTimer() {
  if (!reconnectTimer) return
  clearTimeout(reconnectTimer)
  reconnectTimer = null
}

function scheduleReconnect() {
  if (stopped || connecting || reconnectTimer || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return false
  const index = reconnectAttempts
  const wait = RECONNECT_DELAYS[index] || RECONNECT_DELAYS[RECONNECT_DELAYS.length - 1]
  reconnectAttempts += 1
  process.stdout.write(`${BotInfo.name} reconnect ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${Math.ceil(wait / 1000)}s\n`)
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    startFrogzzBotZ().catch(error => process.stderr.write(`${error.stack || error}\n`))
  }, wait)
  return true
}

async function loadBaileys() {
  if (makeWASocket) return
  const baileys = await import('@itsliaaa/baileys')
  makeWASocket = baileys.makeWASocket || baileys.default
  DisconnectReason = baileys.DisconnectReason
  useMultiFileAuthState = baileys.useMultiFileAuthState
  delay = baileys.delay || (ms => new Promise(resolve => setTimeout(resolve, ms)))
  Browsers = baileys.Browsers
}

async function requestPairing(FrogzzBotZ, state) {
  if (state.creds.registered || pairingRequested || pairingInProgress) return
  pairingInProgress = true
  try {
    let configured = process.env.BOT_NUMBER || ''

    if (!configured) {
      configured = await ask(`${BotInfo.name} pairing
Masukkan nomor WhatsApp (628xxxxxxxxxx): `)
      if (configured.toLowerCase() === 'p') {
        configured = await ask('Masukkan nomor WhatsApp (628xxxxxxxxxx): ')
      }
    }

    const number = configured.replace(/[^0-9]/g, '')
    if (!/^62[0-9]{8,15}$/.test(number)) {
      throw new Error('Nomor WhatsApp tidak valid. Gunakan format 628xxxxxxxxxx.')
    }

    ensureOwner(number)
    await delay(1200)

    if (state.creds.registered) return

    const code = await FrogzzBotZ.requestPairingCode(number)
    pairingRequested = true
    process.stdout.write(`\n${BotInfo.name}\nPairing Code: ${code}\nSelesaikan pairing di WhatsApp.\n\n`)
  } finally {
    pairingInProgress = false
  }
}

async function startFrogzzBotZ() {
  if (stopped || connecting || activeBot) return activeBot
  connecting = true
  clearReconnectTimer()

  try {
    await loadBaileys()
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const FrogzzBotZ = makeWASocket({
      logger,
      auth: state,
      browser: Browsers?.ubuntu?.('Chrome') || undefined,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false
    })

    activeBot = FrogzzBotZ
    connecting = false
    FrogzzBotZ.ev.on('creds.update', saveCreds)

    FrogzzBotZ.ev.on('connection.update', async update => {
      const { connection, lastDisconnect } = update

      if (connection === 'open') {
        reconnectAttempts = 0
        pairingRequested = true
        clearReconnectTimer()
        activeBot = FrogzzBotZ
        const own = String(FrogzzBotZ.user?.id || '').split(':')[0].split('@')[0]
        ensureOwner(own)
        process.stdout.write(`${BotInfo.name} connected as ${own}\n`)
        return
      }

      if (connection !== 'close') return

      if (activeBot === FrogzzBotZ) activeBot = null
      const status = new Boom(lastDisconnect?.error)?.output?.statusCode
      const loggedOut = status === DisconnectReason.loggedOut
      const badSession = status === DisconnectReason.badSession
      const restartRequired = status === DisconnectReason.restartRequired

      if (loggedOut || badSession) {
        pairingRequested = false
        process.stdout.write(`${BotInfo.name} session ${loggedOut ? 'logged out' : 'invalid'}. Hapus folder session lalu pairing ulang.\n`)
        return
      }

      if (restartRequired) {
        scheduleReconnect()
        return
      }

      if (!scheduleReconnect()) {
        stopped = true
        clearReconnectTimer()
        process.stdout.write(`${BotInfo.name} gagal reconnect ${MAX_RECONNECT_ATTEMPTS} kali. Bot dimatikan. Hapus folder session lalu jalankan kembali untuk pairing ulang.\n`)
      }
    })

    if (!state.creds.registered) {
      await delay(1000)
      try {
        await requestPairing(FrogzzBotZ, state)
      } catch (error) {
        pairingRequested = false
        process.stderr.write(`${error.message || error}\n`)
        activeBot = null
        connecting = false
        stopped = true
        return FrogzzBotZ
      }
    }

    FrogzzBotZ.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        if (!message?.message || !message?.key?.remoteJid) continue
        if (message.key.remoteJid === 'status@broadcast') continue
        if (message.key.fromMe && !getSelfMode()) continue
        const ctx = createContext(BotInfo, FrogzzBotZ, message)
        const input = getInputText(message)
        if (!input) continue
        if (!String(input).startsWith('.')) continue
        try {
          const handled = await handleCommand(ctx)
          if (handled && ['menu', 'allmenu'].includes(ctx.command)) await react(FrogzzBotZ, message)
        } catch (error) {
          process.stderr.write(`${error.stack || error}\n`)
        }
      }
    })

    return FrogzzBotZ
  } catch (error) {
    activeBot = null
    connecting = false
    scheduleReconnect()
    throw error
  }
}

process.on('uncaughtException', error => process.stderr.write(`${error.stack || error}\n`))
process.on('unhandledRejection', error => process.stderr.write(`${error?.stack || error}\n`))

startFrogzzBotZ().catch(error => process.stderr.write(`${error.stack || error}\n`))
