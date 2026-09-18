const { isPremium, isOwner, FrogzzBotZ } = require('../Okta')
const { getMemory, getCpuLoad } = require('../lib/function')

module.exports = {
  command: ['premium', 'prem', 'premiuminfo'],
  category: 'premium',
  description: 'Informasi status premium',
  async execute(ctx) {
    const active = isPremium(ctx.senderNumber) || isOwner(ctx.senderNumber)
    if (!active) return ctx.reply('Nomor kamu belum terdaftar sebagai premium.')
    await ctx.reply(`${FrogzzBotZ.name}\n\nStatus: Premium\nProcess RAM: ${getMemory()}\nCPU Load: ${getCpuLoad()}\n\nAkses premium aktif untuk nomor ini.`)
  }
}
