var {
  SessionText,
  app
} = require('./config')
require('./socket')
require('./github-auth')

app.route('/')
  .get((req, res) => {
    res.render('index', {url: process.env.MAIN_URL})
  })

app.route('/create-session')
  .post((req, res) => {
    if (!req.body.sessionId || /\s/.test(req.body.sessionId)) {
      res.redirect(process.env.MAIN_URL)
      return
    }
    SessionText.findOne({
      sessionId: req.body.sessionId
    }, (err, existingSt) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
        return
      }
      if (existingSt) {
        res.redirect(process.env.MAIN_URL + req.body.sessionId)
        res.end()
      } else {
        let st = new SessionText({
          text: '',
          sessionId: req.body.sessionId,
          mode: 'ace/mode/javascript'
        })
        st.save((err, savedSt) => {
          if (err) {
            console.log(err)
            res.sendStatus(500)
            return
          }
          res.redirect(process.env.MAIN_URL + req.body.sessionId)
          res.end()
        })
      }
    })
  })

// keep the catch-all session route last so it doesn't shadow other routes
app.route('/:sessionId')
  .get((req, res) => {
    SessionText.findOne({
      sessionId: req.params.sessionId
    }, (err, st) => {
      if (err) {
        console.log(err)
        res.sendStatus(500)
        return
      }
      if (!st) {
        res.redirect(process.env.MAIN_URL)
        res.end()
        return
      }
      res.render('editor', {text: st.text, mode: st.mode, socket: process.env.SOCKET_URL, env: process.env.NODE_ENV})
    })
  })
