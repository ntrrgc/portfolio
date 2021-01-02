/**
 * Created by ntrrgc on 12/12/15.
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');
var pug = require('pug');
var unirest = require('unirest');
var viewData = require('./view-data');

var file = 'web/index';
var templateFunction = pug.compileFile(file + '.pug', {
    pretty: true
});
var output = templateFunction(viewData);
fs.writeFileSync(file + '.html', output);

async function buildThumbnailSheet() {
    var yaml = require('js-yaml');
    var projects = yaml.safeLoad(fs.readFileSync('projects.yaml', 'utf8'));
    var imageFiles = _.flatten(_.map(projects,
            (project) => viewData.getImageData(project)));

    var height = imageFiles[0].thumbSize.height;
    var fullWidth = _.reduce(imageFiles, (accum, img) => accum + img.thumbSize.width, 0);

    const {createCanvas, loadImage} = require('canvas');
    var canvas = createCanvas(fullWidth, height)
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFCFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var accumX = 0;
    for (let img of imageFiles) {
        ctx.drawImage(await loadImage('web/' + img.imageUrl), accumX, 0,
            img.thumbSize.width, img.thumbSize.height);
        accumX += img.thumbSize.width;
    }

    var jpegData = canvas.createJPEGStream({
        quality: 95
    });
    var outStream = fs.createWriteStream('web/thumbs.jpg')

    jpegData.pipe(outStream);
}

async function main() {
    await buildThumbnailSheet();
    console.log('done');

    unirest.post('http://localhost:35729/changed?files=index.html')
        .send()
        .end();
}

main();