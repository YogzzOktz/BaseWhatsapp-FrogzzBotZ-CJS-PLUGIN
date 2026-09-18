const fs = require('fs')
const path = require('path')
const { FrogzzBotZ, getSenderNumber, isOwner, isPremium, isBlacklisted, getSelfMode, getTargetFromArgs } = require('../Okta')
const { getGroupData } = require('./group')

function listLib() {
  return fs.readdirSync(__dirname).filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''))
}

function getBotNumber(FrogzzBotZ) {
  return String(FrogzzBotZ?.user?.id || '').split(':')[0].split('@')[0]
}

function access(ctx, options = {}) {
  const owner = isOwner(ctx.senderNumber)
  const premium = isPremium(ctx.senderNumber)
  const blacklisted = isBlacklisted(ctx.senderNumber)
  const self = getSelfMode()
  const group = ctx.isGroup ? getGroupData(ctx) : null
  const senderAdmin = Boolean(group?.senderAdmin)
  const botAdmin = Boolean(group?.botAdmin)
  return {
    owner,
    premium,
    blacklisted,
    self,
    senderAdmin,
    botAdmin,
    allowed: !blacklisted && (!self || owner) && (!options.ownerOnly || owner) && (!options.premiumOnly || premium || owner) && (!options.adminOnly || senderAdmin) && (!options.botAdminOnly || botAdmin)
  }
}

module.exports = {
  FrogzzBotZ,
  listLib,
  getBotNumber,
  access,
  getTargetFromArgs
}
