const path = require('path')
const fs = require('fs')

const ShellExec = require('./lib/ShellExec')
const sleep = require('./lib/sleep')
const ArgocdHelpers = require('./ArgocdHelpers')

const gitParentFolder = '/dlll_paas/project_git/'

const {DEPLOY_GIT_URL, BRANCH} = process.env
if (!DEPLOY_GIT_URL) {
  process.exit()
}

const verbose = true

function getRepoName () {
  // const DEPLOY_GIT_URL = DEPLOY_GIT_URL
  let REPO_NAME = DEPLOY_GIT_URL.slice(DEPLOY_GIT_URL.lastIndexOf('/') + 1)
  REPO_NAME = REPO_NAME.slice(0, REPO_NAME.lastIndexOf('.'))

  return REPO_NAME
}

const gitFolder = '/dlll_paas/project_git/' + getRepoName()
const configKey = 'wake_up_server: '
let gitLock = false

async function setGitUser () {

  let {username, host} = new URL(DEPLOY_GIT_URL)

  await ShellExec(`git config --global user.email "${username}@${host}"`, {verbose})
  await ShellExec(`git config --global user.name "${username}"`, {verbose})

}

async function checkRepo () {
  await ShellExec(`git checkout -b ${BRANCH} || git checkout ${BRANCH}`, {verbose})

  // await ShellExec(`ls -l`)
}

async function pullRepo () {
  await ShellExec(`git reset --hard`, {verbose})
  await ShellExec(`git pull --rebase`, {verbose})
}

async function cloneGitRepo () {
  if (fs.existsSync(gitFolder) === false) {
    process.chdir(gitParentFolder)
    await ShellExec(`git clone -b ${BRANCH} ${DEPLOY_GIT_URL} || git clone ${DEPLOY_GIT_URL}`, {retry: 3, verbose})
  }
}

let token
async function pushRepo () {
  process.chdir(gitFolder)
  await ShellExec([
    `git add .`,
    `git commit -m "ScaleManager: ${(new Date())}" --allow-empty`,
  ], {verbose: false })
  await ShellExec(`git push -f ${DEPLOY_GIT_URL}`, { retry: 10, verbose })

  if (!token) {
    token = await ArgocdHelpers.getCookieToken()
  }

  await ArgocdHelpers.refreshApp(BRANCH, token)
  await ArgocdHelpers.sleep(1000)
  await ArgocdHelpers.syncApp(BRANCH, token)
  await ArgocdHelpers.sleep(1000)
  await ArgocdHelpers.waitOperation(BRANCH, token)
}

async function ScaleInit() {

  // console.log('ScaleInit\t', (new Date()))

  // await cloneGitRepo()
  // await setGitUser()

  // process.chdir(gitFolder)
  // await checkRepo()

  if (process.env.HIBERNATE_AFTER_RESTART && 
      process.env.HIBERNATE_AFTER_RESTART === 'true') {
    if (!token) {
      token = await ArgocdHelpers.getCookieToken()
    }
    console.log('Reset Parameter')
    await ArgocdHelpers.resetParameter(BRANCH, token)
  }
    
}

async function update() {
  process.chdir(gitFolder)
  await pullRepo()
}

async function ScaleUp() {
  if (gitLock === 'up') {
    return false
  }
  while (gitLock !== false) {
    await sleep(100)
  }
  gitLock = 'up'

  // console.log((new Date()), 'ScaleUp', )

  // process.chdir(gitFolder)
  // await update()

  // modifyValuesYAML('false', 'true')

  // await pushRepo()
  if (!token) {
    token = await ArgocdHelpers.getCookieToken()
  }
  await ArgocdHelpers.setParameterWekaUp(BRANCH, token, true)


  gitLock = false

  return true
}

async function ScaleDown() {
  if (gitLock !== false) {
    console.log('scale down is processing...')
    return false
  }
  while (gitLock !== false) {
    await sleep(100)
  }
  gitLock = 'down'

  console.log((new Date(), 'ScaleDown'))

  // process.chdir(gitFolder)
  // await update()

  // modifyValuesYAML('true', 'false')

  // await pushRepo()
  if (!token) {
    token = await ArgocdHelpers.getCookieToken()
  }
  await ArgocdHelpers.setParameterWekaUp(BRANCH, token, false)

  gitLock = false

  return true
}

const valuesPath = path.join(gitFolder, '/values.yaml')
function modifyValuesYAML (from, to) {
  
  let content = fs.readFileSync(valuesPath, 'utf-8')

  let pos = content.indexOf(configKey)
  if (pos === -1) {
    content = content + '\n' + configKey + to
  }
  else {
    content = content.replaceAll(configKey + from, configKey + to)
  }

  fs.writeFileSync(valuesPath, content, 'utf-8')
}


module.exports = {
  init: ScaleInit,
  up: ScaleUp,
  down: ScaleDown,
}