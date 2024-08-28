// Global background variables of the script
var web_socket_status = WebSocket.CLOSED;
var activated_extension = false;

// Event triggered when WebSocket status changes
browser.runtime.onMessage.addListener(set_icon_handler);

// Function to update WebSocket status and set icon accordingly
function set_icon_handler(message) {
    web_socket_status = message.status;
    set_icon();
}

// Set icon depending on activation of extension and WebSocket status
function set_icon() {
    // Set default icon
    if (!activated_extension) {
        browser.action.setIcon({ path: "icons/logo-48.png" });
        return;
    }

    // If extension is activated
    if (web_socket_status == WebSocket.OPEN) {
        browser.action.setIcon({ path: "icons/connected-48.png" });
    } else {
        browser.action.setIcon({ path: "icons/disconnected-48.png" });
    }
}

const contentScriptMatchArray = ['https://www.geoguessr.com'];

browser.tabs.onActivated.addListener(handleExtensionActiveState);

browser.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
    handleExtensionActiveState(tab);
});

function handleExtensionActiveState(tabs) {
    if (tabs.tabId) {
        browser.tabs.get(tabs.tabId).then((tab) => {
            checkWhiteListedOrigin(tab);
        });
    } else {
        checkWhiteListedOrigin(tabs);
    }
}

function checkWhiteListedOrigin(tab) {
    const tabUrl = new URL(tab.url || "about:blank");
    if (contentScriptMatchArray.includes(tabUrl.origin)) {
        activated_extension = true;
    } else {
        activated_extension = false;
    }
    set_icon();
}