# node-sync-message

实现node进程间同步通信


## USAGE

子进程创建后2秒，向主进程发消息“who am i”，然后等待回答  
主进程收到消息，思考了2秒后回答“you are my child”

### in parent process

```js
const { fork } = require('child_process')
const SyncMessage = require('node-sync-message')
const delay = require('delay')

const child = fork('./child.js', {
  stdio: 'inherit',
})
const syncMessageMaster = SyncMessage.master(child)


syncMessageMaster.onMessage = async (data) => {
  console.log('parent receive ask: ', data) 

  await delay(2000)

  return 'you are my child'
}

```

### in child process
```js
const syncMessageChild = require('node-sync-message').child()
const delay = require('delay')

(async () => {
  await delay(2000)

  const result = await syncMessageChild.send('who am i')

  console.log('clild receive answer: ', result) 
})()

```

#### Continuation-passing style (CPS) 

```js
const syncMessageChild = require('node-sync-message').child()
const delay = require('delay')


(async () => {
  await delay(2000)

  syncMessageChild.send('who am i', (err, res) => {
    console.log('clild receive answer: ', result) 
  })

  await delay(4000)
})()

```

#### Set timeout time

```js
const syncMessageChild = require('node-sync-message').child()
const delay = require('delay')


(async () => {
  await delay(2000)

  try {
    // promise -> reject, throw an error
    const result = await syncMessageChild.send('who am i', { timeout: 1000 })
    console.log('clild receive answer: ', result) 
  } catch(err) {
    console.log('clild receive error: ', err)
  }

  syncMessageChild.send('who am i', { timeout: 1000 }, (err, res) => {
    // err instanceof Error === true
    console.log('clild receive error: ', err)
    // res -> undefined
    console.log('clild receive answer: ', res)
  })

  await delay(4000)
})()

```