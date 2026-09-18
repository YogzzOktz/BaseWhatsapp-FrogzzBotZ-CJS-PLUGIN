const fs = require('fs')
const path = require('path')
const { FrogzzBotZ, isOwner } = require('../Okta')
const { listPlugins } = require('./loader')

function buttons(items) {
  return items.map(item => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: item.text,
      id: item.id
    })
  }))
}

async function sendMenu(ctx) {
  const image = path.join(FrogzzBotZ.paths.image, 'menu.png')
  const plugins = listPlugins()
  const text = `${FrogzzBotZ.name}\n\nSelamat datang di ${FrogzzBotZ.name}.\nBot modular dengan tampilan sederhana dan sistem plugin.\n\nVersi: ${FrogzzBotZ.version}\nPrefix: ${FrogzzBotZ.prefix}\nPlugin: ${plugins.length}\nMode: ${isOwner(ctx.senderNumber) ? 'Owner' : 'Public'}\n\nPilih menu yang ingin dibuka.`
  const content = {
    image: { url: image },
    caption: text,
    footer: `${FrogzzBotZ.name} · ${FrogzzBotZ.created}`,
    interactiveButtons: buttons([
      { id: 'allmenu', text: 'All Menu' },
      { id: 'ownermenu', text: 'Owner' }
    ])
  }
  return ctx.send(content)
}

function categoryList() {
  return [
    { title: 'Main', description: 'Perintah utama bot', id: 'mainmenu' },
    { title: 'Group', description: 'Perintah grup', id: 'groupmenu' },
    { title: 'Premium', description: 'Fitur premium', id: 'premiummenu' },
    { title: 'Plugin', description: 'Perintah plugin', id: 'pluginmenu' },
    { title: 'Library', description: 'Module dan utilitas', id: 'libmenu' },
    { title: 'Owner', description: 'Perintah owner', id: 'ownermenu' }
  ]
}

async function sendAllMenu(ctx) {
  const sections = [{ title: 'FrogzzBotZ', rows: categoryList() }]
  return ctx.send({
    image: { url: path.join(FrogzzBotZ.paths.image, 'allmenu.png') },
    caption: 'Pilih kategori untuk melihat command FrogzzBotZ.',
    title: 'All Menu',
    footer: FrogzzBotZ.name,
    interactiveButtons: [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({ title: 'Pilih Menu', sections })
    }]
  })
}

async function sendCategory(ctx, category) {
  const plugins = listPlugins().filter(item => item.category === category || category === 'all')
  const rows = plugins.map(item => ({ title: `${FrogzzBotZ.prefix}${item.command[0]}`, description: item.description || 'Command', id: item.command[0] }))
  if (!rows.length) rows.push({ title: 'Belum ada command', description: 'Kategori ini masih kosong', id: 'menu' })
  const imageName = `${category}menu.png`
  return ctx.send({
    image: { url: path.join(FrogzzBotZ.paths.image, imageName) },
    caption: `Daftar command ${category}.`,
    title: 'FrogzzBotZ',
    footer: FrogzzBotZ.name,
    interactiveButtons: [{
      name: 'single_select',
      buttonParamsJson: JSON.stringify({ title: 'Command', sections: [{ title: category, rows }] })
    }]
  })
}

async function sendOwnerMenu(ctx) {
  return ctx.send({
    text: `${FrogzzBotZ.name}\n\nCreated by ${FrogzzBotZ.created}\nRilis: ${FrogzzBotZ.release}\n\nMenu owner tersedia setelah verifikasi owner.`,
    footer: FrogzzBotZ.name,
    interactiveButtons: buttons([
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
