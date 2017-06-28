var ws = require("ws");

var MAXSTRIKES = 10;
var HOST_LOCAL = "localhost";
var HOST_REMOTE = "localhost";
var PORT_LOCAL = 8546;
var PORT_REMOTE = 8547;
var subscribeid = ""; // hexstr
var strikes = 0;

// arbitrary data (result of pss.MakeTopic("foo", 42); in the go-code
var faketopic = '[1,0,0,0,58,88,201,154,149,79,71,70,26,106,123,63,96,171,158,29,104,174,127,105,164,157,181,236,179,1,66,63]';

// the addresses are the swarm overlay addresses of the pss nodes we are connecting to
var localaddr = ""; // base64
var remoteaddr = ""; // base64

// "local" and "remote" are just names, they're both as local and remote as the other :)
var connlocal = new ws("ws://" + HOST_LOCAL + ":" + PORT_LOCAL, {"origin": "http://localhost"});
var connremote = new ws("ws://" + HOST_REMOTE + ":" + PORT_REMOTE, {"origin": "http://localhost"});

// local only does step 0 of the script
connlocal.on("open",  function() {
	console.log("local ws open");
	script(0);
});

// remote does the rest 
connremote.on("open", function() {
	console.log("remote ws open");
	script(1);
});

// local receives messages
connlocal.on("message", function(m) {
	msg = JSON.parse(m);
	switch(msg.id) {
		// result for address request
		case 1:	
			localaddr = msg.result;
			addr = new Buffer(msg.result, "base64").toString("hex");
			console.log("local addr is: " + addr);
			break;
		// result for send attempt
		case 3:
			console.log("local sent message error status: " + msg.result);
			break;
	}
});

// remote receives messages
connremote.on("message", function(m) {
	msg = JSON.parse(m);
	switch (msg.id) {
	// result for address request
	case 1:
		remoteaddr = msg.result;
		addr = new Buffer(msg.result, "base64").toString("hex");
		console.log("remote addr is: " + addr);
		script(2);
		break;
	// result for subscription
	case 2:
		console.log("subscribe id: " + msg.result);
		subscribeid = msg.result;
		script(3);
		break;
	// if we get the message sent from local it will end up here!
	default:
		if (msg.params.subscription == subscribeid) {
			content = new Buffer(msg.params.result.Msg, "base64").toString("utf8");
			from = new Buffer(msg.params.result.Addr, "base64").toString("hex");
			to = new Buffer(remoteaddr, "base64").toString("hex");
			
			console.log("recv msg: '" + content.toString() + "' FROM " + from + " TO " + to);
			shutdown();
		}
	}
});

connremote.on("error",  connerror);
connlocal.on("error",  connerror);

function connerror(e) {
		console.log("error: " + e);
}

function shutdown() {
	connlocal.close();
	connremote.close();
	process.exit();
}

// triggers
function script(step) {
	switch (step) {
	case 0:
		// get the local's address
		connlocal.send('{"jsonrpc":"2.0","id":1,"method":"pss_baseAddr","params":null}');
		break;
	case 1:
		// get the remote's address
		connremote.send('{"jsonrpc":"2.0","id":1,"method":"pss_baseAddr","params":null}');
		break;
	case 2:
		// subscribe to incoming messages on the remote
		connremote.send('{"jsonrpc":"2.0","id":2,"method":"pss_subscribe","params":["receive",' + faketopic + ']}');
		break;
	case 3:
		// wait for asyncs to complete so we have enough data to send
		// we don't really need the localaddr here,
		// but it's nice for the success messsage afterwards
		if (strikes > MAXSTRIKES) {
			console.err("requred data missing, won't send");
		}
		if (subscribeid == "" || localaddr == "" | remoteaddr == "") {
			console.err("still waiting for data before send");
			strikes++;
			setTimeout(script(3), 250);
			break;
		}
		// send message from local to remote
		data = new Buffer("foo", "utf8").toString("base64");
		sendstr = '{"jsonrpc":"2.0","id":3,"method":"pss_send","params":[' + faketopic + ',{"Msg":"'+ data + '","Addr":"'+ remoteaddr + '"}]}'
		console.log("\nattempting send: " + sendstr);
		connlocal.send(sendstr);
		break;
	}
}
