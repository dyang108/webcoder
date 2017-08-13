var editor = ace.edit("editor");
var splitUrl = document.location.href.split('/')
var sessionId = splitUrl[splitUrl.length - 1]
document.getElementById('editor').style.fontSize='14px';
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

var serverChange = false

var ws = new WebSocket('ws://localhost:8000/')

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'init',
    sessionId
  }))
}

ws.onmessage = msg => {
  let change = JSON.parse(msg.data)
  serverChange = true
  switch(change.action) {
    case 'insert':
      editor.session.insert(change.start, change.lines.join('\n'))
      break
    case 'remove':
      editor.session.remove(change)
  }
  serverChange = false
}

editor.session.on('change', function (e) {
  if (!serverChange) {
    ws.send(JSON.stringify({
      type: 'edit',
      change: e,
      text: editor.getValue(),
      sessionId
    }))
  }
})
