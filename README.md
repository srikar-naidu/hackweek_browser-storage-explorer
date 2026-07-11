# Browser Storage Explorer

A professional browser extension for exploring and managing client-side storage including localStorage, sessionStorage, and cookies.

## Description

Browser Storage Explorer is a Manifest V3 browser extension that provides developers and users with a unified interface to view, search, filter, and manage all browser storage data. The extension uses vanilla JavaScript with a modular architecture, separating concerns between the popup UI, storage access layer, and utility functions. It follows a clean, component-based structure within a single-page application model, with real-time data refresh capabilities and comprehensive export functionality.

## Technologies Used

JavaScript, HTML5, CSS3, Chrome Extension API, Manifest V3

## Features

- Comprehensive Storage View: Display all data from localStorage, sessionStorage, and cookies in a unified interface
- Detailed Information: Shows key, value, storage type, and approximate size for each item
- Advanced Search: Search for specific entries by key or value across all storage types
- Filtering: Filter by storage type using tabs or dropdown
- Quick Actions: Copy values, delete individual items, or clear all storage
- Export Functionality: Export all storage data to JSON format
- Professional Light Theme: Clean, modern UI with excellent readability
- Real-time Stats: View total items count and storage size at a glance

## Installation

### Chrome / Edge / Brave

1. Clone or download this repository
2. Open your browser and navigate to:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable **Developer mode** (toggle in top-right corner)
4. Click **Load unpacked**
5. Select the project folder containing `manifest.json`
6. The extension icon will appear in your browser toolbar

### Firefox

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file from the project folder
5. The extension will be installed temporarily (until Firefox restarts)

## Generating Icons

Before using the extension, you need to generate the icon files:

1. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
2. Run the icon generator script:
   ```bash
   node generate-icons.js
   ```

**Alternative**: You can use any 16x16, 48x48, and 128x128 PNG images with a storage-related design. Just name them `icon-16.png`, `icon-48.png`, and `icon-128.png` and place them in the `icons/` folder.

## Usage

1. Click the extension icon in your browser toolbar to open the popup
2. View all storage items organized by type
3. Use the search bar to find specific entries
4. Filter by storage type using tabs or the dropdown menu
5. Click **Copy Value** to copy an item's value to clipboard
6. Click **Delete** to remove individual items
7. Use **Export JSON** to download all storage data
8. Use **Clear All** to remove all storage data (with confirmation)
9. Click **Refresh** to reload storage data

## Storage Types

### Local Storage
- Persistent storage that remains until explicitly cleared
- Accessible across all tabs and windows of the same origin
- Typical use: user preferences, cached data

### Session Storage
- Temporary storage that lasts for the duration of the browser session
- Cleared when the browser or tab is closed
- Typical use: temporary form data, session-specific information

### Cookies
- Small data pieces stored by websites
- Can have expiration dates and security flags
- Typical use: authentication tokens, user tracking, preferences

## File Structure

```
browser-storage-explorer/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI structure
├── popup.css             # Styling and light theme
├── popup.js             # Main popup functionality
├── content.js            # Content script to interact with active tab's storage
├── generate-icons.js     # Icon generation script
├── package.json         # Dependencies for icon generation
├── test-page.html       # Test page to verify extension functionality
├── icons/
│   ├── icon-16.png          # 16x16 icon
│   ├── icon-48.png          # 48x48 icon
│   └── icon-128.png         # 128x128 icon
└── README.md             # This file
```

## Technical Details

- **Manifest Version**: 3 (Chrome Extension Manifest V3)
- **Permissions**: 
  - `storage`: Access to browser storage APIs
  - `cookies`: Access to cookie data
  - `activeTab`: Access to current tab data
  - `scripting`: Inject scripts into active tab
- **Host Permissions**: `<all_urls>` (required to access cookies and storage on any website)

## Browser Compatibility

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave (latest)
- ⚠️ Firefox (requires temporary add-on installation)
- ❌ Safari (not supported - uses different extension format)

## Privacy & Security

- All data is processed locally in your browser
- No data is sent to external servers
- The extension only accesses storage for the current website
- You have full control over viewing, copying, and deleting data

## Development

### Prerequisites
- A modern web browser (Chrome, Edge, or Brave recommended)
- Basic understanding of browser extensions

### Making Changes

1. Edit the source files (`popup.html`, `popup.css`, `popup.js`)
2. Go to `chrome://extensions/`
3. Find "Browser Storage Explorer" and click the **Refresh** icon
4. The changes will be applied immediately

### Testing

1. Load the extension in developer mode
2. Open `test-page.html` in your browser - this page will add sample storage data for testing
3. Click the extension icon to open the popup
4. Verify that storage items are displayed correctly
5. Test search, filter, copy, delete, and export functions

## Troubleshooting

**Extension not loading:**
- Ensure all required files are present
- Check that icon files exist in the `icons/` folder
- Verify manifest.json is valid JSON

**No storage items showing:**
- Visit a website that actually uses storage
- Check browser console for errors (F12 → Console)
- Ensure the extension has necessary permissions

**Cookies not displaying:**
- Some cookies may be restricted by browser security policies
- HttpOnly cookies cannot be accessed via JavaScript
- Ensure the extension has cookie permissions enabled

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available for educational purposes.

## Demo Video

To create a demo video:
1. Install the extension following the instructions above
2. Visit a website with storage data (e.g., any modern web app)
3. Open the extension popup
4. Demonstrate all features: viewing, searching, filtering, copying, deleting, exporting, and clearing storage
5. Use screen recording software to capture the demonstration
