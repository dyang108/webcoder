var {
  SessionText,
  app
} = require('./config')
require('./socket')
app.route('/')
  .get((req, res) => {
    res.render('index', {url: process.env.MAIN_URL})
  })

app.route('/:sessionId')
  .get((req, res) => {
    SessionText.findOne({
      sessionId: req.params.sessionId
    }, (err, st) => {
      if (err) {
        console.log(err)
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

app.route('/create-session')
  .post((req, res) => {
    if (req.body.sessionId.includes(' ')) {
      res.redirect(process.env.MAIN_URL)
      return
    }
    SessionText.findOne({
      sessionId: req.body.sessionId
    }, (err, existingSt) => {
      if (err) {
        console.log(err)
        res.send(500)
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
            res.send(500)
            return
          }
          res.redirect(process.env.MAIN_URL + req.body.sessionId)
          res.end()
        })
      }
    })
  })
