const fse = require('fs-extra')
const path = require('path')

const fileWatcher = require('./service/file-watcher.js')
const fileServer = require('./service/file-server.js')
const eventHandler = require('./service/event-handler.js')
const peerDiscovery = require('./service/peer-discovery.js')
const Constant = require('./service/constant.js')
const subprocess = require('./service/subprocess.js')

require('./user_interface/react_compiled/main.react.js')

const file = path.resolve('./resources/app/settings/user.json')
fse.pathExists(file)
  .then(exists => {
    if (!exists) {
      fse.copy(path.resolve('./resources/app/settings/default.json'),
      path.resolve('./resources/app/settings/user.json'),
      err => {
        if (err) return console.error(err)
      })
    }
  })

eventHandler.listen(Constant.Event.FILE_SERVER_STARTED, () => {
  peerDiscovery.startDiscoverer()
})

fileWatcher.startFileWatcher()

subprocess.startSubprocess('file-transfer.js', subprocess.Name.FILE_TRANSFER)

fileServer.startFileServer()

// Stop running services before closing window
window.onbeforeunload = function (event) {
  fileServer.stopFileServer()
  fileWatcher.stopFileWatcher()
  peerDiscovery.stopDiscoverer()
  subprocess.killAll()
}
