const axios = require('axios')
const fetch = require('node-fetch')

const fs = require('fs')

const axiosRetry = require('axios-retry')
axiosRetry(axios, { retries: 10 })
axiosRetry(axios, { retryDelay: (retryCount) => {
    return retryCount * 1000;
}})

const tmpTokenPath = '/tmp/argocd.token.txt'

let config
module.exports = {
    getConfig: async function () {
        if (config) {
            return config
        }

        const ARGOCD_AUTH_TOKEN = process.env.ARGOCD_AUTH_TOKEN

        try {
            config = JSON.parse(Buffer.from(ARGOCD_AUTH_TOKEN, 'base64').toString())

            if (!config.username || !config.password || !config.server) {
                throw new Error('ARGOCD_AUTH_TOKEN is not well configured.')
            }
        }
        catch (e) {
            console.error(e)
            throw new Error('ARGOCD_AUTH_TOKEN is not well configured.')
        }
        return config
    },
    getCookieToken: async function () {
        if (fs.existsSync(tmpTokenPath)) {
            return fs.readFileSync(tmpTokenPath, 'utf8')
        }
        await this.getConfig()

        const result = await axios.post(config.server + '/api/v1/session', {
            "username": config.username,
            "password": config.password
        })

        const token = result.data.token

        fs.writeFileSync(tmpTokenPath, token, 'utf8')

        return token
    },
    setParameterWekaUp: async function (appName, token, wakeUp = true) {
        await this.getConfig()
        //const url = config.server + '/api/v1/applications/deploybot-' + appName + '?refresh=normal'
        const url = config.server + '/api/v1/applications/deploybot-' + appName

        const data = {
            "apiVersion": "argoproj.io/v1alpha1",
            "kind": "Application",
            "metadata": {
              "name": "deploybot-" + appName
            },
            "spec": {
                "source": {
                  "repoURL": "https://gitlab.nccu.syntixi.dev/deploybot/argocd.git",
                  "path": ".",
                  "targetRevision": appName,
                  "helm": {
                    "parameters": [
                      {
                        "name": "wake_up_server",
                        "value": `${wakeUp}`
                      }
                    ]
                  }
                },
                "destination": {
                  "server": "https://kubernetes.default.svc",
                  "namespace": "default"
                },
                "project": "default",
                "syncPolicy": {
                  "automated": {
                    "prune": true,
                    "selfHeal": true
                  },
                  "syncOptions": [
                    "CreateNamespace=true"
                  ]
                }
              }
          }

        let result
        try {
            result = await axios.put(url, data, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
        }
        catch (e) {
            return false
        }
        return true
    },
    resetParameter: async function (appName, token) {
        await this.getConfig()
        //const url = config.server + '/api/v1/applications/deploybot-' + appName + '?refresh=normal'
        const url = config.server + '/api/v1/applications/deploybot-' + appName

        const data = {
            "apiVersion": "argoproj.io/v1alpha1",
            "kind": "Application",
            "metadata": {
              "name": "deploybot-" + appName
            },
            "spec": {
                "source": {
                  "repoURL": "https://gitlab.nccu.syntixi.dev/deploybot/argocd.git",
                  "path": ".",
                  "targetRevision": appName
                },
                "destination": {
                  "server": "https://kubernetes.default.svc",
                  "namespace": "default"
                },
                "project": "default",
                "syncPolicy": {
                  "automated": {
                    "prune": true,
                    "selfHeal": true
                  },
                  "syncOptions": [
                    "CreateNamespace=true"
                  ]
                }
              }
          }

        let result
        try {
            result = await axios.put(url, data, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
        }
        catch (e) {
            return false
        }
        return true
    },
    refreshApp: async function (appName, token) {
        await this.getConfig()
        //const url = config.server + '/api/v1/applications/deploybot-' + appName + '?refresh=normal'
        const url = config.server + '/api/v1/applications/deploybot-' + appName + '?refresh=hard'
        let result
        try {
            result = await axios.get(url, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
        }
        catch (e) {
            return false
        }
        return true
    },
    syncApp: async function (appName, token) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications/deploybot-' + appName + '/sync'
        const data = {
            "revision": appName,
            "prune": true,
            "dryRun": false,
            "strategy": {
                "hook": {
                    //"force": false
                    "force": true
                }
            },
            "resources": null,
            "syncOptions": {
                "items": [
                    "PruneLast=true"
                ]
            }
        }

        let result
        try {
            result = await axios.post(url, data, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
            //console.log('SYNC RESULT')
            //console.log(result)
        }
        catch (e) {
            return false
        }
        return true
    },
    
    sleep: function (ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    waitOperation: async function (appName, token, retry = 0) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications/deploybot-' + appName
        // https://argocd.nccu.syntixi.dev/api/v1/settings
        let result
        result = await axios.get(url, {
            headers: {
                Cookie: 'argocd.token=' + token
            }
        })

        let status = result.data.status

        if (retry === 30) {
          return status
        }
        
        // console.log('==Retry: ' + retry + '===========================')
        // console.log(status)
        // console.log('=============================')
        // console.log(status.resources)
        // console.log('=============================')

        //if (status.health.status !== 'Healthy') {
        //if (status.operationState.phase !== 'Running') {
        if (status.conditions && 
            (status.conditions[0].type.indexOf('Error') > -1 )) {
            // console.log('==Retry: ' + retry + '===========================')
            // console.log(status)
            // console.log('=============================')
            // console.log(status.resources)
            // console.log('=============================')

            // console.log('============================')
            // console.log('Condition have errors')
            // console.log('============================')
            return status
        }

        if (status.health && 
            status.health.status === 'Degraded' && 
            status.operationState && 
            status.operationState.phase !== 'Running') {
            

            // console.log('==Retry: ' + retry + '===========================')
            // console.log(status)
            // console.log('=============================')
            // console.log(status.resources)
            // console.log('=============================')

            // console.log('============================')
            // console.log('Health degraded')
            // console.log('============================')
            await this.sleep(10000)
            await this.syncApp(appName, token)
            retry++
            return status
        }

        if (status.operationState && 
                status.operationState.phase === 'Running' && 
                status.operationState.message && 
                status.operationState.message.startsWith('one or more objects failed to apply, reason:')) {
            // console.log('==Retry: ' + retry + '===========================')
            // console.log(status)
            // console.log('=============================')
            // console.log(status.resources)
            // console.log('=============================')
            
            // console.log('============================')
            // console.log('Failed to apply')
            // console.log('============================')
            return status
        }

        if (status.operationState && 
            status.operationState.phase === 'Error') {
            // console.log('==Retry: ' + retry + '===========================')
            // console.log(status)
            // console.log('=============================')
            // console.log(status.resources)
            // console.log('=============================')
            
            // console.log('============================')
            // console.log('Operation error')
            // console.log('============================')
            return status
        }

        if ((status.operationState && status.operationState.phase === 'Succeeded') && 
            status.health.status === 'Progressing' && 
            status.resources.filter(r => r.health && r.health.status !== 'Healthy').length > 0 ) {
            await this.sleep(10000)
            retry++
            // console.log('============================')
            // console.log('Wait for resource not healthy: ' + retry)
            // console.log('============================')
            return await this.waitOperation(appName, token, retry)
        }

        if ((status.operationState && status.operationState.phase === 'Running') || 
            status.health.status === 'Progressing') {
            await this.sleep(10000)
            retry++
            // console.log('============================')
            // console.log('Wait for Progressing: ' + retry)
            // console.log('============================')
            return await this.waitOperation(appName, token, retry)
        }

        // console.log('============================')
        // console.log('Status: Healthy')
        // console.log('============================')
        return status
    },
    
}
