
const input = document.getElementById('file')
input.addEventListener('change', handleFiles, false)
function handleFiles() {
  const file = this.files[0]
  const textarea = document.getElementById('content')
  textarea.innerHTML = file.name
}
