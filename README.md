# Geoguessr Autosplitter

Geoguessr Autosplitter is a browser extension which connects to a local LiveSplit Server using WebSockets to perform automatic actions (starting run, splitting, pausing game time, etc.) 

### Warning

Current LiveSplit release does not embed a WebSockets server yet, you may download the dev build [here](https://raw.githubusercontent.com/LiveSplit/LiveSplit.github.io/artifacts/LiveSplitDevBuild.zip)

## How to use it

### Store links

- [https://addons.mozilla.org/fr/firefox/addon/gg-autosplitter/](Firefox)
- [https://chromewebstore.google.com/detail/geoguessr-autosplitter/pbdmmcffhcaejcjglkoibnhimgpkmhkc](Chrome)

### Once installed

**Note:** The extension is only enabled on geoguessr tabs. On any other tab it will be displayed with its default logo, with no background status.

Once the extension is installed :
- Right Click on LiveSplit > Control > Start WebSocket server (by default, will start on ws://localhost:16834/livesplit) 
- Refresh your geoguessr page

If the connection succeded, the taskbar icon should have a green background. This means that you're connected to your livesplit instance, woohoo!
Note: you may pin the taskbar icon to your taskbar for easier tracking of your connection status.

Now, if you start a game or challenge, the timer should automatically start.

An options tab exists if you click on the extension taskbar icon, allowing to set your livesplit port and split options.

You can switch comparison to Game Time if you want, to ignore times between rounds and games.

### Troubleshooting

If your timer does not start when starting a game, ensure the extension icon hasn't a red background. A red background means the connection to the WebSocket server is closed. You may then try to refresh your tab. If this does not still work, you may check your developer console for more information.

## Supported browsers

- Firefox (tested)
- Chrome (tested)
- Edge, Opera, Chromium (tested rapidly, should be identical to chrome)

## Reporting issues

If you have any problem or feature request, feel free to submit issues on GitHub! Mark them with the associated tags.

To report problems, please provide the version name and your console log if probably useful, or anything worth for debugging.

Thank you!

## Generating a release

Generate a release using web-ext :

```
web-ext build
```

## Contributing

For contributions feel free to fork the repository and submit pull requests. Any help will be appreciated if you wish to implement something or fix edge cases!