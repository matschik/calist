# Calist

A modern calisthenics workout app built with SvelteKit, featuring animated exercise demonstrations with optimized WebM video support.

## Features

- 🏋️ **Interactive Workouts** - Dynamic workout sessions with real-time progress tracking
- 🎥 **Optimized Media** - WebM video support with automatic GIF fallback for better performance
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- ⚡ **Fast Loading** - 71% smaller file sizes with VP9 video compression

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
pnpm build
```

You can preview the production build with `pnpm preview`.

## Media Optimization

This app automatically uses WebM video files for better performance, with GIF fallback for compatibility.

### Converting New Exercise GIFs

When you add new exercise GIF files to `static/exercises/`, automatically convert them to WebM:

```sh
# Convert new GIF files to WebM (only converts files without existing WebM versions)
pnpm convert-gifs

# Or run the script directly
./convert_gifs_to_webm.sh
```

The conversion script:
- ✅ Only converts GIF files that don't have WebM versions yet
- ✅ Uses VP9 codec for optimal compression (71% smaller files)
- ✅ Safe to run multiple times
- ✅ Shows conversion statistics and file size comparisons

### Requirements

- **ffmpeg** must be installed:
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
