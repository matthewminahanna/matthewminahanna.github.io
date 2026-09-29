// 100 Metal Albums: slides each album's cover in behind its write-up as
// you scroll. Every .album section has a matching .stage-layer. While a
// section scrolls into view, its layer rises from the bottom of the
// screen and covers the previous one, which sinks back and dims.
(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll('.album'));
  var layers = Array.prototype.slice.call(document.querySelectorAll('.stage-layer'));
  var index = document.querySelector('.albums-index');
  var hud = document.querySelector('.albums-hud');
  var n = sections.length;
  if (!n || layers.length !== n) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tops = [];
  var indexTop = Infinity;
  var vh = window.innerHeight;
  var applied = [];
  var preloaded = [];
  var shown = null;
  var ticking = false;

  var hudRank = hud.querySelector('.hud-rank');
  var hudTitle = hud.querySelector('.hud-title');
  var hudBar = hud.querySelector('.hud-bar span');

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  function scrollTop() { return window.pageYOffset || document.documentElement.scrollTop; }

  function measure() {
    vh = window.innerHeight;
    sections.forEach(function (s) {
      var text = s.querySelector('.album-text');
      s.classList.toggle('is-tall', text.offsetHeight > vh - 160);
    });
    var y = scrollTop();
    tops = sections.map(function (s) { return s.getBoundingClientRect().top + y; });
    indexTop = index ? index.getBoundingClientRect().top + y : Infinity;
    applied = [];
    update();
  }

  // Load a layer's cover (and warm the cache for the next few).
  function preload(i) {
    if (i < 0 || i >= n || preloaded[i]) return;
    preloaded[i] = true;
    var url = layers[i].getAttribute('data-cover');
    if (!url) return;
    var abs = new URL(url, location.href).href;
    var img = new Image();
    img.decoding = 'async';
    img.src = abs;
    var bg = 'url("' + abs.replace(/"/g, '%22') + '")';
    layers[i].querySelector('.stage-art').style.backgroundImage = bg;
    layers[i].querySelector('.stage-ambient').style.backgroundImage = bg;
  }

  // offset: 0 = in place, 1 = fully below the screen.
  function apply(i, active, offset, sink) {
    var key = active ? offset.toFixed(4) + '|' + sink.toFixed(4) : 'off';
    if (applied[i] === key) return;
    applied[i] = key;

    var layer = layers[i];
    if (!active) {
      layer.classList.remove('is-active');
      return;
    }
    layer.classList.add('is-active');
    if (reduceMotion.matches) {
      layer.style.transform = 'none';
      layer.style.opacity = String(1 - offset);
    } else {
      layer.style.opacity = '';
      layer.style.transform =
        'translate3d(0,' + (offset * 100).toFixed(3) + '%,0) scale(' + (1 - 0.06 * sink).toFixed(4) + ')';
    }
    layer.lastElementChild.style.opacity = (0.6 * sink).toFixed(3);
  }

  function update() {
    ticking = false;
    var y = scrollTop();

    // e = the last album whose section has started to enter the screen.
    var e = -1;
    for (var i = 0; i < n; i++) {
      if (tops[i] - y < vh) e = i;
      else break;
    }
    var p = e >= 0 ? clamp(1 - (tops[e] - y) / vh, 0, 1) : 0;

    for (var j = 0; j < n; j++) {
      if (j === e) apply(j, true, 1 - p, 0);
      else if (j === e - 1) apply(j, true, 0, p);
      else apply(j, false);
    }
    for (var k = e - 1; k <= e + 3; k++) preload(k);

    var now = e < 0 ? -1 : (p >= 0.5 ? e : e - 1);
    var inIndex = indexTop - y < vh * 0.6;
    setHud(now, now >= 0 && !inIndex);
  }

  function setHud(i, visible) {
    hud.classList.toggle('is-shown', visible);
    if (i === shown || i < 0) return;
    shown = i;
    var s = sections[i];
    hudRank.textContent = 'No. ' + s.getAttribute('data-rank');
    hudTitle.textContent = s.getAttribute('data-title');
    hudBar.style.transform = 'scaleX(' + ((i + 1) / n).toFixed(4) + ')';
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  // Previous / next buttons land just past the point where the cover has
  // finished sliding in (the same spot the #no-42 links land on).
  function go(step) {
    var from = shown === null ? -1 : shown;
    var target = from + step;
    var top;
    if (target < 0) top = 0;
    else if (target >= n) top = indexTop - parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop || 0);
    else top = tops[target] + vh * 0.1;
    window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }

  Array.prototype.forEach.call(hud.querySelectorAll('[data-step]'), function (button) {
    button.addEventListener('click', function () { go(Number(button.getAttribute('data-step'))); });
  });

  hud.hidden = false;
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.querySelector('.albums'));
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', measure);
  measure();
})();
