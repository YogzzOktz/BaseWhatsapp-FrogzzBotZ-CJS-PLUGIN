const { getTargetFromArgs, getSender, isOwner, isPremium, normalizeNumber } = require('../Okta')

async function getGroupData(ctx) {
  if (!ctx.isGroup) return null
  const metadata = await ctx.FrogzzBotZ.groupMetadata(ctx.chat)
  const sender = getSender(ctx.message)
  const bot = ctx.FrogzzBotZ.user?.id || ''
  const senderEntry = metadata.participants.find(p => p.id === sender || p.lid === sender || p.phoneNumber === sender || p.id === ctx.message?.key?.participantAlt)
  const botEntry = metadata.participants.find(p => p.id === bot || p.lid === bot || p.phoneNumber === bot)
  const senderAdmin = Boolean(senderEntry?.admin)
  const botAdmin = Boolean(botEntry?.admin)
  return { metadata, senderEntry, botEntry, senderAdmin, botAdmin }
}

async function requireGroupAccess(ctx) {
  if (!ctx.isGroup) {
    await ctx.reply('Perintah ini hanya dapat digunakan di grup.')
    return false
  }
  const data = await getGroupData(ctx)
  const owner = isOwner(ctx.senderNumber)
  const premium = isPremium(ctx.senderNumber)
  if (!owner && !premium) {
    await ctx.reply('Perintah ini tersedia untuk premium atau owner.')
    return false
  }
  if (!data.senderAdmin) {
    await ctx.reply('Kamu harus menjadi admin grup.')
    return false
  }
  if (!data.botAdmin) {
    await ctx.reply('FrogzzBotZ harus menjadi admin grup.')
    return false
  }
  return data
}

async function kick(ctx) {
  const data = await requireGroupAccess(ctx)
  if (!data) return
  const target = getTargetFromArgs(ctx.message, ctx.args)
  if (!target) return ctx.reply('Tag, reply, atau masukkan nomor target.')
  await ctx.FrogzzBotZ.groupParticipantsUpdate(ctx.chat, [target], 'remove')
  await ctx.reply('Anggota berhasil dikeluarkan.')
}

async function add(ctx) {
  const data = await requireGroupAccess(ctx)
  if (!data) return
  const target = getTargetFromArgs(ctx.message, ctx.args)
  if (!target) return ctx.reply('Masukkan nomor target, contoh .add 628123456789')
  await ctx.FrogzzBotZ.groupParticipantsUpdate(ctx.chat, [target], 'add')
  await ctx.reply('Permintaan penambahan anggota telah diproses.')
}

async function closeGroup(ctx) {
  const data = await requireGroupAccess(ctx)
  if (!data) return
  await ctx.FrogzzBotZ.groupSettingUpdate(ctx.chat, 'announcement')
  await ctx.reply('Grup sekarang hanya dapat dikirim oleh admin.')
}

async function openGroup(ctx) {
  const data = await requireGroupAccess(ctx)
  if (!data) return
  await ctx.FrogzzBotZ.groupSettingUpdate(ctx.chat, 'not_announcement')
  await ctx.reply('Grup sekarang dapat dikirim oleh semua anggota.')
}

async function infoGroup(ctx) {
  if (!ctx.isGroup) return ctx.reply('Perintah ini hanya dapat digunakan di grup.')
  const data = await getGroupData(ctx)
  const admins = data.metadata.participants.filter(p => p.admin).length
  await ctx.reply(`Nama: ${data.metadata.subject}\nID: ${ctx.chat}\nAnggota: ${data.metadata.participants.length}\nAdmin: ${admins}`)
}

module.exports = {
  getGroupData,
  kick,
  add,
  closeGroup,
  openGroup,
  infoGroup
}
