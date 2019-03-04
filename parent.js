const { fork } = require('child_process')
const SyncMessage = require('./index')
const log = require('./log')('parent')
const delay = require('./delay')

const child = fork('./child.js', {
  stdio: 'inherit',
})
const syncMessageMaster = SyncMessage.master(child)

process.stdin.resume()

child.on('close', (code, signal) => {
  log(`child exit with code ${code}, signal ${signal}`)
  process.exit(0)
})

process.on('exit', (code) => {
  log(`parent exit with code ${code}`)
  child.kill('SIGHUP')
})

process.on('SIGINT', () => {
  log('Received SIGINT.')
})

child.on('message', (msg) => {
  log(`parent receive message`, msg)
})

syncMessageMaster.onMessage = async data => {
  log('receive ask: ', data)
  if (data === 'bye') {
    return 'see you'
  }
  await delay(2000)
  return 'you are my child'
}
