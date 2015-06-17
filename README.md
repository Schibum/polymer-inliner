# Polymer-inliners
> Try to inline Polymer modules to avoid html includes (which currently cannot
> be used in the execution context of Chrome extension content scripts).

Extacts scripts and converts other content to calls like this:

    Polymer.addImportContent('<dom-module...');

## Usage

Command line usage:

    cat index.html | polymer-inliner -h residual.html -j build.js
    polymer-inliner --source index.html --html residual.html --js build.js

Library usage:

    var output = polymer-inliner(htmlString, jsOutputFileName);
    fs.writeFile(htmlOutputFileName, output.html, 'utf-8', ...);
    fs.writeFile(jsOutputFileName, output.js, 'utf-8', ...);

## Usage with Vulcanize

When using [vulcanize](https://github.com/Polymer/vulcanize), polymer-inliner can handle
the html string output directly and write the CSP seperated files on the command
line

    vulcanize index.html --inline-script | polymer-inliner --html residual.html --js
    build.js

Or programmatically

    vulcanize.process('index.html', function(err, html) {
      if (err) {
        return cb(err);
      } else {
        var out = polymer-inliner.split(html, jsFilename)
        cb(null, out.html, out.js);
      }
    });

## Build Tools

- [gulp-polymer-inliner](https://github.com/Schibum/gulp-polymer-inliner)
