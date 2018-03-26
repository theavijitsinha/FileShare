module.exports = {}

const Tree = require('../data_type/tree.js')

const eventHandler = require('./event-handler.js')
const Constant = require('./constant.js')
const Settings = require('./settings.js')

const chokidar = require('chokidar')
const fse = require('fs-extra')
const path = require('path')

let watcher = null
let fileTree = new Tree()

module.exports.startFileWatcher = function () {
  fileTree.clearTree()
  let sharedPaths = Settings.sharedPaths()
  let sharedPathsArray = []
  for (let sharedPathObj of sharedPaths) {
    if (fse.pathExistsSync(sharedPathObj.path)) {
      sharedPathsArray.push(sharedPathObj.path)
      fileTree.addNode(sharedPathObj.path, Tree.NodeType.BASE_DIR_NODE, sharedPathObj.id)
    }
  }

  watcher = chokidar.watch(sharedPathsArray, {ignored: /(^|[/\\])\../})
    .on('addDir', function (path) {
      fileTree.addNode(path, Tree.NodeType.DIR_NODE)
      eventHandler.emit(Constant.Event.USER_FILES_CHANGED)
    })
    .on('add', function (path) {
      fileTree.addNode(path, Tree.NodeType.FILE_NODE)
      eventHandler.emit(Constant.Event.USER_FILES_CHANGED)
    })
    .on('unlinkDir', function (path) {
      fileTree.deleteNode(path)
      eventHandler.emit(Constant.Event.USER_FILES_CHANGED)
    })
    .on('unlink', function (path) {
      fileTree.deleteNode(path)
      eventHandler.emit(Constant.Event.USER_FILES_CHANGED)
    })

  eventHandler.emit(Constant.Event.FILE_WATCHER_STARTED)
}

module.exports.stopFileWatcher = function () {
  if (watcher !== null) {
    fileTree.clearTree()
    watcher.close()
    watcher = null
    eventHandler.emit(Constant.Event.FILE_WATCHER_STOPPED)
  }
}

module.exports.getPublicTree = function (returnJSON = false) {
  return fileTree.relativePaths(returnJSON)
}

module.exports.getAbsolutePath = function (id, nodePath) {
  return path.join(fileTree.baseDirPath(id), nodePath)
}

module.exports.fileTree = fileTree
