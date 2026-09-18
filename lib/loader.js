const fs = require('fs')
const path = require('path')

const pluginDir = path.join(__dirname, '..', 'plugin')

function loadPlugin(file) {
  const full = path.join(pluginDir, file)
  delete require.cache[require.resolve(full)]
  try {
    const plugin = require(full)
    if (!plugin || !Array.isArray(plugin.command) || typeof plugin.execute !== 'function') return null
    return { ...plugin, file }
  } catch {
    return null
  }
}

function listPlugins() {
  if (!fs.existsSync(pluginDir)) return []
  return fs.readdirSync(pluginDir).filter(file => file.endsWith('.js')).map(loadPlugin).filter(Boolean)
}

function findPlugin(command) {
  const plugins = listPlugins()
  return plugins.find(plugin => plugin.command.map(item => String(item).toLowerCase()).includes(String(command).toLowerCase())) || null
}

function reloadPlugin(file) {
  return loadPlugin(file)
}

module.exports = {
  loadPlugin,
  listPlugins,
  findPlugin,
  reloadPlugin
}
