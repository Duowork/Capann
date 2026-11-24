---
name: ai-slop-design
description: >
  Keep Capann's website and UI from looking AI-generated. Use this skill whenever you design,
  build, restyle, or review a web page, landing page, section, marketing copy, deck, or UI layout
  (apps/website, the extension's panels, the side panel), and whenever someone says a design looks
  generic, templated, "AI", "slop", tacky, or cluttered. Run its checklist before showing any
  design, and fix every rule the draft breaks first.
---

# AI slop design check

AI tools repeat the same handful of layout patterns, so a page built from them reads as
generated in seconds. None of these patterns is wrong on its own; the problem is reaching for
them by default. This skill lists the tells, what to do instead, and how Capann's brand applies.

Source: Elena (Sister Company), "I know you used AI to design your website",
https://sistercompany.ai/blog/signs-your-website-was-designed-by-ai (which also points to
Impeccable's longer AI-slop list). The ten signs below are hers, paraphrased; the borders,
gradients, animation, and Capann sections are ours.

## The tells and the fixes

| # | Tell | Instead |
|---|---|---|
| 1 | Zero-padded numbers (01, 02, 03) on sections or lists, or a giant faded number behind a heading | Number only real steps, without the leading zero. Everything else just gets a heading |
| 2 | Eyebrow labels: a tiny uppercase word over every heading ("OUR SERVICES" over "Our services") | Delete it. If it says something the heading doesn't, put that in the heading |
| 3 | A billboard-size two-tone headline: half one colour, half the accent (worse: a gradient) | One colour. Make a word louder with weight, or by cutting the words around it |
| 4 | A pill or badge above the hero headline, often with a (pulsing) status dot | Remove it. Status dots belong on things that have a status |
| 5 | Stat tiles ("75 clients · 5.0 rating · 8 awards"), numbers that count up | Keep a number only if a customer decides on it and you can back it up. Otherwise write a sentence |
| 6 | Default cream or beige backgrounds and cards, a glow behind the headline | Use the brand's real colours. Cream only if it is the brand |
| 7 | The cardapocalypse: everything in rounded, shadowed, bordered cards, three across, repeated down the page; cards in cards; coloured side stripes | Pick one set of cards, for the one thing that needs containers. Everything else is a list, columns, or a sentence |
| 8 | Chatty copy: a subhead under every heading, a tagline under the logo, sentences that explain how to read the page | Cut every sentence that doesn't do a job |
| 9 | The same stack in every section: eyebrow, heading, paragraph, button | Vary the shape of sections. Only the most important section gets a button |
| 10 | Arrows on every link, card, and button, in mixed styles | Links are underlined text. One arrow style, only where direction matters |

Copy tells to remove as well: em dashes, "not X, but Y" constructions, jargon ("solutions
tailored to your needs").

## Also slop (from our own reviews)

- **Border plus fill plus shadow on the same box.** A container gets at most one of: a fill that
  differs from the page, or a hairline. Never a border and a shadow on the same edge. Sections
  are separated by space, not by boxes.
- **Decorative gradients and glows.** Gradient panels, glowing orbs, radial "light" behind
  content, gradient text. A flat surface is the default; a gradient needs a functional reason.
- **Animation everywhere.** Floating, bobbing, pulsing, scroll-revealing every block. Animate
  only where motion explains something (a mark that follows the page as it scrolls, a state
  change) or marks the one moment that matters. Always respect `prefers-reduced-motion`.
- **Fake product.** Hand-drawn CSS mock-ups standing in for the product. Prefer real
  screenshots or recordings of the real product (see "Real product imagery" below). Abstract
  illustrations that explain a benefit are fine when the owner wants them (Capann's
  "Why go Premium?" panel), as long as nothing pretends to be a real screen or real data.
- **Testimonials, ratings, logos you don't have.** Never invent them.

## Capann's brand, applied

- **Colour:** a dark ink page by default, with a warm-paper light theme the visitor can switch
  to (the website: "Light and dark" in `apps/website/AGENTS.md`). Page-level UI uses the themed
  tokens (`canvas`, `fg`, `line`, `accent`, panel surfaces, text muted) so it works in both;
  fixed ink or paper only for things that are always dark or always light. Violet is the one
  accent: the primary action and the active state. Mint means recording/success; cream is the
  highlighter. Brand paper (#F6F5F2) is a real brand colour (the light theme's page), not
  default "tasteful" cream; check it in both themes rather than adding more cream surfaces.
- **Type:** Sora for everything readable. Big Shoulders Display is the brand's display face:
  use it for one or two brand moments (the hero), not for every section heading.
- **Icons:** Phosphor, fill weight. Where the fill version of a line glyph sits in a square
  (Check, Plus, List, X), prefer a circle variant (`CheckCircle`, `PlusCircle`) in content.
- **Product:** Capann draws over web pages. Show it doing that, on the playground's sample
  pages, instead of describing it.

## Real product imagery

Capture the real extension in a real browser rather than drawing it in CSS. For the website
this is automated: `npm run website:capture` (`apps/website/scripts/capture-product.mjs`)
builds every shot from the premium build on the website's `/playground`; add new shots there.
By hand: build the premium edition, load it unpacked in Playwright (`launchPersistentContext`
with `--load-extension`), open the website's `/playground`, and drive Capann there. In headless
Chrome, `captureVisibleTab` reads the real window, so use `viewport: null` with
`--window-size` and `--force-device-scale-factor=2` instead of an emulated viewport, or the
bottom of every capture comes back black. Save as WebP (about 1600px wide) under
`apps/website/src/assets/` and import it, so Vite hashes it.

## How to use this skill

1. Before designing, decide the page's one job and its single primary action.
2. Draft the structure as sections with *different* shapes (statement, product shot, list,
   columns, the one set of cards).
3. Before showing anything, go through the table and the "also slop" list for every section
   and write down which rules the draft breaks. Fix them, then show the work.
4. When reviewing an existing page, report findings as: section → tell (#) → fix.
