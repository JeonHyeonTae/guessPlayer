# English share image localization — KT, NC, SSG, Kiwoom

Created 2026-09-09 with the built-in `image_gen.imagegen` tool in text-localization mode. Each Korean source was inspected before editing. Originals were preserved.

All four generation calls completed successfully. Generated PNGs were exported with `sips` as JPEG quality 80, resampled to 1200 × 675. Final JPEGs were inspected individually: English spelling is correct, no Korean lettering remains, text stays inside the artwork, player silhouettes and team colors are preserved, and all nine number circles run from 1 through 9. The Kiwoom source had a repeated 6; the English output corrects the sequence.

## KT

- Original: `/Users/ch/Aidit/guessPlayer/public/share-kt-20260907.jpg`
- Generated PNG: `/Users/ch/.codex/generated_images/01a0847c-b5fb-7f53-878e-c925b9eae006/exec-5cc205ba-d1f7-4e03-934d-5bc932dca93d.png`
- Final JPEG: `/Users/ch/Aidit/guessPlayer/public/share-kt-en-20260909.jpg`
- Dimensions: 1200 × 675 pixels
- Size: 298818 bytes
- Final visual QA: passed

### Final prompt

```text
Use case: text-localization
Asset type: English social sharing artwork for a baseball player guessing game.
Input images: Image 1 is the EDIT TARGET, the current KT Korean share image.
Primary request: Translate ALL Korean lettering in Image 1 into the exact English text below while preserving the existing illustrated artwork. Change text only and adjust/reflow typography within existing text zones so every English word fits.
Main heading at left, large and powerful, EXACTLY these three stacked lines:
"KNOW YOUR"
"KT"
"PLAYERS?"
Retain the original bold slanted distressed sports poster typography, team color emphasis, and clear visual hierarchy; use ample safe margins.
Brush stripe subtitle EXACTLY: "REAL FAN? PROVE IT!"
Small clue-description line EXACTLY: "Team • Position • Throws • Bats"
Bottom-right badge EXACTLY: "9 GUESSES!"
Clue card labels, translated to fit each original card: Upper-left baseball card: "THROWS L" (remove redundant old "LEFT"). Middle-left shield card: "DEFENSE". Upper-right running figure card: "OUTFIELDER". Middle-right batter card: "BATS R". Lower-right shoe card: "SPEED".
Number circles: preserve all nine circles and their style and locations, sequentially labeled 1, 2, 3, 4, 5, 6, 7, 8, 9 with only number 4 highlighted as in the source.
Invariants: preserve the exact black, white, and vivid red team accent palette, grunge textures and paint strokes, stadium/background/lighting, question-mark-faced silhouetted baseball player, existing pose/uniform/props, all clue-card graphics and placement, and original 16:9 composition. Text localization only. Do not redesign the artwork. Do not add a logo, watermark, extra text, or new objects. No Hangul or other Korean characters may remain anywhere. Ensure accurate English spelling and no clipping or overlapping text.
Output: full-bleed 16:9 landscape artwork, ideally 1536×864 pixels.
```

## NC

- Original: `/Users/ch/Aidit/guessPlayer/public/share-nc-20260907.jpg`
- Generated PNG: `/Users/ch/.codex/generated_images/01a0847c-b5fb-7f53-878e-c925b9eae006/exec-e66b8268-c276-4589-8a29-9b0daad619f6.png`
- Final JPEG: `/Users/ch/Aidit/guessPlayer/public/share-nc-en-20260909.jpg`
- Dimensions: 1200 × 675 pixels
- Size: 305461 bytes
- Final visual QA: passed

### Final prompt

```text
Use case: text-localization
Asset type: English social sharing artwork for a baseball player guessing game.
Input images: Image 1 is the EDIT TARGET, the current NC Korean share image.
Primary request: Translate ALL Korean lettering in Image 1 into the exact English text below while preserving the existing illustrated artwork. Change text only and adjust/reflow typography within existing text zones so every English word fits.
Main heading at left, large and powerful, EXACTLY these three stacked lines:
"KNOW YOUR"
"NC"
"PLAYERS?"
Retain the original bold slanted distressed sports poster typography, team color emphasis, and clear visual hierarchy; use ample safe margins.
Brush stripe subtitle EXACTLY: "REAL FAN? PROVE IT!"
Small clue-description line EXACTLY: "Team • Position • Throws • Bats"
Bottom-right badge EXACTLY: "9 GUESSES!"
Clue card labels, translated to fit each original card: Upper-left mask card: "CATCHER". Middle-left baseball diamond card: "INFIELDER". Upper-right glove card: "DEFENSE". Middle-right batter card: "BATS L". Lower-right baseball card: "THROWS R".
Number circles: preserve all nine circles and their style and locations, sequentially labeled 1, 2, 3, 4, 5, 6, 7, 8, 9 with only number 9 highlighted as in the source.
Invariants: preserve the exact deep midnight navy blue, gold, and white team accent palette, grunge textures and paint strokes, stadium/background/lighting, question-mark-faced silhouetted baseball player, existing pose/uniform/props, all clue-card graphics and placement, and original 16:9 composition. Text localization only. Do not redesign the artwork. Do not add a logo, watermark, extra text, or new objects. No Hangul or other Korean characters may remain anywhere. Ensure accurate English spelling and no clipping or overlapping text.
Output: full-bleed 16:9 landscape artwork, ideally 1536×864 pixels.
```

