const fileWatcher = require('./service/file-watcher.js')
const fileServer = require('./service/file-server.js')
const eventHandler = require('./service/event-handler.js')
const peerDiscovery = require('./service/peer-discovery.js')
const PeerConnection = require('./service/peer-connection.js')
const Constants = require('./service/constants.js')

eventHandler.listen(Constants.EVENT_FILE_SERVER_STARTED, () => {
  peerDiscovery.startDiscoverer()
})

eventHandler.listen(Constants.EVENT_PEER_UP, (serverNode) => {
  console.log(`Found Node ${serverNode.name} (${serverNode.ip})`)
  let peerConnection = new PeerConnection(serverNode)
  peerConnection.sendMessage('hello')
  window.setTimeout(function () {
    peerConnection.disconnect()
  }, 4000)
})

window.onbeforeunload = function (event) {
  fileServer.stopFileServer()
  fileWatcher.stopFileWatcher()
  peerDiscovery.stopDiscoverer()
}

fileWatcher.startFileWatcher()

fileServer.startFileServer()
