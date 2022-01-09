const { ipcRenderer } = require('electron')

ipcRenderer.on('open-file', (_, text) => {
  const textarea = document.getElementById('content')
  textarea.innerHTML = text
})
