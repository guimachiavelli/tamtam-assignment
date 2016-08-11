# Overview
> Build all of the pages and functionality shown in the design as a web app. This means that routing etc., must be handled on the client side.  There is an Instagram feed on the home page and this must display the most recent photos of the Tam Tam Instagram account (https://instagram.com/tamtamnl). The contact form must feature validation;  it must not be possible to send the form until all of the fields have been correctly filled in. The details do not actually have to be sent anywhere.

Considering it is a web app with only two views, I tried to prevent overengineering by including huge frameworks, opting instead for hand-coded solutions and libraries when the task would take too long.

Browsers tested: Firefox >=43, IE11, Safari >=8, Chrome >=50, Opera >=35, Mobile Safari 9.

# Setup
Install required dependencies with `make setup`.

# Development
Start server with `make server` and run `make develop` to watch for
changes in scss and js source folders.

To generate the responsive images, run `./tools/images.sh` from the
project root.

# Dependencies
* director (routing)
* jump.js (smooth scrolling)
* lory.js (slider)
* node-reset-scss (normalise styles throughout browsers)
* validatinator (form validation)
* postcss-cli (transform css)
* autoprefixer (postcss plugin to add browser prefixes)
* browserify (common.js modules on the browser)
* browserify-shim (use non-common.js modules with browserify)
* node-sass (node.js bindinds for libsass - the C version of sass)
* watch (monitors files/directories for changes)

# Deployment
Currently set up for github pages. Run `make deploy`.
