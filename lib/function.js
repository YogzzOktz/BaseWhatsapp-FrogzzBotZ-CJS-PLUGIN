const os = require('os')
const { formatBytes, formatDuration } = require('../Okta')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getMemory() {
  const used = process.memoryUsage()
  return `${formatBytes(used.rss)} RSS`
}

function getCpuLoad() {
  const cpus = os.cpus()
  if (!cpus.length) return '0%'
  let idle = 0
  let total = 0
  for (const cpu of cpus) {
    idle += cpu.times.idle
    total += Object.values(cpu.times).reduce((a, b) => a + b, 0)
  }
  return `${Math.max(0, Math.min(100, Math.round(100 - (idle / total) * 100)))}%`
}

function uptime() {
  return formatDuration(process.uptime() * 1000)
}

module.exports = {
  sleep,
  getMemory,
  getCpuLoad,
  uptime
}
