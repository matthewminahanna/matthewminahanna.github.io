# matthewminahanna.github.io

Personal site, built with Jekyll so GitHub Pages builds it on every push. No build step or plugins needed.

## Where things live

| To change | Edit |
| --- | --- |
| Name, tagline | `_config.yml` (`title`, `tagline`) |
| Home page | `index.html` |
| Research page text / entries | `research/index.html`, `_data/research.yml` |
| Math writing | `_posts/` |
| Shows and episode reviews | `_shows/`, `_episodes/<show>/` |
| 100 metal albums | `_data/metal_top100.yml`, cover images in `assets/img/albums/` |
| Colors, font | top of `assets/css/site.css` (`:root`), font link in `_includes/head.html` |

## Math writing

Add `_posts/YYYY-MM-DD-short-title.md`:

```markdown
---
title: On a lemma I like
lede: One-line summary shown in lists.
---

Inline math like $$a^2 + b^2 = c^2$$, and display math on its own line:

$$
\int_0^1 x^n \, dx = \frac{1}{n+1}
$$
```

Math is rendered with KaTeX. Use `$$ … $$` for both inline and display math. Wrap theorem statements in `<div class="theorem" markdown="1"> … </div>`; also available: `lemma`, `proposition`, `corollary`, `definition`, `remark`, `example`, `proof`. The sample post in `_posts/` shows all of it, so delete it once you've written a real one.

## Show reviews

- **New show:** add `_shows/<slug>.md` with `title`, `years`, `creator`, `total_episodes` (drives the progress bar), and `tagline`. It shows up in the Shows page and the "The Person" dropdown automatically.
- **New episode review:** add `_episodes/<slug>/sXXeYY-title.md`:

  ```markdown
  ---
  title: One for the Angels
  season: 1
  episode: 2
  aired: 1959-10-09
  writer: Rod Serling
  director: Robert Parrish
  rating: 8      # out of 10, optional
  ---

  The review.
  ```

  Keep the `sXXeYY` prefix (zero-padded), because that's what orders episodes and the previous/next links.

## 100 metal albums

Each album is one entry in `_data/metal_top100.yml` (`rank`, `album`, `artist`, and optionally `year`, `genre`, `cover`, `tracks`, `blurb`). Covers are fetched for you. Whenever the album list changes, the **Album covers** GitHub Action (`.github/workflows/album-covers.yml`) looks up each album that doesn't have a cover yet and commits it to `assets/img/albums/`. It tries iTunes first, then Deezer, then MusicBrainz and the Cover Art Archive, and only uses a result when both the artist and the title match. The Actions tab shows what it found, and you can also run it by hand from there.

To use your own image instead (or if it can't find one), drop a square image (around 1200px; JPG, PNG or WebP) into `assets/img/albums/`, named after the artist and album, e.g. `vektor-terminal-redux.jpg`, or just the album, e.g. `terminal-redux.jpg`. It's picked up with no list edits, and the Action never overwrites it. Albums without an image get a generated placeholder. To use a file with a different name, set `cover:` on that album.

The page starts at #1 and counts up. Set `countdown: true` at the top of `person/music/index.html` to count down to #1 instead.

## Preview locally

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.
