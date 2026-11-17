# Partly cloudy sky, saved 17 Nov 2026

A checkpoint of the Partly cloudy mock that Maggie liked on 17 Nov, after the site-scaling work. It replaces nothing: the 6 Nov checkpoint (`claude/sky-partly-saved.md`) is still there.

- Mock: Sky mock: Partly cloudy, https://claude.ai/artifact/58ckjEwgSDv4aMZ5nswiDM
- Page version: 1794897973-a76f (the page code is saved alongside this file as `claude/sky-partly-saved-2026-11-17-page.html`)
- Picks: saved inside the mock's database at `saved/partly-2026-11-17` and copied below

## What this version does

- The preview is the real homepage's size: the box fills the screen and the sky is its top 40%.
- Sizes are set at a 1440×900 window. On a bigger screen the clouds grow by max(1, √(H/900)·√(W/1440)), and wide screens get a few more clouds to fill the width. The far strip grows with height only.
- Far strips tile without mirroring. The tiles overlap by 25% and fade out at their edges.
- Each layer's heights are spread across their range, so a visit can't put every cloud up high.
- A large cloud (its Smallest–Largest midpoint is 175% or more) appears at most twice in a layer.
- Two copies of the same cloud keep further apart than two different clouds do.

## In words

**Front** (3 clouds at 1440×900)
- 58-2: 60–105%, Middle and Lower, contrast 100%, brightness −1, Lighter 85%
- m02-1: 70–185%, all bands, contrast 95%, brightness −8, Lighter 45%
- m38-2: 70–180%, all bands, contrast 125%, brightness +1, Lighter 65%
- m52-1: 185–250%, Middle and Lower, contrast 65%, brightness +11, Lighter 100% (counts as large)
- s26-2: 80–205%, all bands, contrast 105%, brightness +7, Lighter 80%

**Middle** (5 clouds at 1440×900)
- 07-1: 115–370%, Upper and Lower, contrast 100%, brightness +7, Lighter 35% (large)
- m02-1: 230–400%, Middle only, contrast 140%, brightness −11, Lighter 25% (large)
- m52-1: 215–335%, all bands, contrast 105%, brightness +2, Lighter 100% (large)

**Far**
- 10-row (Low bank): size 190%, shade 130%, height −14%, ink 5%
- 39-rows (Rows to the horizon): size 200%, shade 45%, height −50%, ink 0%

## The saved choices

```json
{"far":{"10-row":{"height":-0.14,"ink":0.05,"shade":1.3,"size":1.9},"39-rows":{"height":-0.5,"ink":0,"shade":0.45,"size":2}},"front":{"58-2":{"bright":-0.01,"contrast":1,"height":["mid","low"],"light":0.85,"sizeMax":1.05,"sizeMin":0.6},"m02-1":{"bright":-0.08,"contrast":0.95,"height":["high","mid","low"],"light":0.45,"sizeMax":1.85,"sizeMin":0.7},"m38-2":{"bright":0.01,"contrast":1.25,"height":["high","mid","low"],"light":0.65,"sizeMax":1.8,"sizeMin":0.7},"m52-1":{"bright":0.11,"contrast":0.65,"height":["mid","low"],"light":1,"sizeMax":2.5,"sizeMin":1.85},"s26-2":{"bright":0.07,"contrast":1.05,"height":["high","mid","low"],"light":0.8,"sizeMax":2.05,"sizeMin":0.8}},"mid":{"07-1":{"bright":0.07,"contrast":1,"height":["high","low"],"light":0.35,"sizeMax":3.7,"sizeMin":1.15},"m02-1":{"bright":-0.11,"contrast":1.4,"height":["mid"],"light":0.25,"sizeMax":4,"sizeMin":2.3},"m52-1":{"bright":0.02,"contrast":1.05,"height":["high","mid","low"],"light":1,"sizeMax":3.35,"sizeMin":2.15}}}
```

## To go back to this version

1. **Picks:** write the JSON above (or the mock's `saved/partly-2026-11-17` document) to `sky/choices` in the Partly cloudy mock, then reload it.
2. **Page:** if the page code has changed since, republish `claude/sky-partly-saved-2026-11-17-page.html` as the mock's index.html. The cloud images in `s/src` and `s/far` stay where they are.
