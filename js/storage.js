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

// No automatic sample data is seeded for new visitors.
// Users start with an empty tracker unless they add their own courses and assignments.