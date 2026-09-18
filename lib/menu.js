const fs = require('fs')
const path = require('path')

const {
  FrogzzBotZ,
  isOwner,
  formatDuration
} = require('../Okta')

const {
  listPlugins
} = require('./loader')

const MENU_IMAGE = path.join(
  __dirname,
  '../image/menu.png'
)

function getCategories() {
  const plugins = listPlugins()
  const categories = {}

  for (const plugin of plugins) {
    const category = String(
      plugin.category || 'main'
    ).trim().toLowerCase()

    if (!category) continue
    if (!categories[category]) categories[category] = []

    const commands = Array.isArray(plugin.command)
      ? plugin.command
      : plugin.command
        ? [plugin.command]
        : []

    for (const command of commands) {
      if (
        typeof command === 'string' &&
        command.trim() &&
        !categories[category].includes(command.trim())
      ) {
        categories[category].push(command.trim())
      }
    }
  }

  return categories
}

function sortCategories(categories) {
  return Object.keys(categories).sort((a, b) => {
    if (a === 'main') return -1
    if (b === 'main') return 1
    if (a === 'owner') return 1
    if (b === 'owner') return -1
    return a.localeCompare(b)
  })
}

function formatCategory(category) {
  return String(category || '')
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
}

function getCategoryCommand(category) {
  const commands = {
    main: 'mainmenu',
    group: 'groupmenu',
    premium: 'premiummenu',
    plugin: 'pluginmenu',
    library: 'libmenu',
    owner: 'ownermenu'
  }

  return commands[category] || `menu ${category}`
}

function makeQuickButton(id, text) {
  return {
    text,
    id
  }
}

function makeCategoryButton(categories, prefix) {
  const rows = sortCategories(categories).map(category => ({
    title: `${formatCategory(category)} Menu`,
    description: `${(categories[category] || []).length} command tersedia`,
    id: `${prefix}${getCategoryCommand(category)}`
  }))

  return {
    text: 'Pilih Kategori',
    sections: [{
      title: 'FrogzzBotZ Menu',
      rows
    }]
  }
}

async function sendMenuMessage(ctx, text, {
  buttons = []
} = {}) {
  const sock = ctx.FrogzzBotZ
  const chat = ctx.chat

  if (!sock || !chat) {
    throw new Error('Socket atau chat tidak tersedia untuk menu.')
  }

  const payload = {
    image: { url: MENU_IMAGE },
    caption: String(text || ''),
    footer: `© ${FrogzzBotZ.name}`,
    buttons
  }

  return sock.sendMessage(chat, payload, {
    quoted: ctx.message
  })
}

async function sendTextFallback(ctx, text) {
  const sock = ctx.FrogzzBotZ
  const chat = ctx.chat

  if (!sock || !chat) {
    throw new Error('Socket atau chat tidak tersedia untuk fallback menu.')
  }

  return sock.sendMessage(chat, {
    text: String(text || '')
  }, {
    quoted: ctx.message
  })
}

async function sendMenu(ctx) {
  const prefix = ctx.prefix || FrogzzBotZ.prefix || '.'
  const plugins = listPlugins()
  const categories = getCategories()
  const categoryKeys = sortCategories(categories)

  const mode = isOwner(ctx.senderNumber) ? 'Owner' : 'Public'

  const text = `\`「 ${FrogzzBotZ.name} 」\`
\`「 Info Bot 」\`

> Nama : *${FrogzzBotZ.name}*
> Versi : *v${FrogzzBotZ.version}*
> Creator : *${FrogzzBotZ.created}*
> Prefix : *${prefix}*
> Mode : *${mode}*
> Uptime : *${formatDuration(process.uptime() * 1000)}*
> Kategori : *${categoryKeys.length}*
> Total Plugin : *${plugins.length}*

_*Pilih All Menu untuk melihat semua kategori.*_`

  return sendMenuMessage(ctx, text, {
    buttons: [
      makeQuickButton(`${prefix}allmenu`, '📋 All Menu'),
      makeQuickButton(`${prefix}ownermenu`, '👑 Owner')
    ]
  })
}

async function sendAllMenu(ctx) {
  const prefix = ctx.prefix || FrogzzBotZ.prefix || '.'
  const categories = getCategories()
  const categoryKeys = sortCategories(categories)

  const text = `\`「 ${FrogzzBotZ.name} 」\`
\`「 All Menu 」\`

> Total Kategori : *${categoryKeys.length}*
> Prefix : *${prefix}*

_*Pilih kategori dari tombol di bawah untuk membuka menu.*_`

  try {
    return await sendMenuMessage(ctx, text, {
      buttons: [makeCategoryButton(categories, prefix)]
    })
  } catch (error) {
    const fallback = `${text}\n\n${categoryKeys.map(category => {
      const command = getCategoryCommand(category)
      const count = (categories[category] || []).length
      return `> ${formatCategory(category)} — ${count} command\n  ${prefix}${command}`
    }).join('\n')}`

    try {
      return await sendTextFallback(ctx, fallback)
    } catch (fallbackError) {
      throw new Error(`All Menu gagal dikirim: ${error.message || error}; fallback juga gagal: ${fallbackError.message || fallbackError}`)
    }
  }
}

async function sendCategory(ctx, category) {
  const prefix = ctx.prefix || FrogzzBotZ.prefix || '.'
  const categories = getCategories()
  const key = String(category || 'main').trim().toLowerCase()
  const commands = categories[key] || []

  const title = `${formatCategory(key)} Menu`
  const commandText = commands.length
    ? commands.map(command => `> ${prefix}${command}`).join('\n')
    : '> Belum ada command.'

  const text = `\`「 ${FrogzzBotZ.name} 」\`
\`「 ${title} 」\`

${commandText}

_*Gunakan tombol kategori untuk berpindah menu.*_`

  return sendMenuMessage(ctx, text, {
    buttons: [
      makeQuickButton(`${prefix}allmenu`, '📋 All Menu'),
      makeQuickButton(`${prefix}menu`, '🏠 Main Menu')
    ]
  })
}

async function sendOwnerMenu(ctx) {
  const prefix = ctx.prefix || FrogzzBotZ.prefix || '.'
  const categories = getCategories()

  const text = `\`「 ${FrogzzBotZ.name} 」\`
\`「 Owner Menu 」\`

> Creator : *${FrogzzBotZ.created}*
> Release : *${FrogzzBotZ.release}*
> Prefix : *${prefix}*

_*Menu khusus Owner*_`

  return sendMenuMessage(ctx, text, {
    buttons: [
      makeQuickButton(`${prefix}createdby`, '🛠️ Created By'),
      makeQuickButton(`${prefix}allmenu`, '📋 All Menu')
    ]
  })
}

module.exports = {
  sendMenu,
  sendAllMenu,
  sendCategory,
  sendOwnerMenu,
  getCategories
}
