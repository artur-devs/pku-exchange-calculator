# PKU Exchange Calculator

A Progressive Web App (PWA) for calculating protein exchanges for PKU (Phenylketonuria) diet management.

## Features

- **Exchange Calculator** - Enter protein content and serving size to calculate grams per exchange
- **Multiple Exchange Values** - Shows grams for ½, 1, 1½, and 2 exchanges
- **Free Food Detection** - Automatically identifies foods with negligible protein (≤0.3g)
- **Reverse Calculator** - Convert between grams and exchanges
- **Favorites** - Save frequently used foods for quick access
- **History** - Track your recent calculations
- **Configurable Exchange Value** - Default 1.2g, adjustable in settings
- **Dark Mode** - Toggle between light and dark themes
- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen on mobile devices

## Exchange Thresholds

Based on the default 1.2g per exchange:

| Protein (per serving) | Classification |
|-----------------------|----------------|
| 0 - 0.3g | Free |
| 0.3 - 0.6g | ½ Exchange |
| 0.6 - 1.2g | 1 Exchange |
| 1.2 - 1.8g | 1½ Exchanges |
| 1.8 - 2.4g | 2 Exchanges |

## Usage

### Running Locally

The app requires a web server to function properly (PWA features need HTTPS or localhost).

**Option 1: Using npx serve**
```bash
npx serve
```

**Option 2: Using Python**
```bash
python -m http.server 8000
```

**Option 3: VS Code Live Server**
Install the "Live Server" extension and click "Go Live"

Then open `http://localhost:8000` (or the port shown) in your browser.

### Generating Icons

1. Open `generate-icons.html` in a browser
2. Click "Generate Icons"
3. Download each icon size
4. Save them to the `icons/` folder

## Project Structure

```
pku-exchange-calc/
├── index.html           # Main application
├── manifest.json        # PWA manifest
├── sw.js               # Service worker
├── generate-icons.html  # Icon generator tool
├── css/
│   └── styles.css      # Styling with dark mode
├── js/
│   ├── storage.js      # LocalStorage handling
│   └── app.js          # Application logic
└── icons/
    └── icon.svg        # Vector icon source
```

## License

MIT
