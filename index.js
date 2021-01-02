/**
 * Created by ntrrgc on 11/12/15.
 */
var express = require('express');
var app = express();
var tinylr = require('tiny-lr');
var chokidar = require('chokidar');
var request = require('request');
var viewData = require('./view-data');
viewData.devMode = true;

var port = 9000;

var escapeHTML = function (unsafe) {
    return unsafe.replace(/[&<"']/g, function (m) {
        switch (m) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '"':
                return '&quot;';
            default:
                return '&#039;';
        }
    });
};

app
    .set('views', 'web')
    .set('view engine', 'pug')
    .get('/', function (req, res) {
        res.render('index', viewData)
    })
    .use(express.static(__dirname + '/web'))
    .use(tinylr.middleware({
        app: app
    }))
    .use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('<html><head>' +
            '<script src="/livereload.js"></script></head>' +
            '<body><pre>' +
            escapeHTML(err.stack) +
            '</pre></body></html>')
    })
    .listen(port, function () {
        console.log('Listening on port %d.', port);
    });

app.locals.pretty = true;

var watcher = chokidar.watch(['web/index.pug', 'web/*.js', '*.yaml'], {
    persistent: true,
    usePolling: true,
});

var log = console.log.bind(console);
watcher
    .on('change', function (path) {
        request.post('http://localhost:' + port + '/changed?files=index.html', function (error, response, body) {
            if (!error) {
                log('Reloading...')
            }
        });
    })