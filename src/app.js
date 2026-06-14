const categories = {
  anime: { label: 'Anime', color: '#38bdf8' },
  movies: { label: 'Movies', color: '#f59e0b' },
  shows: { label: 'Shows', color: '#a78bfa' },
  personal: { label: 'Personal', color: '#34d399' },
  work: { label: 'Work', color: '#f472b6' }
};

let events = [
  { id: crypto.randomUUID(), title: 'Kaiju No. 9 premiere', category: 'anime', date: '2026-06-18', time: '20:00', notes: 'Episode 1 release' },
  { id: crypto.randomUUID(), title: 'Arcane Cities finale', category: 'shows', date: '2026-06-21', time: '21:30', notes: 'Watch party' },
  { id: crypto.randomUUID(), title: 'Movie night: Dune', category: 'movies', date: '2026-06-23', time: '19:00', notes: 'Living room' },
  { id: crypto.randomUUID(), title: 'Team planning', category: 'work', date: '2026-06-15', time: '09:30', notes: 'Roadmap review' },
  { id: crypto.randomUUID(), title: 'Gym and groceries', category: 'personal', date: '2026-06-16', time: '18:00', notes: 'Leg day' }
];

const state = {
  visibleDate: new Date(2026, 5, 14),
  selectedDate: toKey(new Date(2026, 5, 14)),
  view: 'month',
  weekStart: 0,
  eventDaysOnly: false,
  dense: false,
  query: '',
  categoryFilters: new Set(Object.keys(categories))
};

const els = {
  grid: document.querySelector('#calendar-grid'),
  title: document.querySelector('#period-title'),
  subtitle: document.querySelector('#period-subtitle'),
  upcoming: document.querySelector('#upcoming-list'),
  selectedTitle: document.querySelector('#selected-title'),
  selectedList: document.querySelector('#selected-list'),
  eventDialog: document.querySelector('#event-dialog'),
  settingsDialog: document.querySelector('#settings-dialog'),
  eventForm: document.querySelector('#event-form'),
  repeatMode: document.querySelector('#repeat-mode'),
  repeatOptions: document.querySelector('#repeat-options'),
  repeatEnding: document.querySelector('#repeat-ending'),
  repeatCountWrap: document.querySelector('#repeat-count-wrap'),
  repeatUntilWrap: document.querySelector('#repeat-until-wrap')
};

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function monthName(date, options = { month: 'long', year: 'numeric' }) {
  return date.toLocaleDateString(undefined, options);
}

function filteredEvents() {
  const query = state.query.trim().toLowerCase();
  return events
    .filter((event) => state.categoryFilters.has(event.category))
    .filter((event) => !query || `${event.title} ${event.notes} ${categories[event.category].label}`.toLowerCase().includes(query))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

function eventsForDate(key) {
  return filteredEvents().filter((event) => event.date === key);
}

function startOfCalendarMonth(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() - state.weekStart + 7) % 7;
  return addDays(first, -offset);
}

function startOfWeek(date) {
  return addDays(date, -((date.getDay() - state.weekStart + 7) % 7));
}

