var settings;
var options = {};
update_settings();
var ws;

// Update settings from browser storage
function update_settings() {
    settings = browser.storage.sync.get().then(onReceivedSettings, onErrorReceivingSettings);
}

// Listener of content script messages
browser.runtime.onMessage.addListener(message_listener);

function message_listener(message) {
    switch (message.type) {
        case "settings_update":
            update_settings();
            break;
        case "livesplit_command":
            handle_livesplit_operation(message.command);
            break;
        default:
            console.debug("Unknown runtime message type");
            break;
    }
}

// Livesplit command handler
function handle_livesplit_operation(command) {
    switch (command) {
        case "reset_leave_game":
            if (options.reset_leave_game) {
                send_ws("reset");
            }
            break;
        case "set_comparison":
            if (options.compare_igt) {
                send_ws("switchto gametime");
            } else {
                send_ws("switchto realtime");
            }
            break;
        case "perfect_score_intermediate":
            if (!options.split_seed) {
                send_ws("split");
            }
            break;
        case "perfect_score_final":
            send_ws("split");
            break;
        case "missed_loc_intermediate":
            if (options.reset_missed_loc) {
                send_ws("reset");
            } else if (!options.split_seed) {
                send_ws("split");
            }
            break;
        case "missed_loc_final":
            if (options.reset_missed_loc) {
                send_ws("reset");
            } else {
                send_ws("split");
            }
            break;
        default:
            send_ws(command);
            break;
    }
}

// Set current options
function onReceivedSettings(item) {
    let port = 16834;
    if (item.port && parseInt(item.port)) {
        port = parseInt(item.port);
    } else {
        console.debug("'port' setting is invalid, please provide a valid number");
    }
    options.port = port;
    options.split_seed = (item.split == "seed");
    options.compare_igt = (item.comparison == "gametime");
    options.reset_leave_game = item.reset_leave_game;
    options.reset_missed_loc = item.reset_missed_loc;
    options.extension_activation = item.extension_activation;

    // Re-initialize websocket and icon if necessary
    init_ws();
    set_icon();
}

function onErrorReceivingSettings(error) {
    console.error(`Error while retrieving settings: ${error}`);
}

// Initialize websocket if not already existent
function init_ws() {
    // If extension is disabled, remove existing WS
    if (!options.extension_activation) {
        ws = null
        console.debug("Geoguessr Autosplitter is disabled");
        return;
    }

    // Else, if WS does not already exist or is in a wrong state, open it
    if (ws == null || ws.readyState != WebSocket.OPEN) {
        console.debug("Geoguessr Autosplitter - (Re)Initializing WS");
        ws = new WebSocket(`ws://localhost:${options.port}/livesplit`);
        ws.onopen = function (_e) {
            set_icon();
        }
        ws.onclose = function (_e) {
            set_icon();
        }
        ws.onerror = function (_e) {
            set_icon();
        }
        ws.onmessage = function (_e) {
            set_icon();
        }
    }
}

// Send message through websocket
function send_ws(operation) {
    if (ws && ws.readyState == WebSocket.OPEN) {
        console.debug(`Sending '${operation}'`);
        ws.send(operation);
    } else {
        console.error(`Could not send '${operation}' message, web socket is not ready`)
    }
}


// Global background variables of the script
var activated_extension = false;

// Set icon depending on activation of extension and WebSocket status
function set_icon() {
    // Set default icon
    if (ws == null || !activated_extension) {
        browser.action.setIcon({ path: "icons/logo-48.png" });
        return;
    }

    // If extension is activated
    if (ws && ws.readyState == WebSocket.OPEN) {
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
        init_ws();
    } else {
        activated_extension = false;
    }
    set_icon();
}