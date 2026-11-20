// Optional pilot rank + surname greeting. Everything stays in this page: no
// storage, no network, no analytics, and no path into the Phaser scene.
// Commissioned-officer titles follow the Military OneSource MC&FP style guide:
// https://styleguide.militaryonesource.mil/terms/m
// (Navy lists captain down to ensign; Space Force follows the Army system.)
const VoidLancerPilotSetup = (() => {
  const RANK_CATALOG = Object.freeze([
    Object.freeze({
      id: 'navy',
      label: 'US Navy',
      ranks: Object.freeze([
        Object.freeze({ id: 'navy-ensign', label: 'Ensign' }),
        Object.freeze({ id: 'navy-lieutenant-junior-grade', label: 'Lieutenant Junior Grade' }),
        Object.freeze({ id: 'navy-lieutenant', label: 'Lieutenant' }),
        Object.freeze({ id: 'navy-lieutenant-commander', label: 'Lieutenant Commander' }),
        Object.freeze({ id: 'navy-commander', label: 'Commander' }),
        Object.freeze({ id: 'navy-captain', label: 'Captain' }),
      ]),
    }),
    Object.freeze({
      id: 'space-force',
      label: 'US Space Force',
      ranks: Object.freeze([
        Object.freeze({ id: 'space-force-second-lieutenant', label: 'Second Lieutenant' }),
        Object.freeze({ id: 'space-force-first-lieutenant', label: 'First Lieutenant' }),
        Object.freeze({ id: 'space-force-captain', label: 'Captain' }),
        Object.freeze({ id: 'space-force-major', label: 'Major' }),
        Object.freeze({ id: 'space-force-lieutenant-colonel', label: 'Lieutenant Colonel' }),
        Object.freeze({ id: 'space-force-colonel', label: 'Colonel' }),
      ]),
    }),
  ]);

  const MAX_SURNAME_LENGTH = 40;
  const GENERIC_ADDRESS = 'Standing by, Pilot.';

  const ranksById = new Map(
    RANK_CATALOG.flatMap((branch) => branch.ranks.map((rank) => [rank.id, rank])),
  );

  function normalizeSurname(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\s+/g, ' ').trim();
  }

  // null means "keep the generic Pilot experience" until both fields are usable.
  function formatAddress(rankId, surname) {
    const rank = ranksById.get(rankId);
    const name = normalizeSurname(surname);
    if (!rank || !name || name.length > MAX_SURNAME_LENGTH) return null;
    return `Cleared for launch, ${rank.label} ${name}.`;
  }

  function init(doc) {
    const rankSelect = doc?.getElementById('pilotRank');
    const surnameInput = doc?.getElementById('pilotSurname');
    const addressLine = doc?.getElementById('pilotAddress');
    if (!rankSelect || !surnameInput || !addressLine) return null;

    function update() {
      // textContent only: a surname is never markup.
      addressLine.textContent = formatAddress(rankSelect.value, surnameInput.value) || GENERIC_ADDRESS;
    }

    rankSelect.addEventListener('change', update);
    surnameInput.addEventListener('input', update);
    update();
    return { update };
  }

  return { RANK_CATALOG, MAX_SURNAME_LENGTH, GENERIC_ADDRESS, formatAddress, normalizeSurname, init };
})();

if (typeof window !== 'undefined') {
  window.voidLancerPilotSetup = VoidLancerPilotSetup;
}

// The page markup owns the controls; this only lights them up when present.
if (typeof document !== 'undefined' && typeof document.getElementById === 'function'
  && document.getElementById('pilotSetup')) {
  VoidLancerPilotSetup.init(document);
}
