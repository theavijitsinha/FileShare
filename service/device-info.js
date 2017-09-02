const path = require('path')
const nmi = require('node-machine-id')
const fse = require('fs-extra')

module.exports = {}

module.exports.getInfoObject = function () {
  let settingsFile = path.join(__dirname, '../settings/user.json')
  let settings = fse.readJsonSync(settingsFile)
  let obj = {
    deviceName: settings.deviceName,
    machineId: settings.machineId
  }
  if (!settings.machineId) {
    let machineId = nmi.machineIdSync()
    settings.machineId = machineId
    fse.writeJson(settingsFile, settings, {spaces: 2})
    obj.machineId = machineId
  }
  return obj
}
