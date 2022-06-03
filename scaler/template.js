const fs = require('fs');

function main () {
  let content = fs.readFileSync('/etc/nginx/conf.d/default.conf.template', 'utf-8')

  let backends = JSON.parse(process.env.BACKENDS)
  // console.log(backends)

  backends.forEach(function (config, i) {
    let parts = config.split(',')
    let backendContent
    if (parts.length > 1) {
      let port = parts[0]
      let backend = parts[1]

      backendContent = content.replaceAll("${BACKEND}", backend)
                                  .replaceAll("${PORT}", port)
    }
    else {
      let backend = parts[0]
      backendContent = content.replaceAll("${BACKEND}", backend)
    }

    // console.log(backendContent)
      
    fs.writeFileSync(`/etc/nginx/conf.d/default-${i}.conf`, backendContent, 'utf-8')
  })
}

main()