const { isOwner, isPremium } = require('../Okta')
const { kick, add, closeGroup, openGroup, infoGroup } = require('../lib/group')

module.exports = {
  command: ['kick', 'add', 'gpclose', 'groupclose', 'gpopen', 'groupopen', 'infogp'],
  category: 'group',
  description: 'Manajemen grup',
  groupOnly: true,
  async execute(ctx) {
    if (!isOwner(ctx.senderNumber) && !isPremium(ctx.senderNumber)) return ctx.reply('Perintah ini tersedia untuk premium atau owner.')
    switch (ctx.command) {
      case 'kick':
        return kick(ctx)
      case 'add':
        return add(ctx)
      case 'gpclose':
      case 'groupclose':
        return closeGroup(ctx)
      case 'gpopen':
      case 'groupopen':
        return openGroup(ctx)
      case 'infogp':
        return infoGroup(ctx)
      default:
        return undefined
    }
  }
}
