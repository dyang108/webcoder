// Set up server and socket
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var server = require('http').createServer(app)
// DB imports
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var path = require('path')

var Session = mongoose.model('Session', {
  sessionId: String,
  user: {type: Number, unique: true}
})

var SessionText = mongoose.model('SessionText', {
  sessionId: {type: String, unique: true},
  text: String
})

const WebSocket = require('ws')
const wss = new WebSocket.Server({server})
var clients = {}

function addClientToSession (sessionId, clientHandle) {
  Session.findOne({
    user: clientHandle
  }, (err, session) => {
    if (!session) {
      let newSession = new Session({
        sessionId,
        user: clientHandle
      })
      newSession.save()
    }
  })
}

wss.on('connection', function connection (ws) {
  let clientHandle = ws._socket._handle.fd
  clients[clientHandle] = ws;
  ws.on('message', function incoming (message) {
    let msgobj = JSON.parse(message)
    if (msgobj.type === 'init') {
      addClientToSession(msgobj.sessionId, clientHandle)
    } else {
      Session.find({
        sessionId: msgobj.sessionId
      }, (err, sessions) => {
        if (err) {
          console.log(err)
          return
        }
        sessions.forEach(session => {
          if (session.user !== clientHandle) {
            if (clients[session.user]) {
              clients[session.user].send(JSON.stringify(msgobj.change))
            }
          }
        })
      })
      SessionText.findOne({
        sessionId: msgobj.sessionId
      }, (err, st) => {
        if (err) {
          console.log(err)
          return
        }
        if (!st) {
          console.log('Text not found')
          return
        }
        st.text = msgobj.text
        st.save()
      })
    }
  })
  ws.on('close', function () {
    delete clients[clientHandle]
    Session.remove({
      user: clientHandle
    }, (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
})

const port = 8000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

// connect to the database
var url = 'mongodb://localhost:27017/webcoder'
mongoose.connect(url)
var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  server.listen(port, () => {
    console.log('App running on port ' + port)
  })
})

app.route('/')
  .get((req, res) => {
    res.sendFile('index.html')
  })

app.route('/:sessionId')
  .get((req, res) => {
    res.sendFile(__dirname + '/public/editor.html')
  })

app.route('/create-session')
  .post((req, res) => {
    if (req.body.sessionId.includes(' ')) {
      res.redirect('http://localhost:8000')
      return
    }
    let st = new SessionText({
      text: '',
      sessionId: req.body.sessionId
    })
    st.save((err, savedSt) => {
      res.redirect('http://localhost:8000/' + req.body.sessionId)
      res.end()
    })
  })
