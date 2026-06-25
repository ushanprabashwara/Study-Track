function initReportsPage() {
  const courses = Storage.getCourses();
  const assignments = Storage.getAssignments();
  const total = assignments.length;
  const completed = assignments.filter(a => a.status === 'Completed').length;
  const overdue = assignments.filter(a => deadlineStatus(a) === 'overdue').length;
  const rate = total ? Math.round((completed/total)*100) : 0;

  const set = (id,v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('rCourses', courses.length);
  set('rAssignments', total);
  set('rRate', rate + '%');
  set('rOverdue', overdue);

  // Pie: status breakdown
  const pieCtx = document.getElementById('statusPie');
  if (pieCtx) {
    const themeText = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    const counts = ['Completed','In Progress','Not Started'].map(s => assignments.filter(a => a.status === s).length);
    new Chart(pieCtx, {
      type: 'pie',
      data: { labels: ['Completed','In Progress','Not Started'],
        datasets: [{ data: counts, backgroundColor: ['#16a34a','#4f46e5','#94a3b8'], borderWidth: 0 }] },
      options: { plugins: { legend: { position: 'bottom', labels: { color: themeText } } } }
    });
  }

  // Bar: assignments per course (total vs completed)
  const barCtx = document.getElementById('courseBar');
  if (barCtx) {
    const labels = courses.map(c => c.code);
    const totals = courses.map(c => assignments.filter(a => a.courseId === c.id).length);
    const dones = courses.map(c => assignments.filter(a => a.courseId === c.id && a.status === 'Completed').length);
    const themeText = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    const themeBorder = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Total', data: totals, backgroundColor: '#4f46e5' },
          { label: 'Completed', data: dones, backgroundColor: '#16a34a' }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: { ticks: { color: themeText }, grid: { color: themeBorder } },
          y: { beginAtZero: true, ticks: { precision: 0, color: themeText }, grid: { color: themeBorder } }
        },
        plugins: { legend: { position: 'bottom', labels: { color: themeText } } }
      }
    });
  }

  // Priority bar
  const prCtx = document.getElementById('priorityBar');
  if (prCtx) {
    const counts = ['High','Medium','Low'].map(p => assignments.filter(a => a.priority === p).length);
    const themeText = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    const themeBorder = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    new Chart(prCtx, {
      type: 'bar',
      data: { labels: ['High','Medium','Low'],
        datasets: [{ label: 'Assignments', data: counts, backgroundColor: ['#dc2626','#f59e0b','#16a34a'] }] },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: themeText }, grid: { color: themeBorder } },
          y: { beginAtZero: true, ticks: { precision: 0, color: themeText }, grid: { color: themeBorder } }
        }
      }
    });
  }
}