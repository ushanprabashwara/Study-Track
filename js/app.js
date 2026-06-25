// Shared layout, theme, toasts, helpers

const NAV_ITEMS = [
  { href: 'dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
  { href: 'courses.html', icon: 'bi-journal-bookmark', label: 'Courses' },
  { href: 'assignments.html', icon: 'bi-list-check', label: 'Assignments' },
  { href: 'calendar.html', icon: 'bi-calendar3', label: 'Calendar' },
  { href: 'reports.html', icon: 'bi-bar-chart', label: 'Reports' },
  { href: 'about.html', icon: 'bi-info-circle', label: 'About' },
  { href: 'http://ushanprabashwara.github.io/My-Portfolio/', icon: 'bi-briefcase', label: 'UP. - Portfolio', dark: true, target: '_blank' }
];

function currentPage() {
  const path = location.pathname.split('/').pop() || 'dashboard.html';
  return path;
}

function renderLayout(title) {
  const page = currentPage();
  const navHtml = NAV_ITEMS.map(n => `
    <a class="nav-link ${n.href === page ? 'active' : ''} ${n.dark ? 'nav-link-dark' : ''}" href="${n.href}" ${n.target ? `target="${n.target}" rel="noopener noreferrer"` : ''}>
      <i class="bi ${n.icon}"></i><span>${n.label}</span>
    </a>`).join('');

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="brand">
        <i class="bi bi-mortarboard-fill"></i>
        <span>StudyTrack</span>
      </div>
      <nav>${navHtml}</nav>
      <div class="sidebar-footer">© 2026 Ushan Prabashwara. All rights reserved.</div>`;
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    topbar.innerHTML = `
      <button class="btn-icon menu-toggle" id="menuToggle" aria-label="Toggle menu"><i class="bi bi-list"></i></button>
      <h1>${title || ''}</h1>
      <div class="spacer"></div>
      <div class="dropdown">
        <button class="btn-icon" data-bs-toggle="dropdown" aria-label="Backup menu"><i class="bi bi-three-dots-vertical"></i></button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#" id="exportBackup"><i class="bi bi-download me-2"></i>Backup data</a></li>
          <li><a class="dropdown-item" href="#" id="importBackup"><i class="bi bi-upload me-2"></i>Restore data</a></li>
          <li><a class="dropdown-item text-danger" href="#" id="clearData"><i class="bi bi-trash me-2"></i>Clear all data</a></li>
        </ul>
      </div>
      <input type="file" id="importFile" accept="application/json" hidden>
    `;
  }

  initMobileSidebar();
  initBackupMenu();
}

function initMobileSidebar() {
  const btn = document.getElementById('menuToggle');
  const side = document.getElementById('sidebar');
  if (!btn || !side) return;
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }
  const close = () => { side.classList.remove('open'); backdrop.classList.remove('show'); };
  btn.addEventListener('click', () => { side.classList.toggle('open'); backdrop.classList.toggle('show'); });
  backdrop.addEventListener('click', close);
  side.querySelectorAll('a.nav-link').forEach(a => a.addEventListener('click', close));
}

function initBackupMenu() {
  const exp = document.getElementById('exportBackup');
  const imp = document.getElementById('importBackup');
  const clr = document.getElementById('clearData');
  const file = document.getElementById('importFile');
  if (exp) exp.addEventListener('click', (e) => {
    e.preventDefault();
    const blob = new Blob([Storage.exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `studytrack-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('Backup downloaded', 'success');
  });
  if (imp) imp.addEventListener('click', (e) => { e.preventDefault(); file.click(); });
  if (file) file.addEventListener('change', async () => {
    const f = file.files[0]; if (!f) return;
    try {
      const txt = await f.text();
      Storage.importAll(txt);
      toast('Data restored. Reloading…', 'success');
      setTimeout(() => location.reload(), 800);
    } catch (err) { toast('Invalid backup file', 'danger'); }
  });
  if (clr) clr.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Delete all courses and assignments?')) {
      Storage.clearAll();
      toast('All data cleared', 'success');
      setTimeout(() => location.reload(), 700);
    }
  });
}

// Toast
function toast(message, variant = 'primary') {
  let host = document.getElementById('toastHost');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-container position-fixed top-0 end-0 p-3';
    host.style.zIndex = 1080;
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${variant} border-0 fade-in`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  host.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2800 });
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

// Helpers
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
function todayISO() { return new Date().toISOString().slice(0,10); }
function daysUntil(iso) {
  const a = new Date(iso + 'T00:00:00');
  const b = new Date(todayISO() + 'T00:00:00');
  return Math.round((a - b) / 86400000);
}
function deadlineStatus(a) {
  if (a.status === 'Completed') return 'done';
  const d = daysUntil(a.dueDate);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d <= 7) return 'upcoming';
  return 'future';
}
function priorityColor(p) {
  return p === 'High' ? '#dc2626' : p === 'Medium' ? '#f59e0b' : '#16a34a';
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Dashboard rendering
const WELCOME_QUOTES = [
  'Every day is a fresh start — make today meaningful.',
  'Small progress is still progress. Keep going!',
  'Your future is created by what you do today, not tomorrow.',
  'Great work starts with good habits and a positive mindset.',
  'Focus on progress, not perfection. You are doing great.'
];

function renderDashboard() {
  const courses = Storage.getCourses();
  const assignments = Storage.getAssignments();
  const total = assignments.length;
  const completed = assignments.filter(a => a.status === 'Completed').length;
  const pending = assignments.filter(a => a.status !== 'Completed').length;
  const overdue = assignments.filter(a => deadlineStatus(a) === 'overdue').length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('statCourses', courses.length);
  set('statAssignments', total);
  set('statCompleted', completed);
  set('statPending', pending);
  set('statOverdue', overdue);
  set('statProgress', progress + '%');

  const bar = document.getElementById('progressBar');
  if (bar) { bar.style.width = progress + '%'; bar.setAttribute('aria-valuenow', progress); }

  // Pie chart
  const ctx = document.getElementById('completionChart');
  if (ctx && window.Chart) {
    if (window._pie) window._pie.destroy();
    const themeText = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    window._pie = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Pending'],
        datasets: [{ data: [completed, pending], backgroundColor: ['#16a34a', '#f59e0b'], borderWidth: 0 }]
      },
      options: {
        plugins: { legend: { position: 'bottom', labels: { color: themeText } } },
        cutout: '65%'
      }
    });
  }

  // Alerts
  const host = document.getElementById('alerts');
  if (host) {
    const groups = [
      { key: 'overdue', label: 'Overdue', cls: 'bg-danger-soft', icon: 'bi-exclamation-octagon-fill' },
      { key: 'today', label: 'Due Today', cls: 'bg-warning-soft', icon: 'bi-alarm-fill' },
      { key: 'tomorrow', label: 'Due Tomorrow', cls: 'bg-brand-soft', icon: 'bi-clock-history' },
      { key: 'upcoming', label: 'Upcoming (7 days)', cls: 'bg-success-soft', icon: 'bi-calendar-event' }
    ];
    const html = groups.map(g => {
      const items = assignments.filter(a => deadlineStatus(a) === g.key);
      if (!items.length) return '';
      const list = items.slice(0,3).map(a => `<div class="small text-muted">• ${escapeHtml(a.title)} <span class="ms-1">(${fmtDate(a.dueDate)})</span></div>`).join('');
      return `<div class="alert-card">
        <div class="ico ${g.cls}"><i class="bi ${g.icon}"></i></div>
        <div class="flex-grow-1">
          <div class="fw-semibold">${g.label} <span class="badge bg-secondary ms-1">${items.length}</span></div>
          ${list}
        </div>
      </div>`;
    }).join('') || '<div class="text-muted">No deadline alerts. You\'re all caught up!</div>';
    host.innerHTML = html;
  }

  // Recent assignments
  const tbody = document.getElementById('recentRows');
  if (tbody) {
    const sorted = [...assignments].sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
    tbody.innerHTML = sorted.length ? sorted.map(a => {
      const c = Storage.getCourse(a.courseId);
      return `<tr>
        <td><div class="fw-semibold">${escapeHtml(a.title)}</div><div class="small text-muted">${escapeHtml(c?.name || '—')}</div></td>
        <td>${fmtDate(a.dueDate)}</td>
        <td><span class="badge-priority priority-${a.priority}">${a.priority}</span></td>
        <td><span class="status-pill status-${a.status.replace(' ','')}">${a.status}</span></td>
      </tr>`;
    }).join('') : `<tr><td colspan="4" class="text-center text-muted py-3">No assignments yet.</td></tr>`;
  }
  renderWelcomeQuote();
}

function renderWelcomeQuote() {
  const quoteEl = document.getElementById('welcomeQuote');
  if (!quoteEl) return;
  quoteEl.textContent = WELCOME_QUOTES[Math.floor(Math.random() * WELCOME_QUOTES.length)];
} 