const fs = require('fs');

function filterBackend(backend) {
  if (backend.startsWith('http://')) {
    backend = backend.slice(7)
  }
  if (backend.startsWith('https://')) {
    backend = backend.slice(8)
  }
  if (backend.endsWith('/')) {
    backend = backend.slice(0, -1)
  }

  return backend
}

function main () {
  let content = fs.readFileSync('/etc/nginx/conf.d/default.conf.template', 'utf-8')

  if (!process.env.BACKENDS) {
    return false
  }

  let {CONNECT_TIMEOUT = '7s'} = process.env

  let backends = JSON.parse(process.env.BACKENDS)
  // console.log(backends)

  backends.forEach(function (config, i) {
    let parts = config.split(',')
    let backendContent
    if (parts.length > 1) {
      let port = parts[0]
      let backend = filterBackend(parts[1])

      backendContent = content.replaceAll("${BACKEND}", backend)
                                  .replaceAll("${PORT}", port)
    }
    else {
      let backend = filterBackend(parts[0])
      backendContent = content.replaceAll("${BACKEND}", backend)
    }

    backendContent = backendContent.replaceAll("${CONNECT_TIMEOUT}", CONNECT_TIMEOUT)

    // console.log(backendContent)
      
    fs.writeFileSync(`/etc/nginx/conf.d/default-${i}.conf`, backendContent, 'utf-8')
  })
}

main()