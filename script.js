// script.js (short + fixed)

const LS = {
  get: (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

let students = [];
let enrollmentQueue = [];
let actionHistory = [];

function seed() {
  const hasStudents = LS.get("students", []).length > 0;
  if (!hasStudents) {
    LS.set("students", [
      { id: "2023-001", name: "Ana Santos", course: "BSCS 2nd Year", grades: [92.1, 89.5, 94.0] },
      { id: "2023-002", name: "Juan Dela Cruz", course: "BSIT 3rd Year", grades: [85.0, 88.0, 90.0] },
      { id: "2023-003", name: "Maria Reyes", course: "BSCS 2nd Year", grades: [96.2, 94.5, 95.0] },
      { id: "2023-004", name: "Pedro Dizon", course: "BSIT 2nd Year", grades: [78.0, 82.0, 80.0] },
      { id: "2023-005", name: "Carla Lopez", course: "BSCS 3rd Year", grades: [91.0, 93.0, 92.5] },
    ]);
    LS.set("enrollmentQueue", [
      { name: "Dela Cruz, Juan" },
      { name: "Santos, Ana" },
      { name: "Reyes, Mark" },
      { name: "Dizon, Carla" },
    ]);
  }
}

function loadState() {
  students = LS.get("students", []);
  enrollmentQueue = LS.get("enrollmentQueue", []);
}

function saveState() {
  LS.set("students", students);
  LS.set("enrollmentQueue", enrollmentQueue);
}

const avg = (g = []) =>
  g.length ? (g.reduce((s, x) => s + Number(x || 0), 0) / g.length).toFixed(2) : "0.00";

function $(sel) { return document.querySelector(sel); }
function val(sel) { return ($(sel)?.value || "").trim(); }

function updateDashboard() {
  const totalEl = $("#dashboard .stat-card:nth-child(1) .stat-value");
  const queueEl = $("#dashboard .stat-card:nth-child(2) .stat-value");
  const lastEl  = $("#dashboard .stat-card:nth-child(3) .stat-value");

  if (totalEl) totalEl.textContent = students.length;
  if (queueEl) queueEl.textContent = enrollmentQueue.length;

  if (lastEl) {
    const last = actionHistory[actionHistory.length - 1];
    const map = {
      add: "Added Record", edit: "Edited Record", delete: "Deleted Record",
      queue_add: "Added to Queue", queue_process: "Processed Queue", sort: "Sorted Grades",
    };
    lastEl.textContent = last ? (map[last.type] || "Action") : "-";
  }

  updateUndoDisplay();
}

function updateQueueDisplay() {
  const ta = $("#queue textarea");
  if (!ta) return;
  ta.value = enrollmentQueue.length
    ? enrollmentQueue.map((q, i) => `${i + 1}. ${q.name}`).join("\n")
    : "Queue is empty.";
  updateDashboard();
}

function updateUndoDisplay() {
  const ta = $("#undo textarea");
  const btn = $("#undo button");
  if (!ta || !btn) return;

  if (!actionHistory.length) {
    ta.value = "No actions to undo.";
    btn.disabled = true;
    return;
  }

  const a = actionHistory[actionHistory.length - 1];
  ta.value =
    a.type === "add" ? `Added: ${a.studentData.name} (${a.studentData.id})` :
    a.type === "edit" ? `Edited: ${a.studentId}` :
    a.type === "delete" ? `Deleted: ${a.studentName}` :
    a.type === "queue_add" ? `Queue add: ${a.studentName}` :
    a.type === "queue_process" ? `Queue process: ${a.studentName}` :
    a.type === "sort" ? `Sorted (${a.algorithm})` :
    "Last Action";
  btn.disabled = false;
}

// -------- Actions --------

function handleLogin(e) {
  e.preventDefault();
  const u = val('#login input[type="text"]');
  const p = val('#login input[type="password"]');
  if (!u || !p) return alert("Please enter username and password.");

  alert("Login successful! Welcome to Smart Student Record System.");
  seed(); loadState();
  $("#login").style.display = "none";
  updateQueueDisplay(); updateDashboard();
}

function handleAddEditStudent(e) {
  e.preventDefault();
  const form = e.target;

  const id = form.querySelector('input[placeholder*="Student ID"]')?.value.trim();
  const name = form.querySelector('input[placeholder*="Student Name"]')?.value.trim();
  const course = form.querySelector('input[placeholder*="Course"]')?.value.trim();
  const gradesStr = form.querySelector('input[placeholder*="Grades"]')?.value.trim() || "";

  if (!id || !name || !course) return alert("Please fill in ID, Name, Course.");

  const grades = gradesStr
    ? gradesStr.split(",").map(x => parseFloat(x.trim())).filter(n => !isNaN(n))
    : [];

  const i = students.findIndex(s => s.id === id);
  if (i >= 0) {
    const prev = structuredClone(students[i]);
    students[i] = { ...students[i], id, name, course, grades: grades.length ? grades : students[i].grades };
    actionHistory.push({ type: "edit", studentId: id, previousData: prev, newData: structuredClone(students[i]) });
    alert(`Student ${name} updated!`);
  } else {
    const s = { id, name, course, grades };
    students.push(s);
    actionHistory.push({ type: "add", studentData: structuredClone(s) });
    alert(`Student ${name} added!`);
  }

  saveState();
  form.reset();
  updateDashboard();
}

function handleSort(e) {
  e.preventDefault();
  const algo = $("#sort select")?.value || "Default";
  const asc = ($("#sort input[type='radio']:checked")?.value || "asc") === "asc";

  const all = [...new Set(students.flatMap(s => s.grades || []))];
  const out = $("#sort textarea");
  if (!out) return;

  if (!all.length) return (out.value = "No grades to sort. Add students with grades first.");

  const sorters = {
    "Bubble Sort": bubbleSort,
    "Selection Sort": selectionSort,
    "Insertion Sort": insertionSort,
  };
  const fn = sorters[algo] || ((a, asc) => a.sort((x, y) => (asc ? x - y : y - x)));
  const sorted = fn([...all], asc);

  out.value = sorted.join(", ");
  actionHistory.push({ type: "sort", algorithm: algo, original: all, sorted });
  updateDashboard();
}

function bubbleSort(arr, asc) {
  for (let i = 0; i < arr.length - 1; i++)
    for (let j = 0; j < arr.length - i - 1; j++)
      if ((asc && arr[j] > arr[j + 1]) || (!asc && arr[j] < arr[j + 1]))
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
  return arr;
}
function selectionSort(arr, asc) {
  for (let i = 0; i < arr.length - 1; i++) {
    let k = i;
    for (let j = i + 1; j < arr.length; j++)
      if ((asc && arr[j] < arr[k]) || (!asc && arr[j] > arr[k])) k = j;
    [arr[i], arr[k]] = [arr[k], arr[i]];
  }
  return arr;
}
function insertionSort(arr, asc) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && ((asc && arr[j] > key) || (!asc && arr[j] < key))) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

function handleSearch(e) {
  e.preventDefault();
  const term = val('#search input[type="text"]').toLowerCase();
  if (!term) return alert("Please enter a search term.");

  const by = ($("#search input[type='radio']:checked")?.value || "Name").toLowerCase(); // set radio values to "Name"/"ID"
  const list = [...students].sort((a, b) =>
    (by === "name" ? a.name.localeCompare(b.name) : a.id.localeCompare(b.id))
  );

  // binary search exact match
  let l = 0, r = list.length - 1, found = null;
  while (l <= r) {
    const m = (l + r) >> 1;
    const v = (by === "name" ? list[m].name : list[m].id).toLowerCase();
    if (v === term) { found = list[m]; break; }
    v < term ? (l = m + 1) : (r = m - 1);
  }
  // fallback partial
  if (!found) found = students.find(s => (by === "name" ? s.name : s.id).toLowerCase().includes(term));

  const ta = $("#search textarea");
  if (!ta) return;

  ta.value = found
    ? `Student Found:\nName: ${found.name}\nID: ${found.id}\nCourse: ${found.course}\nGrades: ${(found.grades||[]).join(", ")||"No grades"}\nAvg Grade: ${avg(found.grades)}`
    : `Student not found.\nSearched: ${term} (by ${by})`;
}

function addToQueue() {
  const name = prompt("Enter student name to add to enrollment queue:");
  if (!name || !name.trim()) return;
  enrollmentQueue.push({ name: name.trim() });
  actionHistory.push({ type: "queue_add", studentName: name.trim() });
  saveState();
  updateQueueDisplay();
  alert(`${name.trim()} added to enrollment queue.`);
}

function processNextInQueue() {
  if (!enrollmentQueue.length) return alert("Queue is empty. No students to process.");
  const p = enrollmentQueue.shift();
  actionHistory.push({ type: "queue_process", studentName: p.name });
  saveState();
  updateQueueDisplay();
  alert(`Processed: ${p.name}`);
}

function undoLastAction() {
  if (!actionHistory.length) return alert("No actions to undo.");
  const a = actionHistory.pop();

  if (a.type === "add") {
    students = students.filter(s => s.id !== a.studentData.id);
    alert(`Undone: Removed ${a.studentData.name}`);
  } else if (a.type === "edit") {
    const i = students.findIndex(s => s.id === a.studentId);
    if (i >= 0) students[i] = a.previousData;
    alert(`Undone: Restored ${a.previousData?.name || a.studentId}`);
  } else if (a.type === "delete" && a.studentData) {
    students.push(a.studentData);
    alert(`Undone: Restored ${a.studentName}`);
  } else if (a.type === "queue_add") {
    enrollmentQueue = enrollmentQueue.filter(q => q.name !== a.studentName);
    alert(`Undone: Removed ${a.studentName} from queue`);
  } else if (a.type === "queue_process") {
    enrollmentQueue.unshift({ name: a.studentName });
    alert(`Undone: Added ${a.studentName} back to queue`);
  } else {
    alert("Undo completed.");
  }

  saveState();
  updateQueueDisplay();
  updateDashboard();
}

function viewAllStudents() {
  const list = LS.get("students", []);
  if (!list.length) return alert("No students in the system. Add students first.");

  let txt = `Total Students: ${list.length}\n\n`;
  list.forEach((s, i) => {
    txt += `${i + 1}. ${s.name} (ID: ${s.id})\n`;
    txt += `   Course: ${s.course}\n`;
    txt += `   Grades: ${(s.grades||[]).join(", ") || "No grades"}\n`;
    txt += `   Average: ${avg(s.grades)}\n\n`;
  });

  LS.set("viewAllResults", txt);
  window.location.href = "search.html";
}

// -------- Init --------
document.addEventListener("DOMContentLoaded", () => {
  seed();
  loadState();

  $("#login form")?.addEventListener("submit", handleLogin);
  $("#add-edit form")?.addEventListener("submit", handleAddEditStudent);
  $("#sort form")?.addEventListener("submit", handleSort);
  $("#search form")?.addEventListener("submit", handleSearch);

  $("#queue button.btn-primary")?.addEventListener("click", addToQueue);
  $("#queue button.btn-ghost")?.addEventListener("click", processNextInQueue);
  $("#undo button")?.addEventListener("click", undoLastAction);

  updateQueueDisplay();
  updateDashboard();

  // expose if needed by onclick in HTML
  window.viewAllStudents = viewAllStudents;
});
