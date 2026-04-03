document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  if (!toggle) return;

  const controls = toggle.getAttribute('aria-controls');
  const nav = controls ? document.getElementById(controls) : null;
  const links = nav ? nav.querySelector('.nav-links') : null;
  const header = toggle.closest('.header-inner');
  if (!links || !header) return;

  const setExpanded = open => {
    if (!header.classList.contains('is-collapsible')) {
      links.classList.remove('expanded');
      toggle.setAttribute('aria-expanded', 'false');
      return;
    }

    links.classList.toggle('expanded', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  const measureNeedsCollapse = () => {
    const wasCollapsed = header.classList.contains('is-collapsible');

    if (wasCollapsed) {
      header.classList.remove('is-collapsible');
      links.classList.remove('expanded');
      toggle.setAttribute('aria-expanded', 'false');
    }

    // Force layout update so measurements use the horizontal arrangement.
    const firstLink = links.querySelector('a');
    const navHeight = links.getBoundingClientRect().height;
    const linkHeight = firstLink ? firstLink.getBoundingClientRect().height : 0;
    const needsCollapse = linkHeight > 0 && navHeight > linkHeight * 1.4;

    if (needsCollapse) {
      header.classList.add('is-collapsible');
      setExpanded(false);
    }
  };

  const handleResize = () => {
    measureNeedsCollapse();
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    setExpanded(!expanded);
  });

  window.addEventListener('resize', () => {
    handleResize();
  });

  measureNeedsCollapse();
});
