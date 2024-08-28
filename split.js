// Load settings
const settings = browser.storage.sync.get()
settings.then(onReceivedSettings, onErrorReceivingSettings);
var options = {};
var ws;

function onErrorReceivingSettings(error) {
    console.log(`Error while retrieving settings: ${error}`);
}

// Set current options
function onReceivedSettings(item) {
    let port = 16834;
    if (item.port) {
        port = item.port;
    }
    options.port = port;

    initialize_ws();
}

// Initialize websocket
function init_ws() {
    if (!Number.isInteger(options.port)) {
        console.error("'port' setting is invalid, please provide a valid number");
    }

    ws = new WebSocket(`ws://localhost:${options.port}/livesplit`);
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

// Send message through websocket
function send_ws(operation) {
    if (ws.readyState == WebSocket.OPEN) {
        console.debug(`Sending'${operation}'`);
        ws.send(operation);
    } else {
        console.error(`Could not send '${operation}' message, web socket is not ready`)
    }
}

function start() {
    send_ws("start");
    send_ws("unpausegametime"); // For a second seed, game time might be paused
}

function guess() {
    send_ws("pausegametime");
    send_ws("split");
}

function next() {
    send_ws("unpausegametime");
}

let start_list = ['join-challenge-button', 'start-challenge-button', 'start-game-button', 'play-again-button'];
let guess_list = ['perform-guess'];
let next_list = ['close-round-result'];

// Event button listener
document.addEventListener('click', function (e) {
    if (e.target && start_list.includes(e.target.dataset.qa)) {
        start();
    }
    if (e.target && guess_list.includes(e.target.dataset.qa)) {
        guess();
    }
    if (e.target && next_list.includes(e.target.dataset.qa) && e.target.textContent == "Next") {
        next()
    }
});

// Space bar listener
document.body.onkeyup = function (e) {
    if (e.key == " " ||
        e.code == "Space" ||
        e.keyCode == 32
    ) {
        let guess_button = document.querySelector("button[data-qa='perform-guess']");
        if (!guess_button) {
            console.debug("Spacebar pressed with no guess button, ignoring");
            return;
        }
        if (!guess_button.disabled) {
            guess();
        }
    }
}