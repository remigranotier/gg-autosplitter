// Load settings
const settings = browser.storage.sync.get()
settings.then(onReceivedSettings, onErrorReceivingSettings);
var options = {};
var ws;

function onErrorReceivingSettings(error) {
    console.log(`Error while retrieving settings: ${error}`);
}

function onReceivedSettings(item) {
    let port = "16834";
    if (item.port) {
        port = item.port;
    }
    options.port = port

    // Initialize websocket
    ws = new WebSocket("ws://localhost:" + options.port + "/livesplit");
    ws.onopen = function (e) {
        browser.runtime.sendMessage({ status: ws.readyState })
    }
    ws.onclose = function (e) {
        browser.runtime.sendMessage({ status: ws.readyState })
    }
    ws.onerror = function (e) {
        browser.runtime.sendMessage({ status: ws.readyState })
    }
    ws.onmessage = function (e) {
        browser.runtime.sendMessage({ status: ws.readyState })
    }
}


function split() {
    if (ws.readyState == WebSocket.OPEN) {
        ws.send("split");
    } else {
        console.error("Could not send 'split' message, web socket is not ready")
    }
}

function start() {
    if (ws.readyState == WebSocket.OPEN) {
        ws.send("starttimer");
    } else {
        console.error("Could not send 'starttimer' message, web socket is not ready")
    }
}

document.addEventListener('click', function (e) {
    if (e.target && e.target.dataset.qa == 'join-challenge-button' || e.target.dataset.qa == 'start-challenge-button') {
        start()
    }
    if (e.target && e.target.dataset.qa == 'perform-guess') {
        split()
    }
});

document.body.onkeyup = function (e) {
    if (e.key == " " ||
        e.code == "Space" ||
        e.keyCode == 32
    ) {
        let guess_button = document.querySelector("button[data-qa='perform-guess']");
        if (!guess_button.disabled) {
            split();
        }
    }
}