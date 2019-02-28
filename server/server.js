// Dependencies
const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const ejs = require('ejs');
const engine = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');


// Instances
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
const {generateMessage} = require('../server/utils/message'); // Message generator


// Connecting to database
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ChatApp', {useNewUrlParser: true});


// Configurations
app.use(express.static(publicPath));
app.engine('ejs', engine);
app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(flash()); // Display flashes
app.use(passport.initialize()); // Connecting to passport.js
app.use(passport.session());


// Access to controllers/routes
require('../routes/userRoutes')(app,io);
// Requiring passport for authentication
require('../config/passport');

io.on('connection', (socket) => {
   console.log('New User connected');

   socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

   socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user joined'));

   socket.on('createMessage', (message, callback) => {
     console.log('createMessage', message);
     io.emit('newMessage', generateMessage(message.from, message.text));
     callback();
   });
  socket.on('disconnect', () => {
   console.log('User was disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
