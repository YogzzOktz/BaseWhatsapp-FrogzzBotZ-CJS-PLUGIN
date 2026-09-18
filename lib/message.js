const { getMessageText, getButtonId, getSender, getSenderNumber, getChat, isGroup, getCommand, getQuotedText } = require('../Okta')

function createContext(BotInfo, FrogzzBotZ, message) {
  const text = getMessageText(message)
  const buttonId = getButtonId(message)
  const input = text || buttonId
  const parsed = getCommand(input.startsWith('.') ? input : `.${input}`)
  const sender = getSender(message)
  const senderNumber = getSenderNumber(message)
  const chat = getChat(message)

  return {
    BotInfo,
    FrogzzBotZ,
    message,
    m: message,
    text,
    buttonId,
    input,
    command: parsed.command,
    args: parsed.args,
    prefix: parsed.prefix,
    sender,
    senderNumber,
    chat,
    isGroup: isGroup(message),
    quotedText: getQuotedText(message),
    reply: text => FrogzzBotZ.sendMessage(chat, { text: String(text) }, { quoted: message }),
    send: content => FrogzzBotZ.sendMessage(chat, content, { quoted: message })
  }
}

module.exports = { createContext }
