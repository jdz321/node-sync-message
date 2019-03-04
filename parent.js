const { fork } = require('child_process')
const SyncMessage = require('./index')
const log = require('./log')('parent')

const child = fork('./child.js', {
  stdio: 'inherit',
})
const syncMessageMaster = SyncMessage.master(child)

process.stdin.resume()

child.on('close', (code, signal) => {
  log(`child exit with code ${code}, signal ${signal}\n`)
  process.exit(0)
})

process.on('exit', (code) => {
  log(`parent exit with code ${code}\n`)
  child.kill('SIGHUP')
})

process.on('SIGINT', () => {
  log('\nReceived SIGINT.\n')
})

child.on('message', (msg) => {
  log(`parent receive message`, msg)
})

syncMessageMaster.onMessage = data => {
  log('receive ask: ', data)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('you are my child')
    }, 3000)
  })
}