function render() {
  document.body.classList.toggle('dense', state.dense);
  document.querySelectorAll('[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === state.view));
  renderCalendar();
  renderUpcoming();
  renderCategories();
  renderSelected();
}

function renderCalendar() {
  if (state.view === 'year') return renderYear();
  if (state.view === 'multi') return renderMultiMonth();
  if (state.view === 'week') return renderWeek();
  return renderMonth();
}

function renderMonth() {
  els.title.textContent = monthName(state.visibleDate);
  els.subtitle.textContent = 'Month view · click any date to select it, then add events';
  const start = startOfCalendarMonth(state.visibleDate);
  const cells = Array.from({ length: 42 }, (_, index) => addDays(start, index));
  els.grid.className = 'calendar-grid month-grid';
  els.grid.innerHTML = weekdayHeaders() + cells.map((date) => dayCell(date, date.getMonth() !== state.visibleDate.getMonth())).join('');
}

function renderWeek() {
  const start = startOfWeek(state.visibleDate);
  const cells = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  els.title.textContent = `${monthName(cells[0], { month: 'short', day: 'numeric' })} – ${monthName(cells[6], { month: 'short', day: 'numeric', year: 'numeric' })}`;
  els.subtitle.textContent = 'Week view · larger rows for detailed planning';
  els.grid.className = 'calendar-grid week-grid';
  els.grid.innerHTML = weekdayHeaders() + cells.map((date) => dayCell(date, false, true)).join('');
}

function renderMultiMonth() {
  els.title.textContent = 'Next 3 months';
  els.subtitle.textContent = 'Multi-month glance for release seasons and recurring plans';
  els.grid.className = 'calendar-grid multi-grid';
  els.grid.innerHTML = [0, 1, 2].map((offset) => miniMonth(addMonths(state.visibleDate, offset))).join('');
}

function renderYear() {
  els.title.textContent = `${state.visibleDate.getFullYear()} at a glance`;
  els.subtitle.textContent = 'Year view · dots show days with matching events';
  els.grid.className = 'calendar-grid year-grid';
  els.grid.innerHTML = Array.from({ length: 12 }, (_, month) => miniMonth(new Date(state.visibleDate.getFullYear(), month, 1))).join('');
}

function weekdayHeaders() {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return Array.from({ length: 7 }, (_, index) => `<div class="weekday">${names[(state.weekStart + index) % 7]}</div>`).join('');
}

function dayCell(date, muted = false, large = false) {
  const key = toKey(date);
  const dayEvents = eventsForDate(key);
  if (state.eventDaysOnly && dayEvents.length === 0) return `<button class="day empty ${muted ? 'muted-day' : ''}" data-date="${key}" type="button"></button>`;
  return `<button class="day ${muted ? 'muted-day' : ''} ${large ? 'large' : ''} ${key === state.selectedDate ? 'selected' : ''}" data-date="${key}" type="button">
    <span class="day-number">${date.getDate()}</span>
    <span class="day-events">${dayEvents.slice(0, large ? 8 : 4).map(eventPill).join('')}</span>
    ${dayEvents.length > (large ? 8 : 4) ? `<span class="more-pill">+${dayEvents.length - (large ? 8 : 4)} more</span>` : ''}
  </button>`;
}

function eventPill(event) {
  const category = categories[event.category];
  return `<span class="event-pill" style="--event-color:${category.color}">${event.time ? `${event.time} · ` : ''}${event.title}</span>`;
}

function miniMonth(date) {
  const start = startOfCalendarMonth(date);
  const cells = Array.from({ length: 42 }, (_, index) => addDays(start, index));
  return `<section class="mini-month"><h3>${monthName(date)}</h3><div class="mini-weekdays">${weekdayHeaders()}</div><div class="mini-days">${cells.map((cell) => {
    const key = toKey(cell);
    const hasEvents = eventsForDate(key).length > 0;
    return `<button class="mini-day ${cell.getMonth() !== date.getMonth() ? 'muted-day' : ''} ${hasEvents ? 'has-events' : ''}" data-date="${key}" type="button">${cell.getDate()}</button>`;
  }).join('')}</div></section>`;
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function renderUpcoming() {
  const list = filteredEvents().filter((event) => event.date >= toKey(addDays(new Date(), -1))).slice(0, 10);
  els.upcoming.innerHTML = list.length ? list.map(eventRow).join('') : '<p class="muted">No matching upcoming events.</p>';
}

function renderSelected() {
  const selected = fromKey(state.selectedDate);
  els.selectedTitle.textContent = selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const list = eventsForDate(state.selectedDate);
  els.selectedList.innerHTML = list.length ? list.map(eventRow).join('') : '<p class="muted">Nothing scheduled yet. Add an episode, movie, personal reminder, or work item.</p>';
}

function renderCategories() {
  document.querySelector('#category-filters').innerHTML = Object.entries(categories).map(([key, category]) => `
    <label class="category-toggle" style="--event-color:${category.color}">
      <input type="checkbox" value="${key}" ${state.categoryFilters.has(key) ? 'checked' : ''} />
      <span>${category.label}</span>
    </label>`).join('');
}

function eventRow(event) {
  const category = categories[event.category];
  return `<article class="event-row" style="--event-color:${category.color}">
    <div><strong>${event.title}</strong><p>${event.date}${event.time ? ` · ${event.time}` : ''} · ${category.label}</p></div>
    <span>${category.label}</span>
  </article>`;
}

function openEventDialog(date = state.selectedDate) {
  document.querySelector('#event-date').value = date;
  document.querySelector('#event-title').value = '';
  document.querySelector('#event-time').value = '';
  document.querySelector('#event-notes').value = '';
  els.repeatMode.value = 'once';
  updateRepeatVisibility();
  els.eventDialog.showModal();
}

function saveEvent(event) {
  event.preventDefault();
  const base = {
    title: document.querySelector('#event-title').value.trim(),
    category: document.querySelector('#event-category').value,
    date: document.querySelector('#event-date').value,
    time: document.querySelector('#event-time').value,
    notes: document.querySelector('#event-notes').value.trim()
  };
  const repeat = els.repeatMode.value;
  const created = buildOccurrences(base, repeat);
  events = [...events, ...created];
  state.selectedDate = base.date;
  state.visibleDate = fromKey(base.date);
  els.eventDialog.close();
  render();
}

function buildOccurrences(base, repeat) {
  const step = repeat === 'weekly' ? 7 : 1;
  if (repeat === 'once') return [{ ...base, id: crypto.randomUUID() }];
  if (els.repeatEnding.value === 'until') {
    const until = document.querySelector('#repeat-until').value || base.date;
    const occurrences = [];
    for (let date = fromKey(base.date); toKey(date) <= until; date = addDays(date, step)) {
      occurrences.push({ ...base, id: crypto.randomUUID(), date: toKey(date) });
    }
    return occurrences;
  }
  const count = Number(document.querySelector('#repeat-count').value || 1);
  return Array.from({ length: count }, (_, index) => ({ ...base, id: crypto.randomUUID(), date: toKey(addDays(fromKey(base.date), index * step)) }));
}

function updateRepeatVisibility() {
  const repeating = els.repeatMode.value !== 'once';
  els.repeatOptions.classList.toggle('hidden', !repeating);
  els.repeatCountWrap.classList.toggle('hidden', els.repeatEnding.value !== 'count');
  els.repeatUntilWrap.classList.toggle('hidden', els.repeatEnding.value !== 'until');
}

function bindEvents() {
  document.querySelector('#event-category').innerHTML = Object.entries(categories).map(([key, category]) => `<option value="${key}">${category.label}</option>`).join('');
  document.querySelector('#add-event').addEventListener('click', () => openEventDialog());
  document.querySelector('#add-selected').addEventListener('click', () => openEventDialog(state.selectedDate));
  document.querySelector('#open-settings').addEventListener('click', () => els.settingsDialog.showModal());
  document.querySelector('#prev-period').addEventListener('click', () => navigate(-1));
  document.querySelector('#next-period').addEventListener('click', () => navigate(1));
  document.querySelector('#search-input').addEventListener('input', (event) => { state.query = event.target.value; render(); });
  document.querySelector('#event-days-only').addEventListener('change', (event) => { state.eventDaysOnly = event.target.checked; render(); });
  document.querySelector('#week-start').addEventListener('change', (event) => { state.weekStart = Number(event.target.value); render(); });
  document.querySelector('#dense-mode').addEventListener('change', (event) => { state.dense = event.target.checked; render(); });
  document.querySelector('#accent-select').addEventListener('change', (event) => document.documentElement.style.setProperty('--accent', event.target.value));
  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
  els.eventForm.addEventListener('submit', saveEvent);
  els.repeatMode.addEventListener('change', updateRepeatVisibility);
  els.repeatEnding.addEventListener('change', updateRepeatVisibility);
  document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => { state.view = button.dataset.view; render(); }));
  document.addEventListener('click', (event) => {
    const dateButton = event.target.closest('[data-date]');
    if (!dateButton) return;
    state.selectedDate = dateButton.dataset.date;
    state.visibleDate = fromKey(state.selectedDate);
    render();
  });
  document.querySelector('#category-filters').addEventListener('change', (event) => {
    const key = event.target.value;
    event.target.checked ? state.categoryFilters.add(key) : state.categoryFilters.delete(key);
    render();
  });
}

function navigate(direction) {
  if (state.view === 'week') state.visibleDate = addDays(state.visibleDate, direction * 7);
  else if (state.view === 'year') state.visibleDate = new Date(state.visibleDate.getFullYear() + direction, 0, 1);
  else state.visibleDate = addMonths(state.visibleDate, direction * (state.view === 'multi' ? 3 : 1));
  state.selectedDate = toKey(state.visibleDate);
  render();
}

bindEvents();
render();
