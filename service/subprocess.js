const cp = require('child_process')

let subprocessList = []

module.exports.startSubprocess = function (modulePath, name) {
  // TODO: The path needs to be fixed. Child process module may not always be in
  // the service directory. Also, hard coded path looks extremely ugly.
  let subprocess = cp.fork('./resources/app/service/' + modulePath, {
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
}
