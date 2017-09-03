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
  let sharedPathsArray = fse.readJsonSync(path.join(__dirname, '../settings/user.json')).sharedPaths
  let sharedPaths = []
  for (let sharedPathObj of sharedPathsArray) {
    if (fse.pathExistsSync(sharedPathObj.path)) {
      sharedPaths.push(sharedPathObj.path)
      fileTree.addNode(sharedPathObj.path, Tree.NodeType.BASE_DIR_NODE, sharedPathObj.id)
    }
  }

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
