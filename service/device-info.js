const nmi = require('node-machine-id')

const Settings = require('./settings.js')

module.exports = {}

module.exports.getInfoObject = function () {
  if (Settings.machineId() === '') {
    let machineId = nmi.machineIdSync()
    Settings.machineId(machineId)
  }
  return {
    deviceName: Settings.deviceName,
    machineId: Settings.machineId
  }
}
