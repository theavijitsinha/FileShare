const React = require('react')

const fileWatcher = require('../../service/file-watcher.js')
const eventHandler = require('../../service/event-handler.js')
const Constant = require('../../service/constant.js')

const FileTree = require('./file-tree.react.js')

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {tree: fileWatcher.fileTree}

    this.setFileTree = this.setFileTree.bind(this)
  }

  componentDidMount () {
    eventHandler.listen(Constant.Event.USER_FILES_CHANGED, this.setFileTree)
  }

  componentWillUnmount () {
    eventHandler.unlisten(Constant.Event.USER_FILES_CHANGED, this.setFileTree)
  }

  render () {
    let template = <FileTree tree={this.state.tree} />
    return template
  }

  setFileTree () {
    this.setState({
      tree: fileWatcher.fileTree
    })
  }
}

module.exports = App
