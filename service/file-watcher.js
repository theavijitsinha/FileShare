module.exports = {}

const Tree = require('../data_type/tree.js')

const eventHandler = require('./event-handler.js')
const Constants = require('./constants.js')

const chokidar = require('chokidar')
const fse = require('fs-extra')
const path = require('path')

let watcher = null
let fileTree = new Tree()

module.exports.startFileWatcher = function () {
  fileTree.clearTree()
  let sharedPaths = fse.readJsonSync(path.join(__dirname, '../settings/user.json')).sharedPaths

  watcher = chokidar.watch(sharedPaths, {ignored: /(^|[/\\])\../})
  .on('addDir', function (path) {
    fileTree.addNode(path, Tree.NodeType.DIR_NODE)
    eventHandler.emit(Constants.Event.USER_FILES_CHANGED)
  })
  .on('add', function (path) {
    fileTree.addNode(path, Tree.NodeType.FILE_NODE)
    eventHandler.emit(Constants.Event.USER_FILES_CHANGED)
  })
  .on('unlinkDir', function (path) {
    fileTree.deleteNode(path)
    eventHandler.emit(Constants.Event.USER_FILES_CHANGED)
  })
  .on('unlink', function (path) {
    fileTree.deleteNode(path)
    eventHandler.emit(Constants.Event.USER_FILES_CHANGED)
  })

  eventHandler.emit(Constants.Event.FILE_WATCHER_STARTED)
}

module.exports.stopFileWatcher = function () {
  if (watcher !== null) {
    fileTree.clearTree()
    watcher.close()
    watcher = null
    eventHandler.emit(Constants.Event.FILE_WATCHER_STOPPED)
  }
}

module.exports.getPublicTree = function (returnJSON = false) {
  return fileTree.excludePaths(returnJSON)
}

module.exports.fileTree = fileTree
