const React = require('react')
const ReactDOM = require('react-dom')

const App = require('./app.react.js')

const element = <App />
ReactDOM.render(
  element,
  document.getElementById('main-window')
)
