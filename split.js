// Selector of score field
const scoreFieldSelector = "[class^=round-result_pointsIndicatorWrapper]";

const gameMapSelector = "[class^=game_canvas]";

// Execute this function when score field is detected
function handleScoreAppearance(score_field) {
    // Without a timeout we get 0 cause score is not set yet
    setTimeout(() => {
        score = score_field.children[0].textContent;
        close_round_btn = document.querySelector("button[data-qa='close-round-result']").textContent;
        if (score == "5,000") {
            if (close_round_btn == "Next") {
                send_ws("perfect_score_intermediate");
            } else {
                send_ws("perfect_score_final");
            }
        } else {
            if (close_round_btn == "Next") {
                send_ws("missed_loc_intermediate");
            } else {
                send_ws("missed_loc_final");
            }
        }
    }, 1);
}

// Observer config
const observer = new MutationObserver((mutationsList, observer) => {
    const score_field = document.querySelector(scoreFieldSelector);
    console.debug("Watching for score appearance");
    if (score_field) {
        console.debug("score field detected");
        handleScoreAppearance(score_field);
        observer.disconnect();
    }
});

// Send message through websocket
function send_ws(operation) {
    console.debug("Sending command to BG : " + operation)
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
    // observe score field when guessing
    observer.observe(document.querySelector(gameMapSelector), { subtree: true, attributes: true });
    send_ws("pausegametime");
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

// Keep extension alive
function keepAlive() {
    browser.runtime.sendMessage({ type: "keep_alive" });
}
setInterval(keepAlive, 20000);