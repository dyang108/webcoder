## WebCoder

A collaborative web plain text editor

### Run
Requires a local MongoDB server (`mongod`) running.

    cp .env-sample .env   # then fill in Github OAuth credentials if desired
    npm install
    npm start

For development with auto-reload:

    npm install -g nodemon
    npm run test

Note: the default port is 3000 because macOS AirPlay Receiver occupies port 5000.

Github login is optional: leave `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` unset to disable it.

### Deploy (Render)
`render.yaml` defines the service. In the Render dashboard choose New > Blueprint,
pick this repo, and paste a [MongoDB Atlas](https://www.mongodb.com/atlas) connection
string when prompted for `MONGODB_URI`. `MAIN_URL` and `SOCKET_URL` are derived from
the Render hostname automatically. To enable Github login, add `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` env vars with the OAuth app callback set to
`https://<your-app>.onrender.com/auth/github/callback`.

Issues: 
- Concurrency with sessionText and sessions on backend
- Highlighting from other user
- Latency from database transactions interfering - Move lines
- TextMate shortcuts

Using [Ace](https://github.com/ajaxorg/ace), WebSockets, Node, Pug, Express.

Maybe I'll migrate to Go on the server later...
