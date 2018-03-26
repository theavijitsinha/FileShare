const path = require('path')
const fs = require('fs-extra')

const Constant = require('./constant.js')

const settingsFile = path.resolve(Constant.APP_DIRECTORY, 'settings/user.json')
if (!fs.pathExistsSync(settingsFile)) {
  fs.copySync(path.resolve(Constant.APP_DIRECTORY, 'settings/default.json'),
    settingsFile)
}

let settings = fs.readJsonSync(settingsFile)

function updateSetting (name, value) {
  settings[name] = value
  fs.writeJsonSync(settingsFile, settings, {spaces: 2})
}

module.exports.deviceName = function (deviceName = null) {
  if (deviceName === null) {
    return settings.deviceName
  } else {
    updateSetting('deviceName', deviceName)
  }
}

module.exports.machineId = function (machineId = null) {
  if (machineId === null) {
    return settings.machineId
  } else {
    updateSetting('machineId', machineId)
  }
}

module.exports.sharedPaths = function (sharedPaths = null) {
  if (sharedPaths === null) {
    return settings.sharedPaths
  } else {
    updateSetting('sharedPaths', sharedPaths)
  }
}

module.exports.defaultDownloadPath = function (defaultDownloadPath = null) {
  if (defaultDownloadPath === null) {
    return settings.defaultDownloadPath
  } else {
    updateSetting('defaultDownloadPath', defaultDownloadPath)
  }
}
