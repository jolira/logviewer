log-viewer [<img src="https://secure.travis-ci.org/jolira/log-viewer.png" />](http://travis-ci.org/#!/jolira/log-viewer)
========================================================================================================================

The log-viewer tails log files and filters the output.

Getting Started
-----------------------------------------------------------------------------------------------------------------------

Node.js 0.6 or better needs to be installed on your system. If you do not have node installed yet, please go to
http://nodejs.org/, download the package for your operating system, and install it.


Run the server with example sites: `node server.js /path/to/log-viewer/examples`

To enable debugging add environment variable:
`NODE_DEBUG=log-viewer`

## Developing with the Site Manager



Testing
-----------------------------------------------------------------------------------------------------------------------

Install jake: `npm install -g jake`

Note that Jake is a system-level tool, and wants to be installed globally.

To execute tests execute: `jake test`

License
-----------------------------------------------------------------------------------------------------------------------

View the [LICENSE](https://raw.github.com/jolira/log-viewer/master/LICENSE.txt) file.

