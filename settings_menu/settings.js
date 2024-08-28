function saveOptions(e) {
    e.preventDefault();
    var port = document.querySelector("#port").value;
    var split = document.querySelector("input[name='split']:checked").value
    browser.storage.sync.set({
        port: port,
        split: split
    }).then(saveSuccessful, onError);
}

function saveSuccessful() {
    document.getElementById("save-success").style.display = "inline";
}

function resetOptions(_e) {
    browser.storage.sync.set({
        port: 16834,
        split: "round"
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
}

function onError(error) {
    console.log(`Error: ${error}`);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("form").addEventListener("reset", resetOptions);
document.querySelector("form").addEventListener("input", resetSaveStatus);
