var {
  Session,
  SessionText,
  server
} = require('./config')
var CronJob = require('cron').CronJob
const WebSocket = require('ws')

const wss = new WebSocket.Server({server})
var clients = {}

function addClientToSession (sessionId, clientHandle) {
  Session.findOne({
    user: clientHandle
  }, (err, session) => {
    if (err) {
      console.log(err)
    }
    if (!session) {
      let newSession = new Session({
        sessionId,
        user: clientHandle
      })
      newSession.save()
    }
  })
}

function changeSyntax (msgobj, clientHandle) {
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
          clients[session.user].send(JSON.stringify({
            type: 'syntax',
            mode: msgobj.mode
          }))
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
    st.mode = msgobj.mode
    st.save()
  })
}

function makeEdit (msgobj, clientHandle) {
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
          clients[session.user].send(JSON.stringify({
            type: 'edit',
            change: msgobj.change
          }))
        }
      }
    })
  })
  // need to deal with concurrency issues with the sessionText object
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

function removeSessionLater (sessionId) {
  let dateObj = Date.now()
  // ten minutes before deleting the session
  dateObj += 1000 * 60 * 10
  let cronTime = new Date(dateObj)
  let job = new CronJob({
    cronTime,
    onTick: function () {
      Session.find({
        sessionId
      }, (err, sessions) => {
        if (err) {
          console.log(err)
          return
        }
        if (sessions.length === 0) {
          SessionText.remove({
            sessionId
          }, (err) => {
            if (err) {
              console.log(err)
            }
          })
        }
      })
    },
    start: false,
    timeZone: 'America/New_York'
  })
  job.start()
}

function closeConnection (clientHandle) {
  console.log('closing connection ', clientHandle)
  delete clients[clientHandle]
  Session.findOne({
    user: clientHandle
  }, (err, session) => {
    if (err) {
      console.log(err)
      return
    }
    if (session) {
      let sessionId = session.sessionId
      session.remove((err) => {
        if (err) {
          console.log(err)
        }
        removeSessionLater(sessionId)
      })
    }
  })
}

function heartbeat () {
  this.isAlive = true
}

wss.on('connection', function connection (ws) {
  ws.isAlive = true
  ws.on('pong', heartbeat)
  let clientHandle = ws._socket._handle.fd
  clients[clientHandle] = ws
  ws.on('message', function incoming (message) {
    let msgobj = JSON.parse(message)
    if (msgobj.type === 'init') {
      addClientToSession(msgobj.sessionId, clientHandle)
    } else if (msgobj.type === 'syntax') {
      changeSyntax(msgobj, clientHandle)
    } else {
      makeEdit(msgobj, clientHandle)
    }
  })
  ws.on('close', function () {
    closeConnection(clientHandle)
  })
})

setInterval(function ping () {
  wss.clients.forEach(function each (ws) {
    if (ws.isAlive === false) return ws.terminate()

    ws.isAlive = false
    ws.ping('', false, true)
  })
}, 30000)
