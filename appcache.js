var _          = require('lodash'),
    system     = require('system'),
    fs         = require('fs'),
    page       = require('webpage').create(),
    args       = system.args,
    path       = './appcache.manifest',
    manifest   = fs.read(path),
    css        = [],
    jpgs       = [],
    pngs       = [],
    gifs       = [],
    images     = [],
    javascript = [],
    links, url;

function getLinks(){
    var results = page.evaluate(function(){
        return Array.prototype.slice.call(document.getElementsByTagName('a')).map(function (item) {
            return item.href.replace(/.+\/test-site(\/.+)$/i, function (match, cg) {
                return cg;
            });
        });
    });

    return results;
}

function writeVersion(){
    manifest = manifest.replace(/# Timestamp: \d+/i, '# Timestamp: ' + (new Date()).getTime());
}

function writeListContentFor (str, type) {
    manifest = manifest.replace(new RegExp('(# ' + str + ')\\n[\\s\\S]+?\\n\\n', 'igm'), function (match, cg) {
        return cg + '\n' + type.join('\n') + '\n\n';
    });
}

function writeManifest(){
    fs.write(path, manifest, 'w');
}

function populateManifest(){
    writeVersion();

    writeListContentFor('Images', images);
    writeListContentFor('Internal HTML documents', links);
    writeListContentFor('Style Sheets', css);
    writeListContentFor('JavaScript', javascript);

    writeManifest();
}

function urlProvided(){
    return args.length > 1 && /(?:www\.)?[a-z-z1-9]+\./i.test(args[1]);
}

function cleanUrl (providedUrl) {
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

page.onResourceRequested = function (request) {
    // console.log('Request ' + JSON.stringify(request, undefined, 4));
};

page.onResourceReceived = function (request) {
    // Some requests can have `contentType = null` which causes errors if we don't check for truthy value
    if (request.contentType) {
        if (request.contentType.indexOf('text/css') !== -1) {
            css.push(request.url);
        }
        
        // application/javascript & application/x-javascript
        if (request.contentType.indexOf('javascript') !== -1) {
            javascript.push(request.url);
        }

        if (request.contentType.indexOf('image/png') !== -1) {
            if (request.url.indexOf('data:image') === -1) {
                pngs.push(request.url);
            }
        }

        if (request.contentType.indexOf('image/jpeg') !== -1) {
            if (request.url.indexOf('data:image') === -1) {
                jpgs.push(request.url);
            }
        }

        if (request.contentType.indexOf('image/gif') !== -1) {
            if (request.url.indexOf('data:image') === -1) {
                gifs.push(request.url);
            }
        }
    }
};

page.onError = function (msg, trace) {
    console.log(msg);

    trace.forEach(function (item) {
        console.log('  ', item.file, ':', item.line);
    });
}

if (urlProvided()) {
    url = cleanUrl(args[1]);
} else {
    console.log('Sorry a valid URL should have been provided');
    console.log('Example usage: phantomjs appcache.js bbc.co.uk/news');
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

page.open(url, function (status) {
    console.log('');

    links = getLinks();
    
    links      = _.unique(links);
    images     = _.unique(pngs.concat(jpgs).concat(gifs));
    css        = _.unique(css);
    javascript = _.unique(javascript);

    console.log('links: ', links.length);
    console.log('images: ', images.length);
    console.log('css: ', css.length);
    console.log('javascript: ', javascript.length);

    populateManifest();

    // console.log('\n\n\n');

    phantom.exit();
});