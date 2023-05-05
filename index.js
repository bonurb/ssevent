var cp = require("child_process"),
         express = require("express"),
         app = express();
var path = require('path');

app.use('/', express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

let sseResult;
let spw;
let str;

app.get('/', function(req, res){
    console.log('/ ...');
    res.render('index');
});

app.get('/msg', function(req, res){
    console.log('/msg ...');
    sseResult = res;
    sseResult.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-control": "no-cache" });

});

app.get('/spawn', function(req, res){
    console.log('/spawn ...')
    spw = cp.spawn('ping', ['-n', '3', '127.0.0.1']),
    str = "";

    spw.stdout.on('data', function (data) {
        str += data.toString();

        // just so we can see the server is doing something
        console.log("data");

        // Flush out line by line.
        var lines = str.split("\n");
        for(var i in lines) {
            if(i == lines.length - 1) {
                str = lines[i];
            } else{
                // Note: The double-newline is *required*
                sseResult.write('data: ' + lines[i] + "\n\n");
            }
        }
    });

    spw.on('close', function (code) {
        sseResult.write('spawn closed\n\n');
        // sseResult.end('spawn closed');
    });

    spw.stderr.on('data', function (data) {
        sseResult.end('stderr: ' + data);
    });
    // res.end();
});

app.listen(3001);