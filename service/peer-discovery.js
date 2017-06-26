module.exports = {}

const ServerNode = require('../data_type/server-node.js')

const eventHandler = require('./event-handler.js')
const interfaceDiscovery = require('./interface-discovery.js')
const Constants = require('./constants.js')

const dgram = require('dgram')

const discoverServiceName = 'fileshare_discover'
const discoverServiceVersion = '1'

let socketIP = Constants.PEER_DISCOVERY_IP
let socketPort = Constants.PEER_DISCOVERY_PORT

let interval = Constants.PEER_DISCOVERY_INTERVAL
let downInterval = Constants.PEER_DISCOVERY_DOWN_INTERVAL
let timeouts = {}
let announcerID = null

let server = null

let serverNodes = {}

module.exports.peers = serverNodes

module.exports.startDiscoverer = function () {
  interfaceDiscovery.startDiscoverer()

  server = dgram.createSocket('udp4')

  server.on('error', (err) => {
    console.log(`Peer Discovery Server Error:\n${err.stack}`)
    server.close()
  })

  server.on('message', messageHandler)

  server.on('listening', () => {
    server.setBroadcast(true)
    startAnnouncing()
    console.log(`Peer Discoverer Started`)
  })

  server.on('close', () => {
    console.log(`Peer Discoverer Stopped`)
  })

  server.bind(socketPort, socketIP)
}

module.exports.stopDiscoverer = function () {
  window.clearInterval(announcerID)
  server.close()
  interfaceDiscovery.stopDiscoverer()
}

function messageHandler (msg, rinfo) {
  let message = JSON.parse(msg.toString())

  if (message.name === discoverServiceName && message.version === discoverServiceVersion) {
    if (!(rinfo.address in serverNodes)) {
      serverNodes[rinfo.address] = new ServerNode(rinfo.address, rinfo.address)
      eventHandler.emit(Constants.EVENT_PEER_UP, serverNodes[rinfo.address])
    }
    if (rinfo.address in timeouts) {
      window.clearTimeout(timeouts[rinfo.address])
    }
    timeouts[rinfo.address] = setTimeout(function () {
      delete serverNodes[rinfo.address]
      delete timeouts[rinfo.address]
    }, downInterval)
    eventHandler.emit(Constants.EVENT_PEER_DOWN)
  }
}

function startAnnouncing () {
  announcerID = setInterval(() => {
    let message = {
      name: discoverServiceName,
      version: discoverServiceVersion
    }
    let multicastAddresses = interfaceDiscovery.getMulticastAddresses()
    for (let i = 0; i < multicastAddresses.length; i++) {
      server.send(JSON.stringify(message), socketPort, multicastAddresses[i])
    }
  }, interval)
}
