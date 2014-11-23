var express = require('express'),
    user = require('./routes/users'),
    expressValidator = require('express-validator');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(expressValidator());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
});

app.get('/', user.index);
app.get('/listusers',user.listusers);
app.post('/newuser',user.newUser);
app.get('/deleteuser/:id', user.deleteUser);
app.post('/login', user.login);
app.get('/logout', user.logout);

app.listen(app.get('port'));
console.log('Server is listening on port '+app.get('port')+'...');