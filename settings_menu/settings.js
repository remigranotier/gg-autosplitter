function saveOptions(e) {
    e.preventDefault();
    var port = document.querySelector("#port").value;
    var split = document.querySelector("input[name='split']:checked").value;
    var reset_leave_game = document.querySelector("#leave-game").checked;
    // var reset_missed_loc = document.querySelector("#missed-loc").checked;
    browser.storage.sync.set({
        port: port,
        split: split,
        reset_leave_game: reset_leave_game,
        // reset_missed_loc: reset_missed_loc
    }).then(saveSuccessful, onError);

    browser.runtime.sendMessage({ type: "settings_update" });
}

function saveSuccessful() {
    document.getElementById("save-success").style.display = "inline";
}

function resetOptions(_e) {
    browser.storage.sync.set({
        port: 16834,
        split: "round",
        reset_leave_game: true,
        // reset_missed_loc: false
    }).then(restoreOptions, onError);
}

function resetSaveStatus() {
    document.getElementById("save-success").style.display = 'none';
}


function restoreOptions() {
    resetSaveStatus();
    let getting = browser.storage.sync.get();
    getting.then(setCurrentSettings, onError);
}

function setCurrentSettings(result) {
    document.querySelector("#port").value = result.port || 16834;
    document.getElementById(result.split).checked = true;
    document.querySelector("#leave-game").checked = result.reset_leave_game;
    // document.querySelector("#missed-loc").checked = result.reset_missed_loc;
}

function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.querySelector("form").addEventListener("input", resetSaveStatus);