## SSG

- Original: `/Users/ch/Aidit/guessPlayer/public/share-ssg-20260907.jpg`
- Generated PNG: `/Users/ch/.codex/generated_images/01a0847c-b5fb-7f53-878e-c925b9eae006/exec-9101b652-28bf-458c-8c99-fb16d94e4491.png`
- Final JPEG: `/Users/ch/Aidit/guessPlayer/public/share-ssg-en-20260909.jpg`
- Dimensions: 1200 × 675 pixels
- Size: 330604 bytes
- Final visual QA: passed

### Final prompt

```text
Use case: text-localization
Asset type: English social sharing artwork for a baseball player guessing game.
Input images: Image 1 is the EDIT TARGET, the current SSG Korean share image.
Primary request: Translate ALL Korean lettering in Image 1 into the exact English text below while preserving the existing illustrated artwork. Change text only and adjust/reflow typography within existing text zones so every English word fits.
Main heading at left, large and powerful, EXACTLY these three stacked lines:
"KNOW YOUR"
"SSG"
"PLAYERS?"
Retain the original bold slanted distressed sports poster typography, team color emphasis, and clear visual hierarchy; use ample safe margins.
Brush stripe subtitle EXACTLY: "REAL FAN? PROVE IT!"
Small clue-description line EXACTLY: "Team • Position • Throws • Bats"
Bottom-right badge EXACTLY: "9 GUESSES!"
Clue card labels, translated to fit each original card: Upper-right running figure card: "OUTFIELDER". Right-center yellow pitcher card: "THROWS R". Lower-right blue catcher card: "CATCHER". Lower-middle-left purple batter card: "POWER". Lower-middle-right green batter card: "BATS L".
Number circles: preserve all nine circles and their style and locations, sequentially labeled 1, 2, 3, 4, 5, 6, 7, 8, 9 with only number 8 highlighted as in the source.
Invariants: preserve the exact black, white, vivid red, preserving the colorful clue cards team accent palette, grunge textures and paint strokes, stadium/background/lighting, question-mark-faced silhouetted baseball player, existing pose/uniform/props, all clue-card graphics and placement, and original 16:9 composition. Text localization only. Do not redesign the artwork. Do not add a logo, watermark, extra text, or new objects. No Hangul or other Korean characters may remain anywhere. Ensure accurate English spelling and no clipping or overlapping text.
Output: full-bleed 16:9 landscape artwork, ideally 1536×864 pixels.
```

## KIWOOM

- Original: `/Users/ch/Aidit/guessPlayer/public/share-kiwoom-20260907.jpg`
- Generated PNG: `/Users/ch/.codex/generated_images/01a0847c-b5fb-7f53-878e-c925b9eae006/exec-66402060-5c45-43f9-99eb-b1dca4dd7ab4.png`
- Final JPEG: `/Users/ch/Aidit/guessPlayer/public/share-kiwoom-en-20260909.jpg`
- Dimensions: 1200 × 675 pixels
- Size: 347851 bytes
- Final visual QA: passed

### Final prompt

```text
Use case: text-localization
Asset type: English social sharing artwork for a baseball player guessing game.
Input images: Image 1 is the EDIT TARGET, the current KIWOOM Korean share image.
Primary request: Translate ALL Korean lettering in Image 1 into the exact English text below while preserving the existing illustrated artwork. Change text only and adjust/reflow typography within existing text zones so every English word fits.
Main heading at left, large and powerful, EXACTLY these three stacked lines:
"KNOW YOUR"
"KIWOOM"
"PLAYERS?"
Retain the original bold slanted distressed sports poster typography, team color emphasis, and clear visual hierarchy; use ample safe margins.
Brush stripe subtitle EXACTLY: "REAL FAN? PROVE IT!"
Small clue-description line EXACTLY: "Team • Position • Throws • Bats"
Bottom-right badge EXACTLY: "9 GUESSES!"
Clue card labels, translated to fit each original card: Upper-left baseball card: "THROWS L". Middle-left baseball diamond card: "INFIELDER". Lower-left mask card: "CATCHER". Upper-right fist card: "CLUTCH". Middle-right bat card: "BATS R".
Number circles: preserve all nine circles and their style and locations, sequentially labeled 1, 2, 3, 4, 5, 6, 7, 8, 9 with only number 4 highlighted as in the source.
Invariants: preserve the exact black, white, deep burgundy and rose red team accent palette, grunge textures and paint strokes, stadium/background/lighting, question-mark-faced silhouetted baseball player, existing pose/uniform/props, all clue-card graphics and placement, and original 16:9 composition. Text localization only. Do not redesign the artwork. Do not add a logo, watermark, extra text, or new objects. No Hangul or other Korean characters may remain anywhere. Ensure accurate English spelling and no clipping or overlapping text.
Output: full-bleed 16:9 landscape artwork, ideally 1536×864 pixels.
```


