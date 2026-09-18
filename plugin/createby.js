const { FrogzzBotZ } = require('../Okta')

module.exports = {
  command: ['createby', 'createdby'],
  category: 'main',
  description: 'Informasi pembuat bot',
  async execute(ctx) {
    await ctx.reply(`${FrogzzBotZ.name}\n\nCreated by: ${FrogzzBotZ.created}\nRilis: ${FrogzzBotZ.release}\nBase Version: ${FrogzzBotZ.version}\n\nPengembangan: WhatsApp Bot System\nDeveloper: Frogzz/Yoga/Okta`)
  }
}
