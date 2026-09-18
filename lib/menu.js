const { FrogzzBotZ, isOwner } = require('../Okta')
const { listPlugins } = require('./loader')

const GITHUB = 'https://github.com/YogzzOktz'

function buttons(items) {
  return items.map(item => ({
    text: item.text,
    id: item.id
  }))
}

function baseText(ctx, plugins) {
  const mode = isOwner(ctx.senderNumber) ? 'Owner' : 'Public'
  return `「 ${FrogzzBotZ.name} 」\n「 Info Bot 」\n\n> Nama : *${FrogzzBotZ.name}*\n> Versi : *v${FrogzzBotZ.version}*\n> Creator : *${FrogzzBotZ.created}*\n> Prefix : *${FrogzzBotZ.prefix}*\n> Mode : *${mode}*\n> Uptime : *${require('../Okta').formatDuration(process.uptime() * 1000)}*\n> Total Plugin : *${plugins.length}*\n\n_*Pilih menu di bawah untuk melihat command.*_`
}

async function sendMenu(ctx) {
  const plugins = listPlugins()
  return ctx.send({
    text: `${baseText(ctx, plugins)}\n\n${GITHUB}`,
    linkPreview: {
      'matched-text': GITHUB,
      title: `${FrogzzBotZ.name} — Okta YogzzOktz`,
      description: 'Creator : Okta — formerly known as Frogzz'
    },
    footer: `© ${FrogzzBotZ.name}`,
    buttons: buttons([
      { id: 'allmenu', text: 'All Menu' },
      { id: 'ownermenu', text: 'Owner' }
    ])
  })
}

function categoryList() {
  return [
    { title: 'Main Menu', description: 'Command utama', rowId: 'mainmenu' },
    { title: 'Group Menu', description: 'Command grup', rowId: 'groupmenu' },
    { title: 'Premium Menu', description: 'Command premium', rowId: 'premiummenu' },
    { title: 'Plugin Menu', description: 'Management plugin', rowId: 'pluginmenu' },
    { title: 'Library Menu', description: 'Module dan utilitas', rowId: 'libmenu' },
    { title: 'Owner Menu', description: 'Command owner', rowId: 'ownermenu' }
  ]
}

async function sendAllMenu(ctx) {
  return ctx.send({
    text: `「 ${FrogzzBotZ.name} 」\n「 All Menu 」\n\nPilih kategori command yang ingin dibuka.`,
    footer: `© ${FrogzzBotZ.name}`,
    buttonText: 'Pilih Menu',
    sections: [{ title: 'Menu', rows: categoryList() }]
  })
}

async function sendCategory(ctx, category) {
  const plugins = listPlugins().filter(item => item.category === category || category === 'all')
  const rows = plugins.flatMap(item => (item.command || []).map(command => ({
    title: `${FrogzzBotZ.prefix}${command}`,
    description: item.description || 'Command',
    rowId: command
  })))

  if (!rows.length) rows.push({ title: 'Belum ada command', description: 'Kategori masih kosong', rowId: 'menu' })

  return ctx.send({
    text: `「 ${FrogzzBotZ.name} 」\n「 ${category.toUpperCase()} MENU 」\n\nPilih command yang ingin digunakan.`,
    footer: `© ${FrogzzBotZ.name}`,
    buttonText: 'Pilih Command',
    sections: [{ title: category.toUpperCase(), rows }]
  })
}

async function sendOwnerMenu(ctx) {
  return ctx.send({
    text: `「 ${FrogzzBotZ.name} 」\n「 Owner Menu 」\n\nCreator : *${FrogzzBotZ.created}*\nRelease : *${FrogzzBotZ.release}*\nPrefix : *${FrogzzBotZ.prefix}*\n\n${GITHUB}`,
    linkPreview: {
      'matched-text': GITHUB,
      title: `${FrogzzBotZ.name} — GitHub`,
      description: 'Okta YogzzOktz'
    },
    footer: `© ${FrogzzBotZ.name}`,
    buttons: buttons([
      { id: 'createdby', text: 'Created By' },
      { id: 'allmenu', text: 'All Menu' }
    ])
  })
}

module.exports = {
  buttons,
  sendMenu,
  sendAllMenu,
  sendCategory,
  sendOwnerMenu
}
