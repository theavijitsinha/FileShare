const path = require('path')

module.exports = {}

module.exports.Event = {
  FILE_SERVER_STARTED: 'server_started',
  FILE_SERVER_MESSAGE: 'message',

  FILE_CLIENT_MESSAGE: 'message',

  PEER_UP: 'peer_up',
  PEER_DOWN: 'peer_down',

  FILE_WATCHER_STARTED: 'file_watcher_started',
  FILE_WATCHER_STOPPED: 'file_watcher_stopped',

  USER_FILES_CHANGED: 'user_files_changed'
}

module.exports.APP_DIRECTORY = path.resolve(__dirname, '..')

module.exports.FILE_SERVER_IP = '0.0.0.0'
module.exports.FILE_SERVER_PORT = 8000

module.exports.PEER_DISCOVERY_IP = '0.0.0.0'
module.exports.PEER_DISCOVERY_PORT = 9000
module.exports.PEER_DISCOVERY_INTERVAL = 500
module.exports.PEER_DISCOVERY_DOWN_INTERVAL = 2000

module.exports.INTERFACE_DISCOVERY_INTERVAL = 500
