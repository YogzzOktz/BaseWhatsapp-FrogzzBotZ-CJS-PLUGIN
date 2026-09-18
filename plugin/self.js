const { readJson, writeJson, isOwner, isPremium } = require('../Okta')

module.exports = {
  command: ['self', 'public', 'selfmode'],
  category: 'owner',
  description: 'Mengatur mode akses bot',
  async execute(ctx) {
    if (!isOwner(ctx.senderNumber)) return ctx.reply('Command ini hanya dapat digunakan owner.')

    const data = readJson('selfmode.json', { enabled: false })

    if (ctx.command === 'selfmode') {
      return ctx.reply(`Self Mode: ${data.enabled ? 'ON' : 'OFF'}\nAkses: ${data.enabled ? 'Owner + Premium' : 'Public'}`)
    }

    data.enabled = ctx.command === 'self'
    writeJson('selfmode.json', data)
    return ctx.reply(`Self Mode: ${data.enabled ? 'ON' : 'OFF'}\nAkses: ${data.enabled ? 'Owner + Premium' : 'Public'}`)
  }
}
