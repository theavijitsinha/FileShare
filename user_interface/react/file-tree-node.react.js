const React = require('react')

class FileTreeNode extends React.Component {
  render () {
    let subList = null
    if (this.props.node.children.length > 0) {
      let subListItems = this.props.node.children.map((child) =>
        <FileTreeNode key={child.path} node={child} />
      )
      subList = (
        <ul>
          {subListItems}
        </ul>
      )
    }
    let template = (
      <li>
        {this.props.node.name}
        {subList}
      </li>
    )
    return template
  }
}

module.exports = FileTreeNode
