# Pacify site

A hand-drawn illustrated environment for Pacify's projects.

## Structure

- `index.html` - page structure and project shelves
- `styles.css` - paper/workshop visual system, responsive layout and themes
- `script.js` - project registry, routing, theme persistence and system-theme detection
- `assets/paper-map.svg` - quiet illustrated paper background
- `assets/hero.svg` - hero workshop scene
- `assets/desk.svg` - workshop desk scene
- `assets/flagship.svg` - flagship shelf illustration
- `assets/practice.svg` - practice section illustration
- `assets/companion.svg` - recurring companion scene
- `assets/ai-authorship.svg` - AI/authorship illustration
- `assets/quote-card.svg` - quote note
- `assets/footer.svg` - footer workshop illustration
- `assets/project-icons.svg` - reusable project icon language
- `assets/weather-light.svg` / `assets/weather-dark.svg` - weather control artwork

## Theme behaviour

First visit follows the device's `prefers-color-scheme` setting. Clicking the weather icon creates a persistent Light/Dark preference in `localStorage`. The small `back to system weather` action returns control to the device setting.

## Project routing

Projects with a live site use `OPEN ↗`.
Projects without a live site use `SOURCE ↗` and link to GitHub instead.

The current project order is Flagship, Main, Peripherals, Experiments. Pacify Site itself is the environment and is not listed as a project.

## Deploy

Static site. Upload the folder to Vercel or any static host.
