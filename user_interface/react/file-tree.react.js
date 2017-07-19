const React = require('react')

const FileTreeNode = require('./file-tree-node.react.js')

class FileTree extends React.Component {
  render () {
    let node = this.props.tree.root
    return <FileTreeNode node={node} children={node.children} />
  }
}

module.exports = FileTree
