function split() {
    console.log("split")
}

function start() {
    console.log("starttimer");
}

document.addEventListener('click', function (e) {
    if (e.target && e.target.dataset.qa == 'join-challenge-button') {
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