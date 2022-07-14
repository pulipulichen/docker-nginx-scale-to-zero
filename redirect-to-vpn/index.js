const express = require('express')
const app = express()

let port = 9002
if (process.env.PORT_REDIRECT_TO_VPN) {
   port = Number(process.env.PORT_REDIRECT_TO_VPN)
}

app.all('*', function (req, res) {
  if (req.originalUrl === '/favicon.ico') {
    return res.end()
  }

  // 80:31080/TCP,443:31443/TCP
  let vpnHTTPPort = 31080
  if (process.env.VPN_HTTP_PORT) {
    vpnHTTPPort = Number(process.env.VPN_HTTP_PORT)
  }
  let vpnHTTPSPort = 31443
  if (process.env.VPN_HTTPS_PORT) {
    vpnHTTPSPort = Number(process.env.VPN_HTTPS_PORT)
  }

  //console.log(req.originalUrl)
  let hostname = req.hostname
  // hostname = 'db.test20220428-2220.pudding.paas.dlll.nccu.edu.tw'

  //console.log(hostname)

  let from = '.paas.'
  let to = '.paas-vpn.'
  if (process.env.HOSTNAME_FROM) {
    from = '.' + process.env.HOSTNAME_FROM + '.'
  }

  if (hostname.indexOf(from) === -1) {
    console.erwror('Illegal URL: ' + getFullURL(req))
    res.status(403)
  	   .send('Illegal URL')
    return res.end(); //end the response
  }

  if (process.env.HOSTNAME_TO) {
    to = '.' + process.env.HOSTNAME_TO + '.'
  }

  hostname = hostname.replace(from, to)

  // let toURL = req.protocol + '://' + hostname + ':' + vpnHTTPPort + req.originalUrl
  // console.log('Redirect from: ' + getFullURL(req) + ' to: ' + toURL) 

  //res.write(toURL); //write a response to the client
  //res.redirect(toURL);

  let html = `<!DOCTYPE html>
  <html>
  <head><title>Redirect to ${hostname}</title></head>
  <script>

  </script>
  <body>
  
  <h1>Redirect to ${hostname}</h1>
  <p>Before redirecting, <strong style="color: red;">make sure you are now connected to the VPN.</strong></p>
  <p>You will be redirected shortly. Thank you for your patience</p>
  <p><a id="link" href=""></a></p>
  
  <script>
  let urlObject = new URL(location.href)
  let port = ${vpnHTTPPort}
  if (urlObject.protocol === "https") {
    port = ${vpnHTTPPort}
  }
  urlObject.port = port

  urlObject.hostname = "${hostname}"

  let toURL = urlObject.href
  document.getElementById("link").innerText = toURL
  document.getElementById("link").href = toURL

  setTimeout(function () {
    location.href = toURL
  }, 3000)
  </script>
  </body>
  </html>`
  res.writeHead(200, {'Content-Type':'text/html'});
  res.write(html);

  res.end(); //end the response
})

function getFullURL (req) {
  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  //const port = process.env.PORT || PORT;

  const fullUrl = `${protocol}://${host}${url}`
  return fullUrl
}

app.listen(port)
console.log('Redirect to VPN is ready: http://localhost:' + port)

process.on('SIGTERM', function () {
  console.log('SIGTERM fired')
  process.exit(1)
})