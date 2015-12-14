/**
 * Created by ntrrgc on 12/12/15.
 */
var _ = require('lodash');
var fs = require('fs');
var getImageSize = require('image-size');
var marked = require('jstransformer')(require('jstransformer-marked'));
var striptags = require('striptags');

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
    })

    var jpegData = canvas.jpegStream();
    var outStream = fs.createWriteStream('web/thumbs.jpg')

    jpegData.pipe(outStream, callback);
}

function get(obj, key) {
    if (!obj) {
        throw new Error("Object is " + obj.toString());
    }
    if (key in obj) {
        return obj[key];
    } else {
        throw new Error("Missing key: " + key);
    }
}

function getImageData(project) {
    if (!('images' in project)) {
        return [];
    }
    var keys = _.keys(project.images).sort();
    return _.map(keys, function(key) {
        const extensions = ['.jpg', '.png'];
        const thumbHeight = 200;

        var url = 'img/' + project.id + '-' + key;
        var ext = _.find(extensions, function(ext) {
            return fs.existsSync('web/' + url + ext);
        });
        if (!ext) {
            throw new Error("Missing image file: " + url);
        }

        url += ext;
        var originalSize = getImageSize('web/' + url);
        var thumbSize = {
            height: thumbHeight,
            width: Math.round((originalSize.width * thumbHeight) / originalSize.height)
        };

        return {
            id: project.id + '-' + key,
            project: project.title,
            key: key,
            imageUrl: url,
            thumbSize: thumbSize,
            originalSize: originalSize,
            description: marked.render(project.images[key]).body,
        }
    })
}

function calculateThumbMap(projects) {
    var ret = {
        fullWidth: 0,
        thumbPositions: {}
    };

    projects.forEach(function(project) {
        var images = getImageData(project);
        images.forEach(function(image) {
            ret.thumbPositions[image.id] = {
                x: ret.fullWidth,
                y: 0
            };
            ret.fullWidth += image.thumbSize.width;
        })
    });

    return ret;
}

function getAllImageData(projects) {
    return _.flatten(_.map(projects, p => getImageData(p)));
}

module.exports = {
    require: require,
    get: get,
    getImageData: getImageData,
    getAllImageData: getAllImageData,
    calculateThumbMap: calculateThumbMap,
    striptags: striptags
};