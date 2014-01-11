#! /usr/bin/env node

var userArguments = process.argv.slice(2); // copies arguments list but removes first two options (script exec type & exec location)

if (userArguments.length > 1) {
    throw new Error('Only one argument should be specified (the url you want to generate the appcache for)');
}

var fs               = require('fs');
var shell            = require('child_process').execFile;
var phantomjs        = require('phantomjs').path;
var scriptToExecute  = __dirname + '/appcache.js';
var manifest         = __dirname + '/../appcache.manifest';
var url              = userArguments[0];
var manifestContent;
var data;

fs.readFile(manifest, bootstrap);

function bootstrap(err, contentAsBuffer) {
    if (err) throw err;

    manifestContent = contentAsBuffer.toString('utf8');

    shell(phantomjs, [scriptToExecute, url, manifestContent], function(err, stdout, stderr) {
        if (err) throw err;

        // Sometimes an error in the loaded page's JavaScript doesn't get picked up or thrown?
        // But the error comes in via stdout and causes JSON parsing to break
        try {
            data = JSON.parse(stdout);
        } catch(err) {
            log('Whoops! Seems there was an error? You\'ll find the stack trace below.');
            error(err);
        }

        displayStatistics();
        createManifestFile();
    });
}

function displayStatistics() {
    log(''); // adds extra line of spacing when displaying the results
    log('Links: '      + data.links);
    log('Images: '     + data.images);
    log('CSS: '        + data.css);
    log('JavaScript: ' + data.javascript);
}

function createManifestFile() {
    fs.writeFile(process.cwd() + '/appcache.manifest', data.manifestContent, function(err) {
        if (err) throw err;

        log('\nManifest file created');
    });
}

function log(message) {
    process.stdout.write(message + '\n');
}

function error(err) {
    process.stderr.write(err);
}
