const fs = require('fs');

const lockerFilePath = '/tmp/locker.txt'

function getTime () {
  return (new Date()).getTime()
}

function lock () {
  let time = getTime() + ''
  fs.writeFileSync(lockerFilePath, getTime(), 'utf-8')
  return time
}

function unlock (time) {
  let previousTime = fs.readFileSync(lockerFilePath, 'utf')
  if (previousTime === time) {
    return true
  }
  else {
    return false
  }
}
