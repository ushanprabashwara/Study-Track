function initCalendarPage() {
  const el = document.getElementById('calendar');
  if (!el) return;
  const events = Storage.getAssignments().map(a => ({
    id: a.id,
    title: a.title,
    start: a.dueDate,
    allDay: true,
    backgroundColor: priorityColor(a.priority),
    borderColor: priorityColor(a.priority),
    extendedProps: { assignment: a }
  }));
  const calendar = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' },
    events,
    eventClick(info) {
      const a = info.event.extendedProps.assignment;
      const c = Storage.getCourse(a.courseId);
      document.getElementById('eventModalTitle').textContent = a.title;
      document.getElementById('eventModalBody').innerHTML = `
        <p class="mb-2"><strong>Course:</strong> ${escapeHtml(c?.name || '—')}</p>
        <p class="mb-2"><strong>Due:</strong> ${fmtDate(a.dueDate)}</p>
        <p class="mb-2"><strong>Priority:</strong> <span class="badge-priority priority-${a.priority}">${a.priority}</span></p>
        <p class="mb-2"><strong>Status:</strong> <span class="status-pill status-${a.status.replace(' ','')}">${a.status}</span></p>
        ${a.description ? `<hr><p class="mb-0">${escapeHtml(a.description)}</p>` : ''}`;
      bootstrap.Modal.getOrCreateInstance(document.getElementById('eventModal')).show();
    }
  });
  calendar.render();
}