const fs = require('fs')
const path = require('path')
const { isOwner, FrogzzBotZ } = require('../Okta')
const { listPlugins, reloadPlugin } = require('../lib/loader')

const dir = path.join(__dirname)

function safeFile(name) {
  const file = path.basename(String(name || ''))
  if (!file.endsWith('.js') || !/^[a-zA-Z0-9_-]+\.js$/.test(file)) return ''
  return file
}

function makePlugin(content) {
  const escaped = JSON.stringify(String(content || ''))
  return `module.exports = {\n  command: ['${path.basename(content.file || 'custom').replace(/\.js$/i, '').toLowerCase()}'],\n  category: 'plugin',\n  description: 'Custom plugin',\n  async execute(ctx) {\n    await ctx.reply(${escaped})\n  }\n}\n`
}

function getContent(ctx) {
  return ctx.quotedText || ctx.args.slice(1).join(' ')
}

module.exports = {
  command: ['addplugin', 'delplugin', 'editplugin', 'eplugin', 'pluginmenu'],
  category: 'plugin',
  description: 'Kelola plugin',
  async execute(ctx) {
    if (ctx.command === 'pluginmenu') {
      const rows = listPlugins().map(plugin => `${FrogzzBotZ.prefix}${plugin.command[0]}${plugin.ownerOnly ? ' · owner' : plugin.premiumOnly ? ' · premium' : ''}`)
      return ctx.reply(`${FrogzzBotZ.name}\n\nPlugin aktif: ${rows.length}\n\n${rows.join('\n') || 'Belum ada plugin.'}`)
    }

    if (!isOwner(ctx.senderNumber)) return ctx.reply('Command ini hanya dapat digunakan owner.')
    const file = safeFile(ctx.args[0])
    if (!file) return ctx.reply(`Gunakan .${ctx.command} example.js isi plugin`)
    const target = path.join(dir, file)

    if (ctx.command === 'delplugin') {
      if (!fs.existsSync(target)) return ctx.reply('Plugin tidak ditemukan.')
      if (['plugin.js', 'owner.js', 'premium.js', 'ping.js', 'createby.js'].includes(file)) return ctx.reply('Plugin bawaan tidak dapat dihapus.')
      fs.unlinkSync(target)
      return ctx.reply(`Plugin ${file} dihapus.`)
    }

    const content = getContent(ctx)
    if (!content) return ctx.reply('Isi plugin belum diberikan.')

    const commandName = path.basename(file, '.js').toLowerCase()
    const escaped = JSON.stringify(content)
    const source = `module.exports = {\n  command: ['${commandName}'],\n  category: 'plugin',\n  description: 'Custom plugin',\n  async execute(ctx) {\n    await ctx.reply(${escaped})\n  }\n}\n`
    fs.writeFileSync(target, source)
    reloadPlugin(file)
    await ctx.reply(`Plugin ${file} ${ctx.command === 'addplugin' ? 'dibuat' : 'diperbarui'}.\nCommand: ${FrogzzBotZ.prefix}${commandName}`)
  }
}
