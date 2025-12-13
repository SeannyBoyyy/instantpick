# InstantPick

**InstantPick** is a professional, minimalist spin-the-wheel web app for instantly picking random winners at corporate events, team meetings, or TV displays. Inspired by WheelOfNames, it’s designed for speed, clarity, and reliability.

## Features

- 🎯 **Spin-the-Wheel**: Randomly select winners from a list of names
- 📝 **Easy Entry**: Paste or type names, one per line
- 🏆 **Winner History**: See previous draws, with timestamps
- 🔄 **Shuffle & Sort**: Shuffle entries or sort A-Z
- 🚫 **Remove Duplicates**: Instantly clean up your list
- 🥇 **Multi-Round Draws**: Remove winners from entries for next round
- ⚙️ **Settings Panel**: Choose number of winners, enable/disable sound & confetti
- 🖼️ **Logo Support**: Add your company logo for branding
- 🕹️ **Fast Spin**: Quick animation (1.2s) for instant results
- 💾 **Local Persistence**: Entries, settings, and history saved in your browser
- 📱 **PWA/Offline**: Works offline and installable as an app (if enabled)
- 🖥️ **Responsive**: Looks great on desktop, tablet, and mobile

## Demo

[Live Demo on GitHub Pages](https://seannyboyyy.github.io/instantpick/)

## Getting Started

### Local Development

```bash
git clone https://github.com/SeannyBoyyy/instantpick.git
cd instantpick
npm install
npm run dev
```

Open [http://localhost:5173/instantpick/](http://localhost:5173/instantpick/) in your browser.

### Build for Production

```bash
npm run build
```

The output will be in the `dist/` folder, ready for static hosting.

## Usage

- Enter names in the left panel (one per line)
- Click **Spin** to pick winners
- Use **Settings** (gear icon) to adjust winner count, sound, confetti, or reset the app
- Use **Clear All** to remove all entries (confirmation required)
- Winner history is shown below the entry box

## Customization

- Replace `public/logo.png` with your own logo for branding
- Favicon and header logo use this file

## Technologies

- React + Vite
- Tailwind CSS
- Framer Motion
- Headless UI
- Canvas API
- canvas-confetti
- LocalStorage
- PWA (via vite-plugin-pwa)

## License

MIT
