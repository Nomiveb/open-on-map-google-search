# Open on Map for Google Search

A small open-source browser extension that adds an **Open on map** button to Google Search when a place, address, business, city, or map card appears in the results.

Instead of looking around the Google Search page for the right Maps link, you get one clear button that opens the location in Google Maps.

## What It Does

When Google Search shows a location result, the extension adds a button like:

```text
Open on map
```

Clicking the button opens Google Maps in a new tab for that place.

It can work with several common Google Search layouts:

- right-side knowledge panels
- local business results
- address cards
- mini map cards
- city or place information blocks

## Why I Built It

Google Search often already knows the exact place you are looking at, but opening it in Maps is not always one click away.

This extension fixes that small daily annoyance.

It is intentionally simple: no account, no ads, no tracking, no dashboard, no extra product layer. Just a button that saves a click.

## Privacy

This extension does not collect personal data.

It does not send your searches, browsing history, clicks, or location data to the developer.

The extension runs locally in your browser. When you click **Open on map**, your browser opens Google Maps with the place name or coordinates that were already visible or available on the Google Search page.

Full policy: [PRIVACY_POLICY.md](PRIVACY_POLICY.md)

## Open Source

This project is open source so anyone can inspect what the extension does.

That matters because browser extensions run inside pages you visit. The code should be readable, boring, and easy to verify.

There is no minified bundle, no hidden backend, and no remote code loading.

## Install Manually

### Chrome

1. Download or clone this repository.
2. Open `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.
6. Open Google Search and search for a place.

### Firefox

1. Download or clone this repository.
2. Open `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on**.
4. Select `manifest.json`.
5. Open Google Search and search for a place.

## Example Searches

Try:

- `Expo XXI`
- `Zlota 44`
- `Eiffel Tower`
- `Warsaw Central Station`
- `restaurants near me`

If Google Search shows a location-style result, the extension should add an **Open on map** button.

## Browser Store Status

Planned:

- Chrome Web Store
- Firefox Add-ons

Until the extension is published in the stores, it can be installed manually from this repository.

## Permissions

The extension runs only on supported Google Search result pages.

It needs access to those pages so it can detect visible location blocks and add the button.

It does not use permissions to collect data.

## How It Works

The extension uses one content script:

```text
content.js
```

It looks for location signals on Google Search pages, such as map links, address blocks, coordinates, and place titles. When it detects a location, it builds a Google Maps URL and inserts an **Open on map** button into the page.

There is no build system and no runtime dependency.

## Project Files

```text
manifest.json       extension configuration
content.js          location detection and button injection
styles.css          button styling
icons/              extension icons
PRIVACY_POLICY.md   privacy policy
create_icons.py     helper script for icon generation
```

## Development

After changing the code:

1. Reload the extension in the browser.
2. Hard-refresh the Google Search tab.
3. Test a few location searches.

To regenerate icons:

```bash
pip install Pillow
python create_icons.py
```

## License

No license has been added yet.

If you want this to be formally open source, add a license file before publishing widely. MIT is a common simple option for small browser extensions.
