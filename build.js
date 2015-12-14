/**
 * Created by ntrrgc on 12/12/15.
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');
var jade = require('jade');
var unirest = require('unirest');
var viewData = require('./view-data');

var file = 'web/index';
var templateFunction = jade.compileFile(file + '.jade', {
    pretty: true
});
var output = templateFunction(viewData);
fs.writeFileSync(file + '.html', output);

function buildThumbnailSheet(callback) {
    var yaml = require('js-yaml');
    var projects = yaml.safeLoad(fs.readFileSync('projects.yaml', 'utf8'));
    var imageFiles = _.flatten(_.map(projects,
            (project) => viewData.getImageData(project)));

    var height = imageFiles[0].thumbSize.height;
    var fullWidth = _.reduce(imageFiles, (accum, img) => accum + img.thumbSize.width, 0);

    var Canvas = require('canvas')
        , Image = Canvas.Image
        , canvas = new Canvas(fullWidth, height)
        , ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFCFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function readImage(path) {
        var im = new Image;
        im.src = fs.readFileSync(path);
        return im;
    }

    var accumX = 0;
    imageFiles.forEach(function (img) {
        ctx.drawImage(readImage('web/' + img.imageUrl), accumX, 0,
            img.thumbSize.width, img.thumbSize.height);
        accumX += img.thumbSize.width;
    });

    var jpegData = canvas.jpegStream({
        quality: 95
    });
    var outStream = fs.createWriteStream('web/thumbs.jpg')

    jpegData.pipe(outStream, callback);
}

buildThumbnailSheet(function() { console.log('done')})

unirest.post('http://localhost:35729/changed?files=index.html')
    .send()
    .end();