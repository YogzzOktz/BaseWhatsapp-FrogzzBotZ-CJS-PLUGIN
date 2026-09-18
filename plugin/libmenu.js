const { listLib, FrogzzBotZ } = require('../lib/lib')

module.exports = {
  command: ['libmenu'],
  category: 'library',
  description: 'Daftar library FrogzzBotZ',
  async execute(ctx) {
    await ctx.reply(`${FrogzzBotZ.name}\n\n${listLib().map(name => `${FrogzzBotZ.prefix}${name}`).join('\n')}`)
  }
}
