const os = require('os')
const { FrogzzBotZ, getSystemInfo, formatBytes, formatDuration } = require('../Okta')
const { getCpuLoad, getMemory } = require('../lib/function')

async function diskInfo() {
  const fs = require('fs')
  try {
    const { execFile } = require('child_process')
    const output = await new Promise((resolve, reject) => {
      execFile('df', ['-k', '/'], { timeout: 3000 }, (error, stdout) => error ? reject(error) : resolve(stdout))
    })
    const line = String(output).trim().split('\n').pop().trim().split(/\s+/)
    return `${formatBytes(Number(line[2]) * 1024)} / ${formatBytes(Number(line[1]) * 1024)}`
  } catch {
    return 'Unavailable'
  }
}

module.exports = {
  command: ['ping', 'speed', 'botinfo'],
  category: 'main',
  description: 'Informasi bot dan sistem',
  async execute(ctx) {
    const started = Date.now()
    await ctx.FrogzzBotZ.sendPresenceUpdate('composing', ctx.chat).catch(() => {})
    const latency = Date.now() - started
    const info = getSystemInfo()
    const panel = process.env.P_SERVER_UUID || process.env.P_SERVER_MEMORY || process.env.P_SERVER_PRIMARY ? 'Pterodactyl' : 'Standalone'
    const text = `${FrogzzBotZ.name}\n\nPanel: ${panel}\nNode: ${info.node}\nCPU: ${info.cpu}\nCore: ${info.cores}\nCPU Load: ${getCpuLoad()}\nRAM: ${info.ram}\nProcess RAM: ${getMemory()}\nDisk: ${await diskInfo()}\nBot Uptime: ${formatDuration(process.uptime() * 1000)}\nResponse: ${latency} ms\nPlatform: ${os.platform()} ${os.arch()}`
    await ctx.reply(text)
  }
}
