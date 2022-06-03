const path = require('path')
const fs = require('fs')

const ShellExec = require('./lib/ShellExec')
const sleep = require('./lib/sleep')
const ArgocdHelpers = require('./ArgocdHelpers')

const gitParentFolder = '/dlll_paas/project_git/'

const {DEPLOY_GIT_URL, BRANCH} = process.env

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

  await ShellExec(`git config --global user.email "${username}@${host}"`)
  await ShellExec(`git config --global user.name "${username}"`)

}

async function checkRepo () {
  await ShellExec(`git checkout -b ${BRANCH} || git checkout ${BRANCH}`)

  // await ShellExec(`ls -l`)
}

async function pullRepo () {
  await ShellExec(`git reset --hard`)
  await ShellExec(`git pull --rebase`)
}

async function cloneGitRepo () {
  if (fs.existsSync(gitFolder) === false) {
    process.chdir(gitParentFolder)
    await ShellExec(`git clone -b ${BRANCH} ${DEPLOY_GIT_URL} || git clone ${DEPLOY_GIT_URL}`, {retry: 3})
  }
}

let token
async function pushRepo () {
  process.chdir(gitFolder)
  await ShellExec([
    `git add .`,
    `git commit -m "ScaleManager: ${(new Date())}" --allow-empty`,
  ])
  await ShellExec(`git push -f ${DEPLOY_GIT_URL}`, { retry: 10 })

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

  console.log('ScaleInit\t', (new Date()))

  await cloneGitRepo()
  await setGitUser()

  process.chdir(gitFolder)
  await checkRepo()
}

async function update() {
  process.chdir(gitFolder)
  await pullRepo()
}

async function ScaleUp() {
  while (gitLock === true) {
    await sleep(100)
  }
  gitLock = true

  console.log('ScaleUp\t', (new Date()))

  process.chdir(gitFolder)
  await update()

  modifyValuesYAML('false', 'true')

  await pushRepo()

  gitLock = false
}

async function ScaleDown() {
  while (gitLock === true) {
    await sleep(100)
  }
  gitLock = true

  console.log('ScaleDown\t', (new Date()))

  process.chdir(gitFolder)
  await update()

  modifyValuesYAML('true', 'false')

  await pushRepo()

  gitLock = false
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