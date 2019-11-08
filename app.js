var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var proxy = require('http-proxy-middleware');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static/js',express.static(path.join(__dirname, 'public/javascripts')));
app.use('/static/css',express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/',express.static(path.join(__dirname, 'public/images')));

app.use('/', indexRouter);

var restream = function(proxyReq, req, res, options) {
  if (req.body) {
      let bodyData = JSON.stringify(req.body);
      // incase if content-type is application/x-www-form-urlencoded -> we need to change to application/json
      proxyReq.setHeader('Content-Type','application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // stream the content
      proxyReq.write(bodyData);
  }
}

var options = {
  target: process.env.ESIP||"http://127.0.0.1:9200/", // 目标服务器 host
  changeOrigin: true,               // 默认false，是否需要改变原始主机头为目标URL
  ws: false,             
  onProxyReq: restream
};
var exampleProxy = proxy(options);
app.use('/', exampleProxy);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
