// Local Storage data layer
const STORE = {
  COURSES: 'sat_courses',
  ASSIGNMENTS: 'sat_assignments'
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const Storage = {
  // courses
  getCourses() {
    try { return JSON.parse(localStorage.getItem(STORE.COURSES)) || []; }
    catch { return []; }
  },
  saveCourses(list) { localStorage.setItem(STORE.COURSES, JSON.stringify(list)); },
  addCourse(c) {
    const list = Storage.getCourses();
    c.id = uid();
    list.push(c); Storage.saveCourses(list); return c;
  },
  updateCourse(id, patch) {
    const list = Storage.getCourses().map(c => c.id === id ? { ...c, ...patch } : c);
    Storage.saveCourses(list);
  },
  deleteCourse(id) {
    Storage.saveCourses(Storage.getCourses().filter(c => c.id !== id));
    // cascade: remove assignments for this course
    const a = Storage.getAssignments().filter(x => x.courseId !== id);
    Storage.saveAssignments(a);
  },
  getCourse(id) { return Storage.getCourses().find(c => c.id === id); },

  // assignments
  getAssignments() {
    try { return JSON.parse(localStorage.getItem(STORE.ASSIGNMENTS)) || []; }
    catch { return []; }
  },
  saveAssignments(list) { localStorage.setItem(STORE.ASSIGNMENTS, JSON.stringify(list)); },
  addAssignment(a) {
    const list = Storage.getAssignments();
    a.id = uid();
    list.push(a); Storage.saveAssignments(list); return a;
  },
  updateAssignment(id, patch) {
    const list = Storage.getAssignments().map(a => a.id === id ? { ...a, ...patch } : a);
    Storage.saveAssignments(list);
  },
  deleteAssignment(id) {
    Storage.saveAssignments(Storage.getAssignments().filter(a => a.id !== id));
  },
  getAssignment(id) { return Storage.getAssignments().find(a => a.id === id); },

  // backup / restore
  exportAll() {
    return JSON.stringify({
      courses: Storage.getCourses(),
      assignments: Storage.getAssignments(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  },
  importAll(json) {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    if (Array.isArray(data.courses)) Storage.saveCourses(data.courses);
    if (Array.isArray(data.assignments)) Storage.saveAssignments(data.assignments);
  },
  clearAll() {
    localStorage.removeItem(STORE.COURSES);
    localStorage.removeItem(STORE.ASSIGNMENTS);
  },

};

// Seed sample data once
(function seed() {
  if (localStorage.getItem('sat_seeded')) return;
  if (Storage.getCourses().length === 0) {
    const c1 = Storage.addCourse({ name: 'Web Development', code: 'CS301', semester: 'Fall 2025', lecturer: 'Dr. Anderson' });
    const c2 = Storage.addCourse({ name: 'Data Structures', code: 'CS210', semester: 'Fall 2025', lecturer: 'Prof. Khan' });
    const c3 = Storage.addCourse({ name: 'Database Systems', code: 'CS320', semester: 'Fall 2025', lecturer: 'Dr. Lee' });
    const today = new Date();
    const day = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString().slice(0,10); };
    Storage.addAssignment({ title: 'Portfolio Website', description: 'Build a responsive portfolio', courseId: c1.id, dueDate: day(2), priority: 'High', status: 'In Progress' });
    Storage.addAssignment({ title: 'Linked List Lab', description: 'Implement doubly linked list', courseId: c2.id, dueDate: day(-1), priority: 'Medium', status: 'Not Started' });
    Storage.addAssignment({ title: 'SQL Joins Quiz', description: 'Online quiz on JOINS', courseId: c3.id, dueDate: day(5), priority: 'Low', status: 'Completed' });
    Storage.addAssignment({ title: 'Final Project Proposal', description: 'Write 2-page proposal', courseId: c1.id, dueDate: day(0), priority: 'High', status: 'Not Started' });
  }
  localStorage.setItem('sat_seeded', '1');
})();