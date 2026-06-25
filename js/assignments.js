let _aFilters = { q: '', course: '', priority: '', status: '', sort: 'due' };

function renderAssignments() {
  const courses = Storage.getCourses();
  let list = Storage.getAssignments();

  // filters
  const q = _aFilters.q.toLowerCase();
  if (q) list = list.filter(a => a.title.toLowerCase().includes(q));
  if (_aFilters.course) list = list.filter(a => a.courseId === _aFilters.course);
  if (_aFilters.priority) list = list.filter(a => a.priority === _aFilters.priority);
  if (_aFilters.status) list = list.filter(a => a.status === _aFilters.status);

  // sort
  if (_aFilters.sort === 'due') list.sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  else if (_aFilters.sort === 'priority') {
    const order = { High: 0, Medium: 1, Low: 2 };
    list.sort((a,b) => order[a.priority] - order[b.priority]);
  } else if (_aFilters.sort === 'title') list.sort((a,b) => a.title.localeCompare(b.title));

  const tbody = document.getElementById('assignmentRows');
  const empty = document.getElementById('assignmentEmpty');
  if (!list.length) {
    tbody.innerHTML = '';
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');

  tbody.innerHTML = list.map(a => {
    const c = courses.find(x => x.id === a.courseId);
    const st = deadlineStatus(a);
    const dueLabel = st === 'overdue' ? `<span class="text-danger fw-semibold">${fmtDate(a.dueDate)}</span>`
      : st === 'today' ? `<span class="text-warning fw-semibold">Today</span>`
      : st === 'tomorrow' ? `<span class="text-primary fw-semibold">Tomorrow</span>`
      : fmtDate(a.dueDate);
    return `<tr>
      <td><div class="fw-semibold">${escapeHtml(a.title)}</div><div class="small text-muted">${escapeHtml(a.description || '')}</div></td>
      <td>${escapeHtml(c?.name || '—')}</td>
      <td>${dueLabel}</td>
      <td><span class="badge-priority priority-${a.priority}">${a.priority}</span></td>
      <td><span class="status-pill status-${a.status.replace(' ','')}">${a.status}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-success me-1" data-toggle="${a.id}" title="Toggle done"><i class="bi bi-check2"></i></button>
        <button class="btn btn-sm btn-outline-secondary me-1" data-edit="${a.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-del="${a.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openAssignmentModal(b.dataset.edit)));
  tbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Delete this assignment?')) {
      Storage.deleteAssignment(b.dataset.del);
      toast('Assignment deleted', 'success');
      renderAssignments();
    }
  }));
  tbody.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
    const a = Storage.getAssignment(b.dataset.toggle);
    Storage.updateAssignment(a.id, { status: a.status === 'Completed' ? 'Not Started' : 'Completed' });
    renderAssignments();
  }));
}

function openAssignmentModal(id) {
  const modalEl = document.getElementById('assignmentModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const form = document.getElementById('assignmentForm');
  const courseSel = form.courseId;
  courseSel.innerHTML = Storage.getCourses().map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('') || '<option value="">No courses — add one first</option>';
  form.reset(); form.id.value = '';
  form.dueDate.value = todayISO();
  document.getElementById('assignmentModalTitle').textContent = id ? 'Edit Assignment' : 'New Assignment';
  if (id) {
    const a = Storage.getAssignment(id);
    if (a) {
      form.id.value = a.id;
      form.title.value = a.title;
      form.description.value = a.description || '';
      form.courseId.value = a.courseId;
      form.dueDate.value = a.dueDate;
      form.priority.value = a.priority;
      form.status.value = a.status;
    }
  }
  modal.show();
}

function exportCSV() {
  const courses = Storage.getCourses();
  const rows = [['Title','Description','Course','Due Date','Priority','Status']];
  Storage.getAssignments().forEach(a => {
    const c = courses.find(x => x.id === a.courseId);
    rows.push([a.title, a.description || '', c?.name || '', a.dueDate, a.priority, a.status]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `assignments-${todayISO()}.csv`;
  document.body.appendChild(link); link.click(); link.remove();
  URL.revokeObjectURL(url);
  toast('CSV exported', 'success');
}

function initAssignmentsPage() {
  // populate filter selects
  const courseFilter = document.getElementById('filterCourse');
  courseFilter.innerHTML = '<option value="">All Courses</option>' +
    Storage.getCourses().map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  document.getElementById('searchInput').addEventListener('input', (e) => { _aFilters.q = e.target.value; renderAssignments(); });
  courseFilter.addEventListener('change', (e) => { _aFilters.course = e.target.value; renderAssignments(); });
  document.getElementById('filterPriority').addEventListener('change', (e) => { _aFilters.priority = e.target.value; renderAssignments(); });
  document.getElementById('filterStatus').addEventListener('change', (e) => { _aFilters.status = e.target.value; renderAssignments(); });
  document.getElementById('sortBy').addEventListener('change', (e) => { _aFilters.sort = e.target.value; renderAssignments(); });

  document.getElementById('addAssignmentBtn').addEventListener('click', () => {
    if (!Storage.getCourses().length) { toast('Add a course first', 'warning'); return; }
    openAssignmentModal();
  });
  document.getElementById('exportCsvBtn').addEventListener('click', exportCSV);

  document.getElementById('assignmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const data = {
      title: f.title.value.trim(),
      description: f.description.value.trim(),
      courseId: f.courseId.value,
      dueDate: f.dueDate.value,
      priority: f.priority.value,
      status: f.status.value
    };
    if (!data.title || !data.courseId || !data.dueDate) return;
    if (f.id.value) { Storage.updateAssignment(f.id.value, data); toast('Assignment updated', 'success'); }
    else { Storage.addAssignment(data); toast('Assignment added', 'success'); }
    bootstrap.Modal.getInstance(document.getElementById('assignmentModal')).hide();
    renderAssignments();
  });

  renderAssignments();
}