// Action when SAVE button is clicked
function saveOptions(e) {
    e.preventDefault();
    var port = document.querySelector("#port").value;
    var split = document.querySelector("input[name='split']:checked").value;
    var comparison = document.querySelector("input[name='comparison']:checked").value;
    var reset_leave_game = document.querySelector("#leave-game").checked;
    var reset_missed_loc = document.querySelector("#missed-loc").checked;
    var extension_activation = document.querySelector("#extension-enabled").checked;
    browser.storage.sync.set({
        port: port,
        split: split,
        comparison: comparison,
        reset_leave_game: reset_leave_game,
        reset_missed_loc: reset_missed_loc,
        extension_activation: extension_activation
    }).then(saveSuccessful, onError);

    browser.runtime.sendMessage({ type: "settings_update" });
}

// Action when save went successfully
function saveSuccessful() {
    document.getElementById("save-success").style.display = "inline";
}

// Action to perform to reset options in storage
function resetOptions(_e) {
    browser.storage.sync.set({
        port: 16834,
        split: "round",
        comparison: "gametime",
        reset_leave_game: true,
        reset_missed_loc: false,
        extension_activation: false,
    }).then(restoreOptions, onError);
}

// Action to perform to reset Saving status
function resetSaveStatus() {
    document.getElementById("save-success").style.display = 'none';
}

// Action to perform when menu is clicked/displayed
function restoreOptions() {
    resetSaveStatus();
    let getting = browser.storage.sync.get();
    getting.then(setCurrentSettings, onError);
}

// Action to perform when visually setting values of form
function setCurrentSettings(result) {
    if (result.split == null || result.comparison == null) {
        // First activation
        resetOptions(null);
        return;
    }

    document.querySelector("#port").value = result.port || 16834;
    document.getElementById(result.split).checked = true;
    document.getElementById(result.comparison).checked = true;
    document.querySelector("#leave-game").checked = result.reset_leave_game;
    document.querySelector("#missed-loc").checked = result.reset_missed_loc;
    document.querySelector("#extension-enabled").checked = result.extension_activation;

    browser.runtime.sendMessage({ type: "settings_update" });
}

function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.querySelector("form").addEventListener("input", resetSaveStatus);


var extension_activation = document.querySelector("#extension-enabled");

extension_activation.addEventListener('change', function () {
    if (this.checked) {
        browser.storage.sync.set({ extension_activation: true })
    } else {
        browser.storage.sync.set({ extension_activation: false })

    }
    browser.runtime.sendMessage({ type: "settings_update" });
});