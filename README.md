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

Each album is one entry in `_data/metal_top100.yml` (`rank`, `album`, `artist`, and optionally `year`, `genre`, `cover`, `tracks`, `blurb`). The entries there now are samples. Put square cover images (around 1200px, JPG) in `assets/img/albums/` and point `cover:` at them, e.g. `cover: /assets/img/albums/paranoid.jpg`. Albums without a cover get a generated placeholder.

The page counts down from the highest rank to #1. Set `countdown: false` at the top of `person/music/index.html` to start at #1 instead.

## Preview locally

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000.
