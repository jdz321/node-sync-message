# node-sync-message

实现node进程间同步通信


## USAGE

子进程创建后2秒，向主进程发消息“who am i”
主进程思考了2秒后回答“you are my child”

### in parent process

```js
const { fork } = require('child_process')
const SyncMessage = require('node-sync-message')

const child = fork('./child.js', {
  stdio: 'inherit',
})
const syncMessageMaster = SyncMessage.master(child)


syncMessageMaster.onMessage = data => {
  log('receive ask: ', data)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('you are my child')
    }, 3000)
  })
}

```

### in child process
```js
const syncMessageChild = require('./index').child()

process.stdin.resume()

async function callParent() {
  const result = await syncMessageChild.send('who am i')

  log('receive answer: ', result) 
}

setTimeout(callParent, 2000)

```