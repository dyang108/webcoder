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

Issues: 
- Concurrency with sessionText and sessions on backend
- Highlighting from other user
- Latency from database transactions interfering - Move lines
- TextMate shortcuts

Using [Ace](https://github.com/ajaxorg/ace), WebSockets, Node, Pug, Express.

Maybe I'll migrate to Go on the server later...
