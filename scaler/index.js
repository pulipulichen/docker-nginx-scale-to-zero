const http = require('http')
const url = require('url')

const sleep = require('./lib/sleep')
const ScaleUp = require('./ScaleUp')
const ScaleDown = require('./ScaleDown')

let locker
let isRunning = false

let SCALE_DOWN_WAIT = 5000
if (process.env.SCALE_DOWN_WAIT) {
  SCALE_DOWN_WAIT = Number(process.env.SCALE_DOWN_WAIT)
}

function getTime () {
  return new Date().getTime()
}

const server = http.createServer(async function (req, res) {
  const {remote_addr} = url.parse(req.url, true).query;
  
  if (remote_addr === '127.0.0.1') {
    return res.end('')
  }
  
  if (isRunning === false) {
    await ScaleUp()
    isRunning = true
  }
  locker = getTime()
  let currentLocker = locker
  
  await sleep(SCALE_DOWN_WAIT)

  if (currentLocker !== locker) {
    // console.log('prevent scaledown')
    return res.end('')
  }

  if (isRunning === true) {
    await ScaleDown()
    isRunning = false
  }

  res.end('')
})

server.listen(8080);
console.log('Scaler is ready.')