const User = require('./../models/user');
const Message = require('./../models/message');
const passport = require('passport');
const {generateMessage} = require('../server/utils/message'); // Message generator
const nodemailer = require('nodemailer');
const async = require('async');

module.exports = (app,io) => {
  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

  app.post('/', (req, res) => {
    User.findOne({username: req.body.username}, (err, result) => {
      if (result) {
        return console.log('User already exists.');
      }
        var user = new User();
        user.username = req.body.username;
        user.email = req.body.email;
        user.password = user.encryptPassword(req.body.password);
        user.confirmPassword = user.encryptPassword(req.body.confirmPassword);

        user.save((err, user) => {
          if (err) {
            throw err;
          }
          return user;
        });
      });
    res.redirect('/login');
  });

 app.get('/login', (req, res) => {
   res.render('login.ejs');
 });

 app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    res.redirect('/login');
  });
});

 app.post('/login', passport.authenticate('local.login', {
     successRedirect: '/home',
     failureRedirect: '/login',
     failureFlash: true
 }));

 app.get('/home', (req, res) => {
   User.find({}, (err, result) => {
     if (err) {
       return console.log(err);
     }
     res.render('home.ejs', {
       user: req.user,
       data: result
     });
   })
 });

 app.post('/add_friend', (req, res) => {
   console.log('New friend request came!');
   var from = req.body.from;
   var to = req.body.to;
   var username = req.user.username;
   var wtn = req.user.waiting;
   wtn.push(to);
   User.update({username}, {waiting: wtn}, (err, user) => {
     if (err) {
       return console.log(err);
     }

     User.findOne({username: to}, (err, data) => {
       if (err) {
         return console.log(err);
       }
       var pnd = data.pending;
       pnd.push(from);
       User.update({username: to}, {pending: pnd}, (err, result) => {
         console.log('Updated!');
       })
     });
   });
 });

 app.post('/respond_request', (req, res) => {
   console.log('Going to respond against request!.');
   var from = req.body.from;
   var to = req.body.to;
   var ans = req.body.ans;
   var username = req.user.username;
   var friends = req.user.friends;
   var pnd = req.user.pending;
   var wtn = req.user.waiting;
   friends.push(to);
   for(var i=0; i<pnd.length; i++){
      if (pnd[i] === to)
        pnd.splice(i, 1);
   };
   User.update({username}, {friends, pending: pnd}, (err, result) => {
    if (err) {
      return console.log(err);
    }
      User.findOne({username: to}, (err, data) => {
        var wtn = data.waiting;
        for(var i=0; i<wtn.length; i++){
           if (wtn[i] === from)
             wtn.splice(i, 1);
        };
        console.log(wtn);
        User.update({username: to}, {waiting: wtn, friends: from}, (err, data) => {
            console.log('Updated friends on both sides!.');
        });
      });
   })
 });

 app.get('/chat', (req, res) => {
   User.find({}, (err, result) => {
     if (err) {
       return console.log(err);
     }
     res.render('chat.ejs', {
       user: req.user,
       data: result 
     });
   });
 })
 // app.get('/search', (req, res) => {
 //     res.render('search.ejs', {
 //       user: req.user
 //     })
 //  });

 // app.post('/add_friend', (req, res) => {
 //   console.log('It worked!');
 //   async.parallel([
 //     function(callback) {
 //       if(req.body.receiverName) {
 //         User.update({
 //           'username': req.body.receiverName,
 //           'request.userId': {$ne: req.user._id},
 //           'friendsList.friendId': {$ne: req.user._id}
 //         },
 //         {
 //           $push: {
 //             request: {
 //               userId: req.user._id,
 //               username: req.user.username
 //           }},
 //           $inc: {totalRequest: 1}
 //         },(err, count) => {
 //           console.log(err);
 //           callback(err, count);
 //         })
 //       }
 //     },
 //     function(callback) {
 //       if(req.body.receiverName){
 //         User.update({
 //           'username': req.user.username,
 //           'sentRequest.username': {$ne: req.body.receiverName}
 //         },
 //         {
 //           $push: {
 //             sentRequest: {
 //             username: req.body.receiverName
 //           }}
 //         },(err, count) => {
 //           callback(err, count);
 //         })
 //       }
 //     }],
 //     (err, results) => {
 //       res.redirect('/home');
 //     });
 // });
 // app.get('/add_friend/:id', (req, res) => {
 //   User.findOne({_id: req.params.id}, (err, result) => {
 //     if (err) {
 //       return console.log(err);
 //     }
 //
 //     var transporter = nodemailer.createTransport({
 //           service: 'gmail',
 //           auth: {
 //             user: req.user.email,
 //             pass: 'Yolo18M:)'
 //           },
 //           tls: {
 //             rejectUnauthorized: false
 //           }
 //         });
 //
 //       var mailOptions = {
 //         from: req.user.email,
 //         to: result.email,
 //         subject: 'Friend Request!',
 //         text: `Hello! ${req.user.username} has just send you a friend request!. Login to accept or decline`
 //       };
 //
 //       transporter.sendMail(mailOptions, function(error, info){
 //         if (error) {
 //           console.log(error);
 //         } else {
 //           console.log('Email sent: ' + info.response);
 //         }
 //     });
 //
 //      res.render('user.ejs', {
 //        name: result.username,
 //        email: result.email
 //      });
 //    });
 // });
};
