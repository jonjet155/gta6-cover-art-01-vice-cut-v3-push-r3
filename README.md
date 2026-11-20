# VICE CUT — Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/jonjet155/gta6-cover-art-01-vice-cut-v3-push-r3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/jonjet155/gta6-cover-art-01-vice-cut-v3-push-r3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

A photo-led GTA 6 cover studio that runs entirely offline in a desktop browser.
Pick your photos, place them on a dense comic-panel cover, letter it in the
genre's style, and export a shareable PNG. Your photos never leave your machine.
See the bounty: https://make.fun/bounty/gta6-cover-art-01

## What it does

- **7 layouts** — Hero Collage (default), Comic (diagonal cuts), Hero + 3,
  Film Strip, Four Cut, Hero + 5, Billboard. Switching layouts keeps your edits.
- **6 grades, each with an intensity slider** — Warm Sunset (default), Neon
  Night, Teal Coast, Ink Mono, Twilight Gold, Coral Heat.
- **4 caption styles + role-tag toggle** — Chrome, Neon, Sunset, Mono; a role
  tag (THE DRIVER, THE RUNAWAYS, …) sits on every panel.
- **Photo-led, not template-led** — click a panel, then a tray photo, to place
  it. Drag to pan, scroll to zoom, double-click to re-centre on that spot.
  Upload your own photos, fill empty panels, or fill every panel from one photo.
- **Captions and role tags edit in place**, per panel.
- **Dense poster furniture** — 5-star press strip with quote + gazette + VOL
  badge, giant striped retro-chrome VICE CUT title, neon script tagline
  "Painted in Leonida.", tagline ribbon, billing block, COMING SOON, barcode
  and a gold ORIGINAL COVER ART seal. No void anywhere.
- **One-click PNG export in the three post sizes** — square 1080×1080,
  portrait 1080×1350, wide 1920×1080 (exact dimensions).

Zero clicks to a first cover: the seven sample photos are preloaded, the hero
collage + sunset grade + VICE CUT title are the defaults.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: `app/` is plain static files (HTML, CSS,
ES modules, vendored fonts and photos).

## Screenshots

- `1-cover.jpg` — the cover, wide, straight from the app.
- `2-editor.jpg` — the studio with a photo loaded.
- `3-cover.jpg` — the same cover exported at square 1080×1080.
- `4-cover.jpg` — the same cover exported at portrait 1080×1350.

## Sample photos (Wikimedia Commons, free licenses)

- `hero.jpg` — "Woman enjoying sunset while sitting on classic car in open
  field" — CC BY 2.0 — https://commons.wikimedia.org/wiki/File:Woman_enjoying_sunset_while_sitting_on_classic_car_in_open_field.jpg
- `couple.jpg` — "Couple meets sunset in San Juan, Puerto Rico 2019-10-27" —
  CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:Couple_meets_sunset_in_San_Juan,_Puerto_Rico_2019-10-27.jpg
- `duo.jpg` — "Two friends! (21063413995).jpg" — CC BY-SA 2.0 —
  https://commons.wikimedia.org/wiki/File:Two_friends!_(21063413995).jpg
- `boats.jpg` — "Boats on a beach at sunset in Si Phan Don" — CC BY-SA 4.0 —
  https://commons.wikimedia.org/wiki/File:Boats_on_a_beach_at_sunset_in_Si_Phan_Don.jpg
- `corvette.jpg` — "1970–1972 Chevrolet Corvette, red, Golden Super Cruise
  2026-08-01" — CC BY-SA 4.0 — https://commons.wikimedia.org/wiki/File:1970–1972_Chevrolet_Corvette,_red,_Golden_Super_Cruise_2026-08-01.jpg
- `pier.jpg` — "Santa Cruz Wharf and people" — CC BY-SA 3.0 —
  https://commons.wikimedia.org/wiki/File:Santa_Cruz_Wharf_and_people.JPG
- `skyline.jpg` — "2007 Miami sunset 3" — CC BY 3.0 —
  https://commons.wikimedia.org/wiki/File:2007_Miami_sunset_3.jpg

Fonts: Bebas Neue + Caveat, SIL Open Font License, under `app/fonts/`.
