if (process.argv[2] === '127.0.0.1') {
  process.exit()
}

console.log('GOGOoksdsd', (new Date() + '', process.argv[2]))

setTimeout(() => {
  console.log('off')
}, 3000)

// http://localhost:7000/files/