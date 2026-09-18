const { findPlugin } = require('./loader')
const { sendMenu, sendAllMenu, sendOwnerMenu, sendCategory } = require('./menu')
const { isBlacklisted, isOwner, isPremium, getSelfMode } = require('../Okta')

async function handleCommand(ctx) {
  if (!ctx.command) return false
  if (isBlacklisted(ctx.senderNumber)) return true
  if (getSelfMode() && !isOwner(ctx.senderNumber) && !isPremium(ctx.senderNumber)) return true

  switch (ctx.command) {
    case 'menu':
    case 'help':
      await sendMenu(ctx)
      return true
    case 'allmenu':
      await sendAllMenu(ctx)
      return true
    case 'ownermenu':
      await sendOwnerMenu(ctx)
      return true
    case 'mainmenu':
      await sendCategory(ctx, 'main')
      return true
    case 'groupmenu':
      await sendCategory(ctx, 'group')
      return true
    case 'premiummenu':
      await sendCategory(ctx, 'premium')
      return true
    case 'pluginmenu':
      await sendCategory(ctx, 'plugin')
      return true
    case 'libmenu':
      await sendCategory(ctx, 'library')
      return true
    case 'createdby': {
      const plugin = findPlugin('createdby')
      if (plugin) await plugin.execute(ctx)
      return true
    }
    default:
      break
  }

  const plugin = findPlugin(ctx.command)
  if (!plugin) return false

  if (plugin.ownerOnly && !isOwner(ctx.senderNumber)) {
    await ctx.reply('Command ini hanya dapat digunakan owner.')
    return true
  }
  if (plugin.premiumOnly && !isPremium(ctx.senderNumber) && !isOwner(ctx.senderNumber)) {
    await ctx.reply('Command ini tersedia untuk premium.')
    return true
  }
  if (plugin.groupOnly && !ctx.isGroup) {
    await ctx.reply('Command ini hanya dapat digunakan di grup.')
    return true
  }

  try {
    await plugin.execute(ctx)
  } catch (error) {
    await ctx.reply(`Terjadi kesalahan saat menjalankan command.`)
    process.stderr.write(`${error.stack || error}\n`)
  }
  return true
}

module.exports = { handleCommand }
