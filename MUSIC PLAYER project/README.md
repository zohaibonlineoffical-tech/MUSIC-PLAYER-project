# MusicFlow

A polished, framework-free music player built with HTML, CSS, and the HTML5 Audio API.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
```

The demo uses public SoundHelix MP3 files and Unsplash artwork so the interface works immediately with an internet connection. For a fully local demo, replace each `src` and `cover` value in `js/app.js` with paths such as `audio/song1.mp3` and `assets/images/cover1.jpg`.

## Included

- Play, pause, previous, next, seek, volume, mute, shuffle, repeat, and autoplay
- Search by title, artist, and album
- Online country-aware music search with India, Pakistan, Urdu-friendly queries, and global catalog results
- Playable catalog previews from Apple Music search results; full tracks require the provider's licensed service
- Favorite persistence, theme persistence, volume persistence, autoplay persistence, and last-song persistence
- Responsive sidebar, queue, mobile mini-player, keyboard shortcuts, toast feedback, and audio error handling
