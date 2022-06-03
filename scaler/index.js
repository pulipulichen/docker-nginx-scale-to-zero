const http = require('http')
const url = require('url')

const sleep = require('./lib/sleep')
const ScaleManager = require('./ScaleManager')

let locker
let isRunning = false

let SCALE_DOWN_WAIT = 5000
if (process.env.SCALE_DOWN_WAIT) {
  SCALE_DOWN_WAIT = Number(process.env.SCALE_DOWN_WAIT)
}

function getTime () {
  return new Date().getTime()
}

async function main () {
  await ScaleManager.init()

  const server = http.createServer(async function (req, res) {
    res.end('') // 這個要放在最前面，才能確保curl不會阻塞
    return false
    // -----------------------------

    const {remote_addr} = url.parse(req.url, true).query;
    
    if (remote_addr === '127.0.0.1') {
      return false
    }
    
    if (isRunning === false) {
      isRunning = true
      await ScaleManager.up()
    }
    locker = getTime()
    let currentLocker = locker
    
    await sleep(SCALE_DOWN_WAIT)

    if (currentLocker !== locker) {
      // console.log('prevent scaledown')
      return false
    }

    if (isRunning === true) {
      await ScaleManager.down()
      isRunning = false
    }

  })

  server.listen(8080);
  console.log('Scaler is ready.')
}

main()

process.on('SIGTERM', function () {
  console.log('SIGTERM fired')
  process.exit(1)
})