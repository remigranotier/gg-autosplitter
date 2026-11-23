const gameMapSelector = "[class^=_canvas_]";
let guessed = false;

// Execute this function when score field is detected
function handleScoreAppearance(score) {
    // Without a timeout we get 0 cause score is not set yet
    setTimeout(() => {
        let close_round_btn = document.querySelector("button[data-qa='close-round-result']").textContent;
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

function findScore() {
    let statEntries = document.querySelectorAll("[class^=_stat_]")
    if (!statEntries) {
        return undefined
    }
    for (let entry of statEntries) {
        if (entry.children[0].textContent == 'Score') {
            return entry.children[1].textContent
        }
    }
    return undefined
}

// Observer config
const observer = new MutationObserver((mutationsList, observer) => {
    const score = findScore();
    console.debug("Watching for score appearance");
    if (score !== undefined) {
        console.debug("score detected");
        handleScoreAppearance(score);
        observer.disconnect();
    }
});

// Send message through websocket
function send_ws(operation) {
    console.debug("Sending command to BG : " + operation)
    chrome.runtime.sendMessage({ type: "livesplit_command", command: operation });
}

function start() {
    setTimeout(() => { guessed = false }, 500)
    send_ws("start");
    send_ws("set_comparison");
    send_ws("unpausegametime"); // For a second seed, game time might be paused
}

function guess() {
    // observe score field when guessing
    observer.observe(document.querySelector(gameMapSelector), { subtree: true, attributes: true, childList: true });
    guessed = true
    send_ws("pausegametime");
}

function next() {
    setTimeout(() => { guessed = false }, 500)
    send_ws("unpausegametime");
}

function reset_leave_game() {
    setTimeout(() => { guessed = false }, 500)
    send_ws("reset_leave_game");
}


function is_start_button(target) {
    // Start button of Solo mode
    let possibleQuerySelectors = ["[class^=_playButtons_]"]
    let playButtons = null
    for (let querySelector of possibleQuerySelectors) {
        let result = document.querySelector(querySelector);
        if (result != null) {
            playButtons = result
            break
        }
    }

    if (playButtons != null && target.textContent == "Play" && playButtons.contains(target) && !localStorage.getItem("quickplay-playtype")) {
        return true;
    }

    // Start button of Challenge mode
    if (start_list.has(target.dataset.qa) && target.textContent != "Create challenge") {
        return true;
    }
}

let start_list = new Set(['join-challenge-button', 'start-challenge-button', 'start-game-button', 'play-again-button']);
let guess_list = new Set(['perform-guess']);
let next_list = new Set(['close-round-result']);

// Event button listener
document.addEventListener('click', function (e) {
    if (e.target && is_start_button(e.target)) {
        start();
    }
    if (e.target && guess_list.has(e.target.dataset.qa)) {
        guess();
    }
    if (e.target && next_list.has(e.target.dataset.qa) && e.target.textContent == "Next") {
        next();
    }
    if (e.target?.textContent == "Leave game") {
        reset_leave_game();
    }
});

// Keys listener
document.body.onkeyup = function (e) {
    if (e.key == " " ||
        e.code == "Space" ||
        e.keyCode == 32
    ) {
        checkSpaceStart()
    }

    let primaryActionKeybind = ["Space"]
    try {
        const keybindings = Object.entries(localStorage).find(entry => entry[0].startsWith(`__GEOGUESSR_KEY_BINDINGS__${playerId}`))
        primaryActionKeybind = JSON.parse(keybindings[1])["bindings"]["primaryAction"]
    } catch {
        console.warn("Could not find keybinds, will default to spacebar")
    }

    if (primaryActionKeybind.includes(e.code) || (e.shiftKey && primaryActionKeybind.includes(`Shift+${e.code}`)) || (e.ctrlKey && primaryActionKeybind.includes(`Ctrl+${e.code}`))) {
        checkKeyboardGuess()
    }
}


function checkKeyboardGuess() {
    let guess_button = document.querySelector("button[data-qa='perform-guess']");
    if (!guess_button) {
        console.debug("Primary action button pressed with no guess button, ignoring");
        return;
    }
    if (!guess_button.disabled) {
        guess();
    }
}

function checkSpaceStart() {
    for (let playButton of document.querySelectorAll("[class^=_playButtons_]")) {
        if (playButton.textContent === "Play" && !localStorage.getItem("quickplay-playtype")) {
            console.debug("Starting with space in solo")
            start();
            return;
        }
    }
}

function checkTimerEnd() {
    let timer = document.querySelector("[class^=_time_]")
    if (timer?.textContent === "00:00" && !guessed) {
        console.debug("end of timer detected")
        guess()
    }
}

setInterval(checkTimerEnd, 100)

// Keep extension alive
function keepAlive() {
    chrome.runtime.sendMessage({ type: "keep_alive" });
}
setInterval(keepAlive, 20000);