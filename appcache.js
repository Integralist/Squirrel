var _          = require('lodash'),
    system     = require('system'),
    fs         = require('fs'),
    page       = require('webpage').create(),
    args       = system.args,
    path       = './appcache.manifest',
    manifest   = fs.read(path),
    css        = [],
    images     = [],
    javascript = [],
    links, url;

function getLinks(){
    var results = page.evaluate(function(){
        return Array.prototype.slice.call(document.getElementsByTagName('a')).map(function (item) {
            return item.href;
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

page.onError = function (msg, trace) {
    console.log('Error :', msg);

    trace.forEach(function (item) {
        console.log('Trace:  ', item.file, ':', item.line);
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
    images     = _.unique(images);
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