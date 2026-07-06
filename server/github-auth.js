var passport = require('passport')
var {
  app,
  User
} = require('./config')
var GitHubStrategy = require('passport-github').Strategy

// init passport
// No express-session middleware is set up and req.user is never read after
// the redirect, so authenticate with session: false to keep the OAuth
// round-trip stateless.
app.use(passport.initialize())

app.get('/auth/github',
  passport.authenticate('github', { session: false }))

app.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/git-login')
  })

app.route('/git-login')
  .get((req, res) => {
    res.render('git-login')
  })

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user)
  })
})

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.MAIN_URL + 'auth/github/callback'
},
function (accessToken, refreshToken, profile, cb) {
  User.findOne({
    githubId: profile.id
  }, (err, user) => {
    if (err) {
      cb(err, undefined)
      return
    }
    if (user) {
      cb(err, user)
    } else {
      let newUser = new User({githubId: profile.id})
      newUser.save((err, savedUser) => {
        return cb(err, savedUser)
      })
    }
  })
}))
