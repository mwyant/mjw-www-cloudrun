(function () {
  const storageKey = 'warrenThemeSettings';
  const orderKey = 'warrenSectionOrder';

  const safeJsonParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  const saved = safeJsonParse(localStorage.getItem(storageKey) || 'null');
  if (saved && saved.vars && typeof saved.vars === 'object') {
    Object.entries(saved.vars).forEach(([name, value]) => {
      if (typeof value === 'string') {
        document.documentElement.style.setProperty(name, value);
      }
    });
  }

  if (saved && typeof saved.shadowsOff === 'boolean') {
    document.documentElement.classList.toggle('theme-shadows-off', saved.shadowsOff);
  }

  // Optional: apply section order on pages that use data-section (primarily index).
  const savedOrder = safeJsonParse(localStorage.getItem(orderKey) || 'null');
  if (Array.isArray(savedOrder) && savedOrder.length) {
    document.addEventListener('DOMContentLoaded', () => {
      const main = document.querySelector('main');
      if (!main) return;
      savedOrder.forEach((sectionId) => {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (section) main.appendChild(section);
      });
    });
  }
})();
