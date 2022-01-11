const { ipcRenderer } = require('electron')
const fs = require('fs').promises
const path = require('path')

const arg = process.argv.filter(p => p.indexOf("--app-dir=") >= 0)[0]
const dir = arg.substr(arg.indexOf("=") + 1)
const logfile = path.join(dir, 'preload.log')

ipcRenderer.on('open-file', async (_, text) => {
  // no console when contextIsolation is false
  // console.log('marker')
  // under test, no content written, but file got created
  await fs.writeFile(logfile, 'marker', 'utf8')
  const textarea = document.getElementById('content')
  textarea.innerHTML = text
})
