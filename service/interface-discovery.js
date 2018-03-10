// TODO Can possibly be made more efficient
// TODO Add support for IPv6

module.exports = {}

const NetworkInterface = require('../data_type/network-interface.js')

const Constant = require('./constant.js')

const os = require('os')

let interfaces = {}
let discovererIntervalId = null
let discovererInterval = Constant.INTERFACE_DISCOVERY_INTERVAL

module.exports.startDiscoverer = function () {
  discovererIntervalId = setInterval(() => {
    let netInterfaces = os.networkInterfaces()
    let netInterfaceNames = Object.keys(netInterfaces)

    let curInterfaces = []

    for (let i = 0; i < netInterfaceNames.length; i++) {
      let netInterface = netInterfaces[netInterfaceNames[i]]
      for (let j = 0; j < netInterface.length; j++) {
        let networkAddress = netInterface[j]
        if (networkAddress.family === 'IPv6') {
          continue
        }
        if (networkAddress.internal) {
          continue
        }
        if (!(networkAddress.address in interfaces)) {
          interfaces[networkAddress.address] = new NetworkInterface(netInterfaceNames[i],
            networkAddress.address, networkAddress.netmask)
        }
        curInterfaces.push(networkAddress.address)
      }
    }

    let prevInterfaces = Object.keys(interfaces)
    for (let i = 0; i < prevInterfaces.length; i++) {
      if (!curInterfaces.includes(prevInterfaces[i])) {
        delete interfaces[prevInterfaces[i]]
      }
    }
  }, discovererInterval)
}

module.exports.stopDiscoverer = function () {
  window.clearInterval(discovererIntervalId)
  interfaces = {}
}

module.exports.getMulticastAddresses = function () {
  let multicastAddresses = []
  for (let interfaceAddress in interfaces) {
    multicastAddresses.push(interfaces[interfaceAddress].getMulticastAddress())
  }
  return multicastAddresses
}
