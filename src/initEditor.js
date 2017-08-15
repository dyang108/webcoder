import { languages, keybindings } from './lists'

var editor = ace.edit('editor')
var splitUrl = document.location.href.split('/')
var sessionId = splitUrl[splitUrl.length - 1]
document.getElementById('editor').style.fontSize = '14px'
editor.setTheme('ace/theme/monokai')
editor.session.setUseWorker(false)
var langSelect = document.getElementById('language-select')
var keybindingSelect = document.getElementById('keybinding-select')
editor.session.setMode(mode)

var isChanging = false
var ws = new WebSocket(socket)

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'init',
    sessionId
  }))
}

ws.onmessage = msg => {
  let edit = JSON.parse(msg.data)
  isChanging = true
  if (edit.type === 'edit') {
    let change = edit.change
    switch (change.action) {
      case 'insert':
        editor.session.insert(change.start, change.lines.join('\n'))
        break
      case 'remove':
        editor.session.remove(change)
    }
  } else if (edit.type === 'syntax') {
    setMode(edit.mode)
  }
  isChanging = false
}

editor.session.on('change', function (e) {
  if (!isChanging) {
    ws.send(JSON.stringify({
      type: 'edit',
      change: e,
      text: editor.getValue(),
      sessionId
    }))
  }
})

function setMode (newMode) {
  editor.session.setMode(newMode)
  let ind = languages.findIndex(elem => elem.src === newMode)
  langSelect.selectedIndex = ind
}

function populateLanguages () {
  languages.forEach(lang => {
    let opt = document.createElement('option')
    opt.setAttribute('value', lang.src)
    opt.innerHTML = lang.name
    langSelect.appendChild(opt)
  })
  if (mode) {
    setMode(mode)
  }
}
populateLanguages()

function populateKeyBindings () {
  keybindings.forEach(kbtype => {
    let opt = document.createElement('option')
    opt.setAttribute('value', kbtype.src)
    opt.innerHTML = kbtype.name
    keybindingSelect.appendChild(opt)
  })
}
populateKeyBindings()

function changeHighlighting (newMode) {
  editor.session.setMode(newMode)
  if (!isChanging) {
    ws.send(JSON.stringify({
      type: 'syntax',
      sessionId,
      mode: newMode
    }))
  }
}

langSelect.onchange = function () {
  var selectedMode = langSelect.options[langSelect.selectedIndex].value
  changeHighlighting(selectedMode)
}

keybindingSelect.onchange = function () {
  var selectedKeybinding = keybindingSelect.options[keybindingSelect.selectedIndex].value
  if (selectedKeybinding === 'ace') {
    selectedKeybinding = undefined
  // } else if (selectedKeybinding === 'sublime') {
  //   selectedKeybinding = sublBindings
  }
  console.log(JSON.stringify(editor.getKeyboardHandler()))
  editor.setKeyboardHandler(selectedKeybinding)
}
