# Squirrel

PhantomJS script to automate Application Cache manifest file generation

## Installation

`brew install phantomjs`
'brew install node'

If you're not using [Homebrew](http://brew.sh/) you can install Node using [Nave](https://github.com/isaacs/nave#nave) and PhantomJS using [NPM](https://npmjs.org/package/phantomjs)

## Usage

`phantomjs appcache.js [url]`

## Example

`phantomjs appcache.js bbc.co.uk/news`

## Output

I include a generic `appcache.manifest` which has no content but is needed for the PhantomJS script to parse

## TODO

I've noticed with some sites that the HTTP requests change? It could be an error in my code (I'll raise a support ticket with PhantomJS to see if I can't get it figured out)