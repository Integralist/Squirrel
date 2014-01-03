# Squirrel

Node based cli tool using PhantomJS to automate generation of an Application Cache manifest file for a specified URL

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
