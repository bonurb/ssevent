var cp = require("child_process"),
         express = require("express"),
         app = express();

app.use('/', express.static(__dirname));

let sseResult;
let spw;
let str;

app.get('/msg', function(req, res){
    console.log('/msg ...')
    sseResult = res;
    sseResult.writeHead(200, { "Content-Type": "text/event-stream",
                         "Cache-control": "no-cache" });

});

app.get('/kill', function(req, res){
    console.log('/kill ...');
    spw.kill('SIGINT');
});

app.get('/ping', function(req, res){
    console.log('/ping ...');
    // spw.stdin.write('stdbuf -i0 -o0 -e0 ll \n');
    spw.stdin.write('ping localhost \n');
    // res.end();
});

app.get('/ll', function(req, res){
    console.log('/ll ...');
    spw.stdin.write('stdbuf -i0 -o0 -e0 ls -al \n');
    // res.end();
});

app.get('/spawn', function(req, res){
    console.log('/spawn ...');
    // spw = cp.spawn('ping', ['-n', '100', '127.0.0.1']);
    spw = cp.spawn("c:/brtmp/prog/PortableGit/bin/bash.exe");
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
        console.log('spw closed ...');
        sseResult.write('spawn closed\n\n');
        sseResult.end('spawn closed');
    });
    
    spw.stderr.on('data', function (data) {
        sseResult.end('stderr: ' + data);
    });
    // res.end();
});

app.listen(3001);