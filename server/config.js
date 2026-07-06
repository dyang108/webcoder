require('dotenv').config()

// On Render the public hostname is provided at runtime; derive the app
// urls from it so the blueprint works whatever the service is named
if (process.env.RENDER_EXTERNAL_HOSTNAME) {
  if (!process.env.MAIN_URL) {
    process.env.MAIN_URL = 'https://' + process.env.RENDER_EXTERNAL_HOSTNAME + '/'
  }
  if (!process.env.SOCKET_URL) {
    process.env.SOCKET_URL = 'wss://' + process.env.RENDER_EXTERNAL_HOSTNAME + '/'
  }
}
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
  text: String,
  mode: String
})

var User = mongoose.model('User', {
  githubId: {type: String, unique: true}
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '../public')))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, '../public'))

// connect to the database
var url = process.env.MONGODB_URI
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  server.listen(process.env.PORT, () => {
    console.log('App running on port ' + process.env.PORT)
  })
})

module.exports = {
  Session,
  SessionText,
  User,
  app,
  server
}
