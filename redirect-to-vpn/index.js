const express = require('express')
const app = express()

let port = 8082
// if (process.env.APP_PORT) {
//   port = Number(process.env.APP_PORT)
// }

app.all('*', function (req, res) {
  if (req.originalUrl === '/favicon.ico') {
    return res.end()
  }

  // 80:31080/TCP,443:31443/TCP
  let vpnPort = 31080
  if (process.env.VPN_HTTP_PORT) {
    vpnPort = Number(process.env.VPN_HTTP_PORT)
  }

  if (req.protocol === 'https') {
    vpnPort = 31443
    if (process.env.VPN_HTTPS_PORT) {
      vpnPort = Number(process.env.VPN_HTTPS_PORT)
    }
  }

  //console.log(req.originalUrl)
  let hostname = req.hostname
  // hostname = 'db.test20220428-2220.pudding.paas.dlll.nccu.edu.tw'

  //console.log(hostname)
  if (hostname.indexOf('.paas.') === -1) {
    console.error('Illegal URL: ' + getFullURL(req))
    res.status(403)
  	   .send('Illegal URL')
    return res.end(); //end the response
  }

  hostname = hostname.replace('.paas.', '.paas-vpn.')

  let toURL = req.protocol + '://' + hostname + ':' + vpnPort + req.originalUrl
  console.log('Redirect from: ' + getFullURL(req) + ' to: ' + toURL) 

  //res.write(toURL); //write a response to the client
  //res.redirect(toURL);

  let html = `<!DOCTYPE html>
  <html>
  <head><title>Redirect to ${toURL}</title></head>
  <body>
  
  <h1>Redirect to ${toURL}</h1>
  <p>Before redirecting, <strong style="color: red;">make sure you are now connected to the VPN.</strong></p>
  <p>You will be redirected shortly. Thank you for your patience</p>
  <p><a href="${toURL}">${toURL}</a></p>
  
  <script>
  setTimeout(function () {
    location.href = "${toURL}"
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
console.log('Redirect to VPN is started: http://localhost:' + port)