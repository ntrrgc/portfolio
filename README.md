#My portfolio

This is the software I wrote to generate [my portfolio](http://ntrrgc.rufian.eu/portfolio/).

Install all the dependencies with:

    npm install

For development mode with livereload run:

    node .

To generate a static `index.html` suitable for production just run:

    node build.js

Then, you can upload the contents of the `web` folder to any web server.

**Note:** Because of the way thumbnails are rendered `build.js` must be run also after images are added, removed or reordered.