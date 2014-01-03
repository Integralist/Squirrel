# Squirrel

Node based cli tool using PhantomJS to automate generation of an Application Cache manifest file for a specified URL

## IMPORTANT!

I'm just waiting for this module to be published to https://npmjs.org/ as there
are currently authentication issues I'm waiting to be resolved. Check back soon
and hopefully it'll be online by then!

## Requirements

You'll need Node.js installed...

`brew install node`

If you're not using [Homebrew](http://brew.sh/) you can install Node using [Nave](https://github.com/isaacs/nave#nave)

## Installation

`npm install -g squirrel`

## Usage

`squirrel [url]`

## Example

`squirrel bbc.co.uk/news`

## Output

Creates a `appcache.manifest` file in the current directory you run the command.
