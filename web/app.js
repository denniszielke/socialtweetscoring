// Todo App
var DocumentDBClient = require('documentdb').DocumentClient;
var config = require('./config');
var SocList = require('./routes/soclist');
var SearchList = require('./routes/searchlist');
var SocDao = require('./models/socDao');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var appInsights = require('applicationinsights');
appInsights.setup(config.instrumentationKey).setAutoCollectRequests(true).start();
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var insightsClient = appInsights.getClient(config.instrumentationKey);
insightsClient.trackEvent('dashboard-initializing');

var docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});
var socDao = new SocDao(docDbClient, config.databaseId, config.collectionId);
var socList = new SocList(socDao, insightsClient);
var searchList = new SearchList(config.searchApp, config.searchKey, config.searchIndex, config.host, config.authKey, config.databaseId, config.collectionId, insightsClient);
socDao.init(function(err) { if(err) throw err; });

app.get('/', socList.showTweets.bind(socList));
app.get('/search', searchList.searchTweets.bind(searchList));
app.get('/searchinit', searchList.searchInit.bind(searchList));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
