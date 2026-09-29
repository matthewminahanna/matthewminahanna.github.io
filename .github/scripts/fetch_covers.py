#!/usr/bin/env python3
"""Download a cover for every album in _data/metal_top100.yml that lacks one.

Covers are saved to assets/img/albums/<artist>-<album>.jpg, the name the site
looks for. Albums that already have an image there (or a `cover:` entry) are
left alone, so a cover you add by hand always wins.

Sources, in order: iTunes, Deezer, then MusicBrainz + Cover Art Archive. The
stores come first because their artwork is the label's official cover; the
Cover Art Archive is community-run and its main image for an album is
sometimes a promo disc or a scan of another edition. A result is only used
when both the artist and the album title match.
"""
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "_data" / "metal_top100.yml"
OUT = ROOT / "assets" / "img" / "albums"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE = 1200
USER_AGENT = (
    "matthewminahanna.github.io-cover-fetcher/1.0 "
    "(https://github.com/matthewminahanna/matthewminahanna.github.io)"
)


def slugify(text):
    """Same result as Jekyll's `slugify` filter for these names."""
    return re.sub(r"[\W_]+", "-", text.lower()).strip("-")


def norm(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = text.lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def core_title(title):
    """Title without edition notes like "(Remastered)" or "[Deluxe Edition]"."""
    title = re.sub(r"\s*[\(\[][^)\]]*[\)\]]", "", title)
    title = re.sub(r"\s+-\s+(single|ep|remaster.*|deluxe.*)$", "", title, flags=re.I)
    return norm(title)


def fetch(url, retries=3):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except urllib.error.HTTPError as err:
            if err.code == 404:
                return None
            if attempt == retries - 1:
                raise
        except urllib.error.URLError:
            if attempt == retries - 1:
                raise
        time.sleep(2 ** attempt)
    return None


def fetch_json(url):
    body = fetch(url)
    return json.loads(body) if body else {}


def from_cover_art_archive(artist, album):
    phrase = lambda s: '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    query = f"releasegroup:{phrase(album)} AND artist:{phrase(artist)}"
    url = "https://musicbrainz.org/ws/2/release-group/?" + urllib.parse.urlencode(
        {"query": query, "fmt": "json", "limit": 10}
    )
    groups = fetch_json(url).get("release-groups", [])
    time.sleep(1.1)  # MusicBrainz allows one request per second
    for group in groups:
        if core_title(group.get("title", "")) != norm(album):
            continue
        credits = group.get("artist-credit", [])
        names = [c.get("name", "") for c in credits] + [c.get("artist", {}).get("name", "") for c in credits]
        if norm(artist) not in {norm(n) for n in names}:
            continue
        image = fetch(f"https://coverartarchive.org/release-group/{group['id']}/front-1200")
        if image:
            return image, f"Cover Art Archive (release group {group['id']})"
    return None


def from_itunes(artist, album):
    url = "https://itunes.apple.com/search?" + urllib.parse.urlencode(
        {"term": f"{artist} {album}", "entity": "album", "limit": 25}
    )
    for result in fetch_json(url).get("results", []):
        if norm(result.get("artistName", "")) != norm(artist):
            continue
        if core_title(result.get("collectionName", "")) != norm(album):
            continue
        art = result.get("artworkUrl100", "").replace("100x100bb", "1200x1200bb")
        image = fetch(art) if art else None
        if image:
            return image, f"iTunes ({result.get('collectionViewUrl', '')})"
    return None


def from_deezer(artist, album):
    url = "https://api.deezer.com/search/album?" + urllib.parse.urlencode(
        {"q": f'artist:"{artist}" album:"{album}"'}
    )
    for result in fetch_json(url).get("data", []):
        if norm(result.get("artist", {}).get("name", "")) != norm(artist):
            continue
        if core_title(result.get("title", "")) != norm(album):
            continue
        image = fetch(result.get("cover_xl", "")) if result.get("cover_xl") else None
        if image:
            return image, f"Deezer ({result.get('link', '')})"
    return None


def has_cover(entry, existing):
    if entry.get("cover"):
        return True
    wanted = {slugify(f"{entry['artist']} {entry['album']}"), slugify(str(entry["album"]))}
    return bool(wanted & existing)


def save_jpeg(data, path):
    image = Image.open(io.BytesIO(data)).convert("RGB")
    image.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
    image.save(path, "JPEG", quality=85, optimize=True, progressive=True)
    return image.size


def main():
    albums = yaml.safe_load(DATA.read_text()) or []
    OUT.mkdir(parents=True, exist_ok=True)
    existing = {slugify(f.stem) for f in OUT.iterdir() if f.suffix.lower() in IMAGE_EXTS}

    report = []
    for entry in sorted(albums, key=lambda a: a["rank"]):
        artist, album = str(entry["artist"]), str(entry["album"])
        label = f"#{entry['rank']} {album} by {artist}"
        if has_cover(entry, existing):
            continue
        found = None
        for source in (from_itunes, from_deezer, from_cover_art_archive):
            try:
                found = source(artist, album)
            except Exception as err:  # one flaky source shouldn't stop the rest
                print(f"  {source.__name__} failed for {label}: {err}")
            if found:
                break
        if not found:
            report.append(f"- {label}: **not found**, add it by hand")
            print(f"NOT FOUND  {label}")
            continue
        data, where = found
        name = slugify(f"{artist} {album}") + ".jpg"
        size = save_jpeg(data, OUT / name)
        existing.add(slugify(f"{artist} {album}"))
        report.append(f"- {label}: `{name}` ({size[0]}×{size[1]}) from {where}")
        print(f"SAVED      {label} -> {name} ({size[0]}x{size[1]}) from {where}")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as fh:
            fh.write("## Album covers\n\n" + ("\n".join(report) if report else "Every album already has a cover.") + "\n")
    if not report:
        print("Every album already has a cover.")


if __name__ == "__main__":
    sys.exit(main())
