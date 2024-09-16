// Send message through websocket
function send_ws(operation) {
    browser.runtime.sendMessage({ type: "livesplit_command", command: operation });
}

function start() {
    send_ws("start");
    send_ws("set_comparison");
    send_ws("unpausegametime"); // For a second seed, game time might be paused
}

function is_last_round() {
    return document.querySelector("div[data-qa='round-number']").textContent.includes("5 / 5");
}

function guess() {
    send_ws("pausegametime");
    if (is_last_round()) {
        send_ws("split");
    } else {
        send_ws("split_intermediate");
    }
}

function next() {
    send_ws("unpausegametime");
}

function reset_leave_game() {
    send_ws("reset_leave_game");
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
        next();
    }
    if (e.target && e.target.textContent == "Leave game") {
        reset_leave_game();
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