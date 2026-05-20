// ── Auth guard ─────────────────────────────────────────────────────────────
const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const username = localStorage.getItem('username') || 'Scout';
document.getElementById('header-username').textContent = username;

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/login.html';
});

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  view: 'list',
  players: [],
  currentPlayer: null,
  positionFilter: '',
  editingPlayerId: null,
  editingReportId: null,
  pendingDeleteType: null,
  pendingDeleteId: null,
  pendingDeleteExtra: null,
};

const POSITIONS = [
  { key: '',     label: 'All'  },
  { key: 'CB',   label: 'CB'   },
  { key: 'FB',   label: 'FB'   },
  { key: '6ER',  label: '6er'  },
  { key: '8ER',  label: '8er'  },
  { key: 'WIDE', label: 'Wide' },
  { key: 'CF',   label: 'CF'   },
];

// ── API layer ──────────────────────────────────────────────────────────────
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

const api = {
  async getPlayers(position = '') {
    const url = position ? `/api/players?position=${encodeURIComponent(position)}` : '/api/players';
    const res = await fetch(url, { headers: authHeaders() });
    if (res.status === 401) { logout(); return []; }
    return res.json();
  },

  async getPlayer(id) {
    const res = await fetch(`/api/players/${id}`, { headers: authHeaders() });
    if (res.status === 401) { logout(); return null; }
    return res.json();
  },

  async createPlayer(data) {
    const res = await fetch('/api/players', {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json() };
  },

  async updatePlayer(id, data) {
    const res = await fetch(`/api/players/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json() };
  },

  async deletePlayer(id) {
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE', headers: authHeaders() });
    return res.ok;
  },

  async createReport(playerId, data) {
    const res = await fetch(`/api/players/${playerId}/reports`, {
      method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json() };
  },

  async updateReport(id, data) {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
    });
    return { ok: res.ok, data: await res.json() };
  },

  async deleteReport(id) {
    const res = await fetch(`/api/reports/${id}`, { method: 'DELETE', headers: authHeaders() });
    return res.ok;
  },
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = '/login.html';
}

// ── Helpers ────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function ratingText(avg) {
  if (avg === null || avg === undefined) return '<span class="no-rating">No reports yet</span>';
  return `Average rating: ${avg}`;
}

function cardBadge(card) {
  const map = { Yellow: 'badge-yellow', Red: 'badge-red', None: 'badge-none' };
  return `<span class="badge ${map[card] || 'badge-none'}">Cards: ${escapeHtml(card)}</span>`;
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Render: list view ──────────────────────────────────────────────────────
function renderListView(players) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="list-view">
      <div class="toolbar">
        <div class="position-tabs">
          ${POSITIONS.map(p => `
            <button class="tab-btn ${state.positionFilter === p.key ? 'active' : ''}"
                    data-position="${p.key}">${p.label}</button>
          `).join('')}
        </div>
        <button class="btn btn-primary" id="add-player-btn">+ Add Player</button>
      </div>

      ${players.length === 0
        ? `<div class="empty-state"><p>No players yet. Add your first scouted player!</p></div>`
        : `<div class="players-grid">
            ${players.map(p => `
              <div class="player-card">
                <div class="player-card-header">
                  <span class="position-badge">${escapeHtml(p.position)}</span>
                </div>
                <div class="player-card-body">
                  <p class="player-name">${escapeHtml(p.name)}</p>
                  <p class="player-team">${escapeHtml(p.team)}</p>
                </div>
                <div class="player-card-footer">
                  <button class="btn btn-sm btn-secondary edit-btn" data-id="${p.id}">Edit</button>
                  <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}">Delete</button>
                  <button class="btn btn-sm btn-primary details-btn" data-id="${p.id}">Details →</button>
                </div>
              </div>
            `).join('')}
           </div>`
      }
    </div>`;

  attachListEvents();
}

// ── Render: detail view ────────────────────────────────────────────────────
function renderDetailView(player) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="detail-view">
      <div class="detail-header">
        <button class="btn btn-secondary" id="back-btn">← Back</button>
        <div class="player-info">
          <span class="position-badge lg">${escapeHtml(player.position)}</span>
          <h2>${escapeHtml(player.name)}</h2>
          <p class="player-team">${escapeHtml(player.team)}</p>
          <div class="avg-rating">${ratingText(player.averageRating)}</div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-secondary" id="edit-current-btn" data-id="${player.id}">Edit Player</button>
          <button class="btn btn-primary" id="add-report-btn">+ Add Report</button>
        </div>
      </div>

      <div class="reports-section">
        <h3>Match Reports (${player.reports.length})</h3>
        ${player.reports.length === 0
          ? `<div class="empty-state"><p>No reports yet. Add a match report above.</p></div>`
          : player.reports.map(r => `
              <div class="report-card">
                <div class="report-top">
                  <span class="report-rating">Rating: ${r.rating}</span>
                  ${cardBadge(r.received_cards)}
                  <span class="report-date">${formatDate(r.created_at)}</span>
                  <button class="btn btn-sm btn-secondary report-edit-btn" data-id="${r.id}">Edit Report</button>
                  <button class="report-delete-btn" data-id="${r.id}" title="Delete report">&#10005;</button>
                </div>
                <div class="report-stats">
                  <span>Minutes: ${r.minutes_played}</span>
                  <span>Goals: ${r.goals_scored}</span>
                </div>
                ${r.comments ? `<div class="report-comments">${escapeHtml(r.comments)}</div>` : ''}
              </div>
            `).join('')
        }
      </div>
    </div>`;

  attachDetailEvents(player.id);
}

// ── Event attachment ───────────────────────────────────────────────────────
function attachListEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.positionFilter = btn.dataset.position;
      const players = await api.getPlayers(state.positionFilter);
      state.players = players;
      renderListView(players);
    });
  });

  document.getElementById('add-player-btn').addEventListener('click', () => openPlayerModal(null));

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const player = state.players.find(p => p.id === parseInt(btn.dataset.id));
      if (player) openPlayerModal(player);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openConfirmModal('player', parseInt(btn.dataset.id), 'Delete this player and all their match reports?');
    });
  });

  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => showDetailView(parseInt(btn.dataset.id)));
  });
}

function attachDetailEvents(playerId) {
  document.getElementById('back-btn').addEventListener('click', async () => {
    state.view = 'list';
    const players = await api.getPlayers(state.positionFilter);
    state.players = players;
    renderListView(players);
  });

  document.getElementById('edit-current-btn').addEventListener('click', async () => {
    const player = await api.getPlayer(playerId);
    openPlayerModal(player);
  });

  document.getElementById('add-report-btn').addEventListener('click', () => openReportModal(playerId));

  document.querySelectorAll('.report-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const report = state.currentPlayer.reports.find(r => r.id === parseInt(btn.dataset.id));
      if (report) openReportModal(playerId, report);
    });
  });

  document.querySelectorAll('.report-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openConfirmModal('report', parseInt(btn.dataset.id), 'Delete this match report?', playerId);
    });
  });
}

async function showDetailView(playerId) {
  state.view = 'detail';
  const player = await api.getPlayer(playerId);
  state.currentPlayer = player;
  renderDetailView(player);
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openPlayerModal(player) {
  state.editingPlayerId = player ? player.id : null;
  document.getElementById('modal-title').textContent = player ? 'Edit Player' : 'Add Player';
  document.getElementById('player-name').value     = player ? player.name     : '';
  document.getElementById('player-team').value     = player ? player.team     : '';
  document.getElementById('player-position').value = player ? player.position : '';
  clearErrors(['name-error', 'team-error', 'position-error']);
  document.getElementById('player-modal').classList.remove('hidden');
  document.getElementById('player-name').focus();
}

function openReportModal(playerId, report = null) {
  state.editingReportId = report ? report.id : null;
  document.getElementById('report-modal-title').textContent = report ? 'Edit Match Report' : 'Add Match Report';
  document.getElementById('report-submit-btn').textContent = report ? 'Update Report' : 'Save Report';
  document.getElementById('report-rating').value   = report ? String(report.rating) : '3';
  document.getElementById('report-minutes').value  = report ? report.minutes_played : '90';
  document.getElementById('report-goals').value    = report ? report.goals_scored : '0';
  document.getElementById('report-cards').value    = report ? report.received_cards : 'None';
  document.getElementById('report-comments').value = report ? (report.comments || '') : '';
  clearErrors(['minutes-error', 'goals-error']);
  document.getElementById('report-modal').dataset.playerId = playerId;
  document.getElementById('report-modal').classList.remove('hidden');
}

function openConfirmModal(type, id, message, extraId = null) {
  state.pendingDeleteType  = type;
  state.pendingDeleteId    = id;
  state.pendingDeleteExtra = extraId;
  document.getElementById('confirm-message').textContent = message;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function clearErrors(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}

function showErrors(errors) {
  if (errors.name)           document.getElementById('name-error').textContent     = errors.name;
  if (errors.team)           document.getElementById('team-error').textContent     = errors.team;
  if (errors.position)       document.getElementById('position-error').textContent = errors.position;
  if (errors.minutes_played) document.getElementById('minutes-error').textContent  = errors.minutes_played;
  if (errors.goals_scored)   document.getElementById('goals-error').textContent    = errors.goals_scored;
}

// ── Frontend validation ────────────────────────────────────────────────────
function validatePlayerForm(name, team, position) {
  const errors = {};
  if (!name.trim())    errors.name     = 'Name is required';
  if (!team.trim())    errors.team     = 'Team is required';
  if (!position)       errors.position = 'Please select a position';
  return errors;
}

function validateReportForm(minutes, goals) {
  const errors = {};
  if (isNaN(minutes) || minutes < 0) errors.minutes_played = 'Must be 0 or more';
  if (isNaN(goals)   || goals < 0)   errors.goals_scored   = 'Must be 0 or more';
  return errors;
}

// ── Form submissions ───────────────────────────────────────────────────────
document.getElementById('player-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('player-name').value;
  const team = document.getElementById('player-team').value;
  const position = document.getElementById('player-position').value;

  clearErrors(['name-error', 'team-error', 'position-error']);
  const frontendErrors = validatePlayerForm(name, team, position);
  if (Object.keys(frontendErrors).length > 0) { showErrors(frontendErrors); return; }

  const result = state.editingPlayerId
    ? await api.updatePlayer(state.editingPlayerId, { name, team, position })
    : await api.createPlayer({ name, team, position });

  if (!result.ok) { showErrors(result.data.errors || {}); return; }

  closeAllModals();
  if (state.view === 'detail') {
    await showDetailView(state.editingPlayerId || result.data.id);
  } else {
    const players = await api.getPlayers(state.positionFilter);
    state.players = players;
    renderListView(players);
  }
});

document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const playerId = parseInt(document.getElementById('report-modal').dataset.playerId);
  const minutes  = parseInt(document.getElementById('report-minutes').value);
  const goals    = parseInt(document.getElementById('report-goals').value);

  clearErrors(['minutes-error', 'goals-error']);
  const frontendErrors = validateReportForm(minutes, goals);
  if (Object.keys(frontendErrors).length > 0) { showErrors(frontendErrors); return; }

  const payload = {
    rating:         parseInt(document.getElementById('report-rating').value),
    minutes_played: minutes,
    goals_scored:   goals,
    received_cards: document.getElementById('report-cards').value,
    comments:       document.getElementById('report-comments').value,
  };

  const result = state.editingReportId
    ? await api.updateReport(state.editingReportId, payload)
    : await api.createReport(playerId, payload);

  if (!result.ok) { showErrors(result.data.errors || {}); return; }
  closeAllModals();
  state.editingReportId = null;
  await showDetailView(playerId);
});

document.getElementById('confirm-yes').addEventListener('click', async () => {
  if (state.pendingDeleteType === 'player') {
    await api.deletePlayer(state.pendingDeleteId);
    closeAllModals();
    state.view = 'list';
    const players = await api.getPlayers(state.positionFilter);
    state.players = players;
    renderListView(players);
  } else if (state.pendingDeleteType === 'report') {
    await api.deleteReport(state.pendingDeleteId);
    closeAllModals();
    await showDetailView(state.pendingDeleteExtra);
  }
});

document.getElementById('cancel-player').addEventListener('click',  closeAllModals);
document.getElementById('cancel-report').addEventListener('click',  closeAllModals);
document.getElementById('cancel-confirm').addEventListener('click', closeAllModals);
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => { if (e.target === modal) closeAllModals(); });
});

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  const players = await api.getPlayers();
  state.players = players;
  renderListView(players);
}

init();
