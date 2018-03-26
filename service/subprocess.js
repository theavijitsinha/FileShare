const cp = require('child_process')
const path = require('path')

const Constant = require('./constant.js')

let subprocessList = []

module.exports.startSubprocess = function (modulePath, name) {
  let subprocess = cp.fork(path.resolve(Constant.APP_DIRECTORY, modulePath), {
    'stdio': ['pipe', 'pipe', 'pipe', 'ipc']
  })
  subprocessList[name] = subprocess
  subprocess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })
  // TODO: Figure out how to raise errors instead of just logging
  subprocess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`)
  })
}

module.exports.get = function (name) {
  return name in subprocessList ? subprocessList[name] : null
}

module.exports.killAll = function () {
  for (let subprocess of subprocessList) {
    subprocess.kill()
  }
}

module.exports.Name = {
  'FILE_TRANSFER': 'file-transfer'
}
