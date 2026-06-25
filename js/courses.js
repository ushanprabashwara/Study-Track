function renderCourses() {
  const list = Storage.getCourses();
  const assignments = Storage.getAssignments();
  const tbody = document.getElementById('courseRows');
  const empty = document.getElementById('courseEmpty');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = '';
    empty.classList.remove('d-none');
    return;
  }
  empty.classList.add('d-none');
  tbody.innerHTML = list.map(c => {
    const total = assignments.filter(a => a.courseId === c.id).length;
    const done = assignments.filter(a => a.courseId === c.id && a.status === 'Completed').length;
    const pct = total ? Math.round(done/total*100) : 0;
    return `<tr>
      <td><div class="fw-semibold">${escapeHtml(c.name)}</div><div class="small text-muted">${escapeHtml(c.code)}</div></td>
      <td>${escapeHtml(c.semester)}</td>
      <td>${escapeHtml(c.lecturer)}</td>
      <td style="min-width:160px">
        <div class="d-flex align-items-center gap-2">
          <div class="progress flex-grow-1"><div class="progress-bar" style="width:${pct}%"></div></div>
          <small class="text-muted">${done}/${total}</small>
        </div>
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary me-1" data-edit="${c.id}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-del="${c.id}"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openCourseModal(b.dataset.edit)));
  tbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    if (confirm('Delete this course and its assignments?')) {
      Storage.deleteCourse(b.dataset.del);
      toast('Course deleted', 'success');
      renderCourses();
    }
  }));
}

function openCourseModal(id) {
  const modalEl = document.getElementById('courseModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  const form = document.getElementById('courseForm');
  form.reset();
  form.id.value = '';
  document.getElementById('courseModalTitle').textContent = id ? 'Edit Course' : 'New Course';
  if (id) {
    const c = Storage.getCourse(id);
    if (c) {
      form.id.value = c.id;
      form.name.value = c.name;
      form.code.value = c.code;
      form.semester.value = c.semester;
      form.lecturer.value = c.lecturer;
    }
  }
  modal.show();
}

function initCoursesPage() {
  document.getElementById('addCourseBtn').addEventListener('click', () => openCourseModal());
  document.getElementById('courseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const data = {
      name: f.name.value.trim(),
      code: f.code.value.trim(),
      semester: f.semester.value.trim(),
      lecturer: f.lecturer.value.trim()
    };
    if (!data.name || !data.code) return;
    if (f.id.value) { Storage.updateCourse(f.id.value, data); toast('Course updated', 'success'); }
    else { Storage.addCourse(data); toast('Course added', 'success'); }
    bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
    renderCourses();
  });
  renderCourses();
}