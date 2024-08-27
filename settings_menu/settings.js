function saveOptions(e) {
    e.preventDefault();
    console.log("Saving port")
    browser.storage.sync.set({
        port: document.querySelector("#port").value,

    });
}

function restoreOptions() {
    function setCurrentSettings(result) {
        console.log(result)
        document.querySelector("#port").value = result.port || "16834";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get();
    getting.then(setCurrentSettings, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
