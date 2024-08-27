let ws = new WebSocket("ws://localhost:16834/livesplit");

function split() {
    ws.send("split");
}

function start() {
    ws.send("starttimer");
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