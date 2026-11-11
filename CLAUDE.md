# maggiemshen.com — CLAUDE.md

## What this is
Maggie Shen's personal portfolio site. Its purpose is to showcase her abilities as a product engineer, and the site itself is part of that showcase. Its theme is a house: a portfolio as your home on the internet. The homepage intro is a house made of text, the links are doors, and the pages behind them are rooms. The house shows up indirectly, through the shape of the text, its shadow, the sky behind it, and the transitions between pages.

## Stack
- Next.js (App Router), React, TypeScript (strict)
- Hosted on Vercel, domain maggiemshen.com
- Styling: Tailwind CSS v4. Theme tokens live in `app/globals.css` under `@theme` (there is no `tailwind.config` file).
- Package manager: npm

## Commands
- `npm run dev`: local dev server at http://localhost:3000
- `npm run build`: production build
- `npm run lint`: ESLint
- `npm run typecheck`: generates Next's route types, then runs `tsc --noEmit`

This is Next.js 16. Read the matching guide in `node_modules/next/dist/docs/` before using a Next API (see `AGENTS.md`).

## Folder layout
```
app/                 routes (one folder per page)
components/          shared UI (site shell, weather/clock line, door link, footer)
app/fonts/           local font files (Switzer, Space Grotesk), loaded with next/font/local
features/sky/        the dithered weather sky, self-contained
features/sky/config/ Maggie's tuned cloud settings, one JSON file per weather
features/projects/   the projects platform
content/             all site copy (MDX or TS), separate from components
public/sky/clouds/   31 grayscale cloud cutouts (middle and front layers)
public/sky/strips/   11 distant cloud strips (far layer)
docs/specs/          one spec per feature: read the relevant one before working on it
docs/reference/      the finished sky mocks the sky is ported from
docs/design/         Figma exports and references
```

## Pages
- `/`: homepage (house of text, live sky)
- `/about`
- `/projects`: projects platform
- `/projects/film-jousting`: Film Jousting project page
- `/projects/overlook`: Overlook project page
- `/projects/this-site`: This site project page
- `/photography`: single gallery
- Contact lives in the footer: LinkedIn, GitHub and email. The footer appears on the homepage, About, Projects and Photography. The three project pages get it once Maggie's Figma mock settles where it sits, likely at the very end of the page.
- "Currently into" is on hold until Maggie decides whether to keep it.

## Copy rules
- All copy comes from Maggie and lives in `content/`. Claude Code keeps copy exactly as written.
- When a component needs text that doesn't exist yet, use an obvious placeholder (`[COPY: about intro]`) and flag it.

## Design rules
- One light theme: a white/off-white page at all hours.
- Type: Switzer is the standard typeface. Space Grotesk regular is used for the homepage's connecting words and for the weather/clock line and footer. Fonts load locally with `next/font/local`, from `app/fonts/fonts.ts`. Switzer's license (ITF FFL) allows self-hosting on this site but not sharing the font files publicly, so the Switzer files are git-ignored until hosting is decided. Space Grotesk is OFL and committed.
- Figma frames are loose mocks showing layout and intent. Spacing and type sizes come from named tokens in the Tailwind theme, starting from Tailwind's defaults and tuned in the browser. Build hierarchy with type size and whitespace.
- The weather/clock line sits at the top of every page, so every room feels like the same place.
- The house-shaped favicon is also the homepage logo.
- Mobile first.
- Components use the theme tokens for colors, type sizes and spacing, so changing a token updates the whole site.

## Motion rules
- Big room-to-room links swing open like doors. Only the text swings. The swing is fast.
- Page transitions feel like a camera walking up to, into and out of rooms. Use the View Transitions API.
- `prefers-reduced-motion`: page transitions and door swings become a simple fade. The sky keeps moving as normal.
- Animations pause when the tab is hidden.

## Live NYC weather and time
- Time: computed in the browser with `Intl` and the `America/New_York` time zone, ticking every second.
- Weather: Open-Meteo, free for non-commercial use. Fetched through a Next.js server route cached for 15 minutes, so every visitor shares one response.
- One function maps Open-Meteo weather codes to the five sky sets, with these ids everywhere in code and file names: `sunny`, `partly-cloudy`, `cloudy`, `rainy`, `snowy`. Drizzle and storms map to rainy, sleet and flurries to snowy, overcast to cloudy.
- If the weather call fails, show the sunny sky.
- Open-Meteo asks for credit for its data. The credit goes on the This site project page.

## Sky (see docs/specs/sky.md)
- Self-contained in `features/sky/`. Built and tuned on a private `/lab` route before it goes on the homepage.
- The per-weather cloud settings come from the saved mock configs, exported to JSON. They are data, kept separate from the code.
- Dither each cloud fresh at its final pixel size. Scaling a dithered image breaks the dot pattern.

## Other integrations
- On site load, wake Film Jousting's backend (Render free tier) so its cold start is out of the way.

## Accessibility
- Every link works by keyboard, with a visible focus state.
- The canvas sky is decorative (`aria-hidden`). The intro text stays real, readable text.

## How to work in this repo
- Read the relevant spec in `docs/specs/` before starting a feature.
- Plan before writing code, and wait for Maggie's OK on the plan.
- One feature per branch.
- When a decision changes, update the spec or this file in the same change.
- When you make a non-obvious technical choice, explain it in plain terms in your summary.
