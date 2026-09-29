// Header navigation: the mobile menu button and The Person dropdown.
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;

  var navToggle = header.querySelector('.nav-toggle');
  var menus = Array.prototype.slice.call(header.querySelectorAll('.has-menu'));

  function setNavOpen(open) {
    header.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  }

  function setMenuOpen(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.menu-toggle').setAttribute('aria-expanded', String(open));
  }

  function closeMenus(except) {
    menus.forEach(function (item) { if (item !== except) setMenuOpen(item, false); });
  }

  navToggle.addEventListener('click', function () {
    setNavOpen(!header.classList.contains('nav-open'));
  });

  menus.forEach(function (item) {
    var button = item.querySelector('.menu-toggle');
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = !item.classList.contains('is-open');
      closeMenus(item);
      setMenuOpen(item, open);
    });
    // Close when keyboard focus moves out of the menu.
    item.addEventListener('focusout', function (event) {
      if (event.relatedTarget && !item.contains(event.relatedTarget)) setMenuOpen(item, false);
    });
  });

  document.addEventListener('click', function (event) {
    if (!header.contains(event.target)) {
      closeMenus();
      setNavOpen(false);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var openItem = menus.filter(function (item) { return item.classList.contains('is-open'); })[0];
    closeMenus();
    if (header.classList.contains('nav-open')) {
      setNavOpen(false);
      navToggle.focus();
    } else if (openItem) {
      openItem.querySelector('.menu-toggle').focus();
    }
  });
})();
