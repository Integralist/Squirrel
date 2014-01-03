var unique     = require('lodash.uniq');
var system     = require('system');
var fs         = require('fs');
var page       = require('webpage').create();
var args       = system.args;
var manifest   = args[2];
var css        = [];
var images     = [];
var javascript = [];
var links;
var url;
var path;

setUp();

function setUp() {
    page.onResourceRequested = function(request) {
        if (/\.(?:png|jpeg|jpg|gif)$/i.test(request.url)) {
            images.push(request.url);
        }

        if (/\.(?:js)$/i.test(request.url)) {
            javascript.push(request.url);
        }

        if (/\.(?:css)$/i.test(request.url)) {
            css.push(request.url);
        }
    };

    page.onError = function(msg, trace) {
        console.log('Error :', msg);

        trace.forEach(function(item) {
            console.log('Trace:  ', item.file, ':', item.line);
        });
    }

    if (urlProvided()) {
        url  = cleanUrl(args[1]);
        openPage();
    } else {
        var error = new Error('Sorry a valid URL could not be recognised');
        error.additional = 'Valid URL Example: bbc.co.uk/news';

        throw error;

        phantom.exit();
    }

    if (bbcNews()) {
        // We want to serve up the responsive code base...
        phantom.addCookie({
            'name'  : 'ckps_d',
            'value' : 'm',
            'domain': '.bbc.co.uk'
        });
    }

    page.viewportSize = { width: 1920, height: 800 };
}

function openPage() {
    page.open(url, function(status) {
        links      = unique(getLinks());
        images     = unique(images);
        css        = unique(css);
        javascript = unique(javascript);

        populateManifest();

        // Anything written to `stdout` is actually passed back to our Node script callback
        console.log(JSON.stringify({
            links           : links.length,
            images          : images.length,
            css             : css.length,
            javascript      : javascript.length,
            manifestContent : manifest
        }));

        phantom.exit();
    });
}

function urlProvided() {
    return args.length > 1 && /(?:www\.)?[a-z-z1-9]+\./i.test(args[1]);
}

function cleanUrl(providedUrl) {
    // If no http or https found at the start of the url...
    if (/^(?!https?:\/\/)[\w\d]/i.test(providedUrl)) {
        return 'http://' + providedUrl + '/';
    }
}

function bbcNews(){
    if (/bbc.co.uk\/news/i.test(url)) {
        return true;
    }
}

function getLinks() {
    var results = page.evaluate(function() {
        return Array.prototype.slice.call(document.getElementsByTagName('a')).map(function(item) {
            return item.href;
        });
    });

    return results;
}

function writeVersion() {
    manifest = manifest.replace(/# Timestamp: \d+/i, '# Timestamp: ' + (new Date()).getTime());
}

function writeListContentFor(str, type) {
    manifest = manifest.replace(new RegExp('(# ' + str + ')\\n[\\s\\S]+?\\n\\n', 'igm'), function(match, cg) {
        return cg + '\n' + type.join('\n') + '\n\n';
    });
}

function populateManifest() {
    writeVersion();

    writeListContentFor('Images', images);
    writeListContentFor('Internal HTML documents', links);
    writeListContentFor('Style Sheets', css);
    writeListContentFor('JavaScript', javascript);
}
