'use strict';

// Entirely invented fixture businesses. No network, storage or CRM adapter.
const fixtures = [
  { id:'demo-p1', name:'Meadow Loop Demo', city:'Richfield Springs', zip:'13439', role:'has', material:'Clear container', specification:'Rinsed bottles & jars · sorting unverified', quantity:'8 mock tons', transport:'Pickup proposed', note:'Discuss lids, ceramics and moisture. Quantity and timing need confirmation.' },
  { id:'demo-p2', name:'Canal Glass Demo', city:'Utica', zip:'13502', role:'has', material:'Clear container', specification:'Container cullet · sample grading unverified', quantity:'12 mock tons', transport:'Delivery proposed', note:'Request a representative sample and discuss particle size. No delivery commitment.' },
  { id:'demo-p3', name:'Orchard Circular Demo', city:'Cooperstown', zip:'13326', role:'has', material:'Clear container', specification:'Mixed bottles & jars · color sorting proposed', quantity:'5 mock tons', transport:'To discuss', note:'Confirm color separation and contamination before considering a connection.' },
  { id:'demo-p4', name:'Copper Stream Demo', city:'Rome', zip:'13440', role:'has', material:'Amber container', specification:'Amber bottles · sorting unverified', quantity:'6 mock tons', transport:'Pickup proposed', note:'Amber fixture exists to test glass-type filters. All details are invented.' },
  { id:'demo-n1', name:'Riverbend Materials Demo', city:'Richfield Springs', zip:'13439', role:'needs', material:'Clear container', specification:'Container glass · clean, color-sorted preferred', quantity:'10 mock tons', transport:'To discuss', note:'Confirm accepted particle sizes, contaminants and actual demand with staff.' },
  { id:'demo-n2', name:'Valley Works Demo', city:'Utica', zip:'13502', role:'needs', material:'Clear container', specification:'Container cullet · grading to discuss', quantity:'7 mock tons', transport:'Pickup proposed', note:'Ask about sample testing, receiving arrangements and timing. No purchase commitment.' },
  { id:'demo-n3', name:'Amber Meadow Demo', city:'Rome', zip:'13440', role:'needs', material:'Amber container', specification:'Amber container glass · sample required', quantity:'4 mock tons', transport:'Delivery proposed', note:'Amber recipient fixture only; not evidence of actual demand.' },
  { id:'demo-n4', name:'Studio Pane Demo', city:'Cooperstown', zip:'13326', role:'needs', material:'Flat glass', specification:'Uncoated flat glass · dimensions to discuss', quantity:'2 mock tons', transport:'To discuss', note:'Different material family. Municipal bottle acceptance does not imply flat glass acceptance.' }
];
const sourceByDirection = { providers:fixtures[4], recipients:fixtures[0] };
let direction = 'providers';
const $ = id => document.getElementById(id);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function selectCandidates(records, mode, filters) {
  const role = mode === 'providers' ? 'has' : 'needs';
  const query = filters.query.trim().toLowerCase();
  return records.filter(record => record.role === role
    && (!filters.material || record.material === filters.material)
    && (!filters.city || record.city === filters.city)
    && (!filters.transport || record.transport === filters.transport)
    && (!query || `${record.name} ${record.zip}`.toLowerCase().includes(query)));
}
function currentFilters() {
  return {query:$('query').value,material:$('material').value,city:$('city').value,transport:$('transport').value};
}
function rolePill(record) {
  return `<span class="role-pill ${record.role === 'needs' ? 'need' : ''}">${record.role === 'has' ? 'HAS GLASS' : 'NEEDS GLASS'} · MOCK</span>`;
}
function renderSource() {
  const source = sourceByDirection[direction];
  $('source-card').innerHTML = `${rolePill(source)}<h3>${escapeHtml(source.name)}</h3><p class="location">${escapeHtml(source.city)} · NY ${source.zip}</p><div class="material-block"><span class="field-label">Glass annotation</span><strong>${source.material}</strong><p>${escapeHtml(source.specification)}</p></div><dl class="source-facts"><div><dt class="field-label">Demo quantity</dt><dd>${source.quantity}</dd></div><div><dt class="field-label">Transport</dt><dd>${source.transport}</dd></div></dl>`;
}
function renderResults() {
  const filters = currentFilters();
  const records = selectCandidates(fixtures, direction, filters);
  const source = sourceByDirection[direction];
  $('result-count').textContent = `${records.length} possible ${direction} · synthetic`;
  $('results').innerHTML = records.length ? records.map(record => {
    const reasons = [];
    if (filters.material) reasons.push('Selected glass type');
    else reasons.push('Opposite glass role');
    if (filters.city) reasons.push('Selected demo city');
    else if (record.city === source.city) reasons.push('Same city as starting business');
    if (filters.transport) reasons.push('Selected transport annotation');
    if (filters.query.trim()) reasons.push('Business / ZIP text filter');
    const materialNote = record.material === source.material ? '' : '<p>Different glass type from the starting business; included by your broader filter, not material compatibility.</p>';
    return `<article class="candidate" aria-labelledby="${record.id}-name"><div class="card-top"><div class="business-heading"><span class="monogram" aria-hidden="true">${record.name.split(' ').slice(0,2).map(word=>word[0]).join('')}</span><div><h3 id="${record.id}-name">${escapeHtml(record.name)}</h3><p class="location">${record.city} · NY ${record.zip}</p></div></div>${rolePill(record)}</div><dl class="card-facts"><div><dt class="field-label">Glass type</dt><dd>${record.material}</dd></div><div><dt class="field-label">Demo quantity</dt><dd>${record.quantity}</dd></div><div><dt class="field-label">Transport</dt><dd>${record.transport}</dd></div></dl><p class="reasons"><strong>WHY SHOWN</strong> · ${reasons.join(' · ')}</p><div class="card-bottom"><span class="staff-tag">Possible candidate · staff review required</span></div><details><summary>Review mock details</summary><div class="detail-body"><p><strong>Specification:</strong> ${escapeHtml(record.specification)}</p><p>${escapeHtml(record.note)}</p>${materialNote}<p><strong>Local reference:</strong> ${record.id} (not a CRM key). No contact or transaction is initiated.</p></div></details></article>`;
  }).join('') : '<div class="empty"><p class="eyebrow">ROOM TO LOOK AGAIN</p><h3>No synthetic candidates found</h3><p>Try a different glass type, city or business name. An empty demo result says nothing about real glass availability.</p><button id="empty-reset" type="button">Reset filters</button></div>';
  const emptyReset = $('empty-reset');
  if (emptyReset) emptyReset.addEventListener('click', () => {resetFilters();($('filters').hidden ? $('filter-toggle') : $('reset')).focus();});
  // Read-only layout diagnostic for verification; not a user-facing feature.
  requestAnimationFrame(() => {document.body.dataset.horizontalOverflow = String(document.documentElement.scrollWidth > window.innerWidth);});
}
function resetFilters() {
  HTMLFormElement.prototype.reset.call($('filters'));
  renderResults();
}
function changeDirection(next) {
  direction = next;
  for (const mode of ['providers','recipients']) $(mode).setAttribute('aria-pressed',String(mode === next));
  $('direction-hint').textContent = next === 'providers' ? 'Start with a glass need. Explore possible sources.' : 'Start with available glass. Explore possible recipients.';
  $('results-heading').textContent = `Possible ${next}`;
  resetFilters();
  renderSource();
}
if (typeof document !== 'undefined') {
  $('providers').addEventListener('click',()=>changeDirection('providers'));
  $('recipients').addEventListener('click',()=>changeDirection('recipients'));
  $('filter-toggle').addEventListener('click',()=>{
    const open = $('filters').hidden;
    $('filters').hidden = !open;
    $('filter-toggle').setAttribute('aria-expanded',String(open));
    $('filter-toggle').innerHTML = `${open ? 'Hide filters' : 'Refine lookup'} <span aria-hidden="true">${open ? '−' : '＋'}</span>`;
  });
  $('filters').addEventListener('submit',event=>event.preventDefault());
  $('query').addEventListener('input',renderResults);
  for (const id of ['material','city','transport']) $(id).addEventListener('change',renderResults);
  $('reset').addEventListener('click',resetFilters);
  window.addEventListener('resize',()=>{document.body.dataset.horizontalOverflow=String(document.documentElement.scrollWidth>window.innerWidth);});
  renderSource();renderResults();
}
if (typeof module !== 'undefined') module.exports = {fixtures,selectCandidates};
