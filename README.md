## WebCoder

A collaborative web plain text editor

### Run
    npm install
    npm install -g nodemon
    npm run test

Issues: 
- Concurrency with sessionText and sessions on backend
- Highlighting from other user
- Latency from database transactions interfering - Move lines
- TextMate shortcuts

Using [Ace](https://github.com/ajaxorg/ace), WebSockets, Node, Pug, Express.

Maybe I'll migrate to Go on the server later...
