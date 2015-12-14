/**
 * Created by ntrrgc on 13/12/15.
 */
window.onload = function() {
    var elevator = new Elevator({
        element: document.querySelector('.elevator-button'),
        duration: 4000 // milliseconds
    });
};

;(function() {
    var throttle = function(type, name, obj) {
        var obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
})();

var imageViewerPrefix = '#image-viewer:';

function ImageViewer() {
    var imageList = _.pluck(imagesData, 'id');
    var closing = false;

    function preloadImage(url) {
        var img = new Image();
        img.src = url;
    }

    function updateImageGeometry(img) {
        var containerWidth = $('#image-viewer-img-container').width();
        var containerHeight = $('#image-viewer-img-container').height();

        var imageWidth = parseInt($(img).attr('data-width'));
        var imageHeight = parseInt($(img).attr('data-height'));

        if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
            throw new Error('Failed assertion: Bad sizes.');
        }

        var res = {};
        if (containerWidth > imageWidth && containerHeight > imageHeight) {
            // Container is bigger than the image.
            // Center the image.
            res = {
                width: imageWidth,
                height: imageHeight,
                left: Math.round((containerWidth - imageWidth) / 2),
                top: Math.round((containerHeight - imageHeight) / 2)
            }
        } else {
            // Image does not fit. Scale it down.

            var ratioImage = imageWidth / imageHeight;
            var ratioContainer = containerWidth / containerHeight;
            if (ratioImage > ratioContainer) {
                // The image is proportionally wider than the container.
                // Fit to width.
                res = {
                    width: containerWidth,
                    height: containerWidth / ratioImage,
                    left: 0
                }
                res.top = Math.round((containerHeight - res.height) / 2);
            } else {
                // The image is proportionally taller than the container.
                // Fit to height.
                res = {
                    height: containerHeight,
                    width: containerHeight * ratioImage,
                    top: 0
                }
                res.left = Math.round((containerWidth - res.width) / 2);
            }
        }

        $(img).css({
            width: res.width + 'px',
            height: res.height + 'px',
            left: res.left + 'px',
            top: res.top + 'px'
        });
    }

    function showImage(imageId) {
        var image = _.find(imagesData, {'id': imageId});
        var imageIndex = imageList.indexOf(imageId);
        var nextImageIndex = (imageIndex < imageList.length - 1 ? imageIndex + 1 : null);
        var prevImageIndex = (imageIndex > 0 ? imageIndex - 1 : null);

        $('#image-viewer-img-container').contents().fadeOut(function() {
            $(this).remove()
        });
        var img = $('<img/>', {
            src: image.imageUrl,
            "data-width": image.originalSize.width,
            "data-height": image.originalSize.height
        })
            .on('click', function(ev) {
                ev.stopPropagation();
            })
            .fadeIn();
        $('#image-viewer-img-container').append(img);
        updateImageGeometry(img);

        function updateButton(domObject, targetIndex) {
            var href = (targetIndex !== null ?
                imageViewerPrefix + imageList[targetIndex] : null);

            $(domObject)
                .attr('href', href)
                .toggleClass('disabled', targetIndex == null);

            if (targetIndex !== null) {
                preloadImage(imagesData[targetIndex].imageUrl);
            }
        }

        updateButton('#image-viewer-prev', prevImageIndex);
        updateButton('#image-viewer-next', nextImageIndex);

        $('#image-viewer-project-name').text(image.project);
        $('#image-viewer-description').html(image.description);
    }

    function clickReplaceHistory(event) {
        event.preventDefault();
        var href = $(this).attr('href');
        if (href !== undefined) {
            window.history.replaceState(null, null, href);
            hashRouter(null);
        }
    }

    $('#image-viewer-prev').on('click', clickReplaceHistory);
    $('#image-viewer-next').on('click', clickReplaceHistory);

    window.addEventListener('optimizedResize', function() {
        $('#image-viewer-img-container > img').each(function(i, img) {
            updateImageGeometry(img);
        });
    });

    function close() {
        if (!closing) {
            // avoid closing twice on double click
            closing = true;
            window.history.back();
        }
    }

    function handleKeyDown(ev) {
        var actions = {
            37: function () {
                // left
                $('#image-viewer-prev').click();
            },
            39: function () {
                // right
                $('#image-viewer-next').click();
            },
            27: function () {
                // esc
                close()
            }
        };
        if (actions[ev.keyCode] !== undefined) {
            actions[ev.keyCode]()
        }
    }

    var currentlyVisible = false;
    function updateVisible(visible) {
        if (visible && !currentlyVisible) {
            currentlyVisible = true;

            // Show the viewer
            $('#image-viewer')
                .fadeIn();
            $(document).on('keydown', handleKeyDown);
        } else if (!visible && currentlyVisible) {
            currentlyVisible = false;
            // Hide the viewer
            $('#image-viewer').fadeOut(function() {
                closing = false;
            });
            $(document).off('keydown', handleKeyDown);
        }
    }
    
    // Close when touching the dark area
    $('#image-viewer-img-container').on('click', function(ev) {
        close();
    });

    // TODO: Disable document scroll while the viewer is active

    return {
        updateVisible: updateVisible,
        showImage: showImage
    }
}
var imageViewer = new ImageViewer();

function hashRouter(ev) {
    var inImageViewer = (location.hash.indexOf(imageViewerPrefix) == 0);
    if (inImageViewer) {
        var imageId = location.hash.replace(imageViewerPrefix, '');

        imageViewer.updateVisible(true);
        imageViewer.showImage(imageId);
    } else {
        imageViewer.updateVisible(false);
    }
}

$(window).on('hashchange', hashRouter);

$('.thumb').on('click', function (ev) {
    ev.preventDefault();

    var imageUrl = $(this).attr('href');
    var title = $(this).attr('title');
    var projectId = $(this).attr('data-project-id');
    var imageKey = $(this).attr('data-image-key');

    var newHash = '#image-viewer:' + projectId + '-' + imageKey;
    window.history.pushState(null, 'Image viewer', newHash);
    hashRouter(newHash)
});

// If the first view we arrive at is the image viewer, cheat.
// Push a state with the page outside of the viewer under the current state.
if (location.hash.indexOf(imageViewerPrefix) == 0) {
    var currentHash = location.hash;
    window.history.replaceState(null, null, '#');
    window.history.pushState(null, null, currentHash);
}

hashRouter(null);