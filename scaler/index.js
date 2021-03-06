const http = require('http')
const url = require('url')

const sleep = require('./lib/sleep')
const ScaleManager = require('./ScaleManagerArgoCD')

let locker
let isRunning = false

let SCALE_DOWN_WAIT_MINUTES = 1
if (process.env.SCALE_DOWN_WAIT_MINUTES) {
  SCALE_DOWN_WAIT_MINUTES = Number(process.env.SCALE_DOWN_WAIT_MINUTES)
}
if (SCALE_DOWN_WAIT_MINUTES < 5) {
  SCALE_DOWN_WAIT_MINUTES = 5
}

let SCALE_DOWN_WAIT = SCALE_DOWN_WAIT_MINUTES * 60 * 1000

function getTime () {
  return new Date().getTime()
}

async function main () {
  await ScaleManager.init()

  let scaleDownTimer

  let handler = async function (req, res) {
    // let delay = 0
    if (isRunning === false) {
      setTimeout(() => {
        res.end('') // 這個要放在最前面，才能確保curl不會阻塞
      }, 15000)
    }
    else {
      res.end('') // 這個要放在最前面，才能確保curl不會阻塞
    }
    
    // return false
    // -----------------------------

    const {remote_addr, force_scale_up = false, status} = url.parse(req.url, true).query;
    // console.log({url: req.url, force_scale_up, isRunning, status})

    if (remote_addr === '127.0.0.1') {
      return false
    }
    // console.log('go')

    // console.log({url: req.url, force_scale_up, isRunning, status, remote_addr})
    
    if (isRunning === true && force_scale_up !== false) {
      // console.log('Set force')
      isRunning = false
    }

    if (isRunning === false) {
      isRunning = true
      while (true) {
        try {
          if ((await ScaleManager.up()) === false) {
            // console.log('Already to up')
            return false
          }
          break
        }
        catch (e) {
          console.error(e)
          await sleep(10000)
        }
      }
        

    }
    // locker = getTime()
    // let currentLocker = locker
    
    // console.log('Wait for scale down...', SCALE_DOWN_WAIT_MINUTES , (new Date()))
    // await sleep(SCALE_DOWN_WAIT)
    // console.log({currentLocker, locker})
    // if (currentLocker !== locker) {
    //   console.log('prevent scaledown', (new Date()))
    //   return false
    // }
    clearTimeout(scaleDownTimer)
    scaleDownTimer = setTimeout(async () => {
      if (isRunning === true) {
        while (true) {
          try {
            await ScaleManager.down()
            break
          } catch (e) {
            console.error(e)
            await sleep(10000)
          }
        }
        isRunning = false
      }
    }, SCALE_DOWN_WAIT)
  }

  const server = http.createServer(handler)

  server.listen(8080);
  console.log('Scaler is ready.')
}

main()

process.on('SIGTERM', function () {
  console.log('SIGTERM fired')
  process.exit(1)
})