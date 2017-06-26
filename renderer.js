const fileWatcher = require('./service/file-watcher.js')
const fileServer = require('./service/file-server.js')
const eventHandler = require('./service/event-handler.js')
const peerDiscovery = require('./service/peer-discovery.js')
const Constants = require('./service/constants.js')

eventHandler.listen(Constants.EVENT_FILE_SERVER_STARTED, () => {
  peerDiscovery.startDiscoverer()
})

fileWatcher.startFileWatcher()

fileServer.startFileServer()

// Stop running services before closing window
window.onbeforeunload = function (event) {
  fileServer.stopFileServer()
  fileWatcher.stopFileWatcher()
  peerDiscovery.stopDiscoverer()
}
