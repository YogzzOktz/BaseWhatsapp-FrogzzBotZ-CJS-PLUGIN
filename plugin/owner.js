const { readJson, writeJson, normalizeNumber, isOwner, FrogzzBotZ } = require('../Okta')

function cleanTarget(value) {
  return normalizeNumber(value)
}

module.exports = {
  command: ['owner', 'addprem', 'delprem'],
  category: 'owner',
  description: 'Informasi dan perintah owner',
  ownerOnly: false,
  async execute(ctx) {
    if (ctx.command === 'owner') {
      return ctx.reply(`${FrogzzBotZ.name}\n\nOwner: ${FrogzzBotZ.created}\nRilis: ${FrogzzBotZ.release}\n\nGunakan tombol Owner dari menu utama untuk melihat informasi lengkap.`)
    }

    if (!isOwner(ctx.senderNumber)) return ctx.reply('Command ini hanya dapat digunakan owner.')
    const target = cleanTarget(ctx.args[0])
    if (!target) return ctx.reply(`Gunakan .${ctx.command} 628xxxxxxxxxx`)

    const file = 'premium.json'
    const list = readJson(file, [])
    const exists = list.map(normalizeNumber).includes(target)

    if (ctx.command === 'addprem') {
      if (exists) return ctx.reply('Nomor tersebut sudah premium.')
      list.push(target)
      writeJson(file, list)
      return ctx.reply(`Premium ditambahkan: ${target}`)
    }

    if (!exists) return ctx.reply('Nomor tersebut tidak ada di daftar premium.')
    writeJson(file, list.filter(item => normalizeNumber(item) !== target))
    await ctx.reply(`Premium dihapus: ${target}`)
  }
}
