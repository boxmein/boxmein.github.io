var static = require('node-static');

//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('.', {
  'headers': {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }
});

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        if (request.url.match(/\/\./)) {
          response.writeHead(403);
          response.end('Unauthorized');
        }
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 3000);