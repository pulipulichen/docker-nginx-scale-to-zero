if (process.argv[2] === '127.0.0.1') {
  process.exit()
}

const ScaleUp = require('./ScaleUp')
const ScaleDown = require('./ScaleDown')

const sleep = require('./lib/sleep')

let SCALE_DOWN_WAIT = 5000
if (process.env.SCALE_DOWN_WAIT) {
  SCALE_DOWN_WAIT = Number(process.env.SCALE_DOWN_WAIT)
}

async function main() {

  await ScaleUp()

  await sleep(SCALE_DOWN_WAIT)

  await ScaleDown()

}

main()

// http://localhost:7000/files/