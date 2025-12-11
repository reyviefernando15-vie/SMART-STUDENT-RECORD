// ============================================
// SMART STUDENT RECORD MANAGEMENT SYSTEM
// Data Structures & Algorithms Implementation
// ============================================

// Data Structures
let students = []; // Array to store all student records
let enrollmentQueue = []; // Queue (FCFS) for enrollment
let actionHistory = []; // Stack for undo functionality

// Sample data for demonstration
function initializeSampleData() {
  // Check if data already exists in localStorage
  if (!localStorage.getItem('students') || JSON.parse(localStorage.getItem('students')).length === 0) {
    const sampleStudents = [
      { id: '2023-001', name: 'Ana Santos', course: 'BSCS 2nd Year', grades: [92.1, 89.5, 94.0] },
      { id: '2023-002', name: 'Juan Dela Cruz', course: 'BSIT 3rd Year', grades: [85.0, 88.0, 90.0] },
      { id: '2023-003', name: 'Maria Reyes', course: 'BSCS 2nd Year', grades: [96.2, 94.5, 95.0] },
      { id: '2023-004', name: 'Pedro Dizon', course: 'BSIT 2nd Year', grades: [78.0, 82.0, 80.0] },
      { id: '2023-005', name: 'Carla Lopez', course: 'BSCS 3rd Year', grades: [91.0, 93.0, 92.5] }
    ];
    const sampleQueue = [
      { name: 'Dela Cruz, Juan' },
      { name: 'Santos, Ana' },
      { name: 'Reyes, Mark' },
      { name: 'Dizon, Carla' }
    ];
    
    localStorage.setItem('students', JSON.stringify(sampleStudents));
    localStorage.setItem('enrollmentQueue', JSON.stringify(sampleQueue));
  }
}

// Calculate average grade
function calculateAverage(grades) {
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
  return (sum / grades.length).toFixed(2);
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================
function handleLogin(event) {
  event.preventDefault();
  const username = document.querySelector('#login input[type="text"]').value;
  const password = document.querySelector('#login input[type="password"]').value;
  
  // Simple login check (for demo purposes)
  if (username && password) {
    alert('Login successful! Welcome to Smart Student Record System.');
    initializeSampleData();
    document.querySelector('#login').style.display = 'none';
  } else {
    alert('Please enter username and password.');
  }
}

// ============================================
// ADD/EDIT STUDENT FUNCTIONALITY
// ============================================
function handleAddEditStudent(event) {
  event.preventDefault();
  
  const form = event.target;
  const studentId = form.querySelector('input[placeholder*="Student ID"]').value.trim();
  const studentName = form.querySelector('input[placeholder*="Student Name"]').value.trim();
  const course = form.querySelector('input[placeholder*="Course"]').value.trim();
  const gradesInput = form.querySelector('input[placeholder*="Grades"]').value.trim();
  
  if (!studentId || !studentName || !course) {
    alert('Please fill in all required fields (ID, Name, Course).');
    return;
  }
  
  // Parse grades
  const grades = gradesInput ? gradesInput.split(',').map(g => parseFloat(g.trim())).filter(g => !isNaN(g)) : [];
  
  // Check if student exists (for edit)
  const existingIndex = students.findIndex(s => s.id === studentId);
  
  // Save previous state for undo
  const previousState = existingIndex >= 0 ? JSON.parse(JSON.stringify(students[existingIndex])) : null;
  
  if (existingIndex >= 0) {
    // Edit existing student
    students[existingIndex] = {
      id: studentId,
      name: studentName,
      course: course,
      grades: grades.length > 0 ? grades : students[existingIndex].grades
    };
    
    // Add to undo stack
    actionHistory.push({
      type: 'edit',
      studentId: studentId,
      previousData: previousState,
      newData: JSON.parse(JSON.stringify(students[existingIndex]))
    });
    
    alert(`Student ${studentName} updated successfully!`);
  } else {
    // Add new student
    const newStudent = {
      id: studentId,
      name: studentName,
      course: course,
      grades: grades
    };
    students.push(newStudent);
    
    // Add to undo stack
    actionHistory.push({
      type: 'add',
      studentData: JSON.parse(JSON.stringify(newStudent))
    });
    
    alert(`Student ${studentName} added successfully!`);
  }
  
  form.reset();
  updateDashboard();
}

// Add grade field functionality
function addGradeField() {
  const form = document.querySelector('#add-edit form');
  const gradesInput = form.querySelector('input[placeholder*="Grades"]');
  const currentValue = gradesInput.value.trim();
  if (currentValue) {
    gradesInput.value = currentValue + ', ';
  } else {
    alert('Enter grades separated by commas (e.g., 89.5, 92.1, 94.0)');
  }
}

// ============================================
// SORT FUNCTIONALITY
// ============================================
function handleSort(event) {
  event.preventDefault();
  
  const algorithm = document.querySelector('#sort select').value;
  const checkedRadio = document.querySelector('#sort input[type="radio"]:checked');
  const ascending = checkedRadio && checkedRadio.value === '';
  
  // Get all grades from students
  let allGrades = [];
  students.forEach(student => {
    if (student.grades && student.grades.length > 0) {
      allGrades = allGrades.concat(student.grades);
    }
  });
  
  if (allGrades.length === 0) {
    document.querySelector('#sort textarea').value = 'No grades to sort. Add students with grades first.';
    return;
  }
  
  // Remove duplicates and sort
  allGrades = [...new Set(allGrades)];
  
  let sortedGrades;
  let steps = [];
  
  switch (algorithm) {
    case 'Bubble Sort':
      sortedGrades = bubbleSort([...allGrades], ascending, steps);
      break;
    case 'Selection Sort':
      sortedGrades = selectionSort([...allGrades], ascending, steps);
      break;
    case 'Insertion Sort':
      sortedGrades = insertionSort([...allGrades], ascending, steps);
      break;
    default:
      sortedGrades = [...allGrades].sort((a, b) => ascending ? a - b : b - a);
  }
  
  document.querySelector('#sort textarea').value = sortedGrades.join(', ');
  
  // Save to undo stack
  actionHistory.push({
    type: 'sort',
    algorithm: algorithm,
    original: allGrades,
    sorted: sortedGrades
  });
}

// Bubble Sort Algorithm
function bubbleSort(arr, ascending, steps) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if ((ascending && arr[j] > arr[j + 1]) || (!ascending && arr[j] < arr[j + 1])) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Selection Sort Algorithm
function selectionSort(arr, ascending, steps) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minMaxIdx = i;
    for (let j = i + 1; j < n; j++) {
      if ((ascending && arr[j] < arr[minMaxIdx]) || (!ascending && arr[j] > arr[minMaxIdx])) {
        minMaxIdx = j;
      }
    }
    [arr[i], arr[minMaxIdx]] = [arr[minMaxIdx], arr[i]];
  }
  return arr;
}

// Insertion Sort Algorithm
function insertionSort(arr, ascending, steps) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && ((ascending && arr[j] > key) || (!ascending && arr[j] < key))) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

// ============================================
// SEARCH FUNCTIONALITY (Binary Search)
// ============================================
function handleSearch(event) {
  event.preventDefault();
  
  const searchBy = document.querySelector('#search input[type="radio"]:checked').parentElement.textContent.trim();
  const searchTerm = document.querySelector('#search input[type="text"]').value.trim().toLowerCase();
  
  if (!searchTerm) {
    alert('Please enter a search term.');
    return;
  }
  
  // Sort students by name or ID for binary search
  let sortedStudents = [...students];
  if (searchBy === 'Name') {
    sortedStudents.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sortedStudents.sort((a, b) => a.id.localeCompare(b.id));
  }
  
  // Binary Search
  let result = null;
  let left = 0;
  let right = sortedStudents.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const student = sortedStudents[mid];
    const compareValue = searchBy === 'Name' ? student.name.toLowerCase() : student.id.toLowerCase();
    
    if (compareValue === searchTerm) {
      result = student;
      break;
    } else if (compareValue < searchTerm) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  // If exact match not found, try linear search for partial match
  if (!result) {
    result = students.find(s => {
      const searchValue = searchBy === 'Name' ? s.name.toLowerCase() : s.id.toLowerCase();
      return searchValue.includes(searchTerm);
    });
  }
  
  const resultTextarea = document.querySelector('#search textarea');
  if (result) {
    const avgGrade = calculateAverage(result.grades);
    resultTextarea.value = `Student Found:\nName: ${result.name}\nID: ${result.id}\nCourse: ${result.course}\nGrades: ${result.grades.join(', ')}\nAvg Grade: ${avgGrade}`;
  } else {
    resultTextarea.value = `Student not found.\nSearched for: ${searchTerm} (by ${searchBy})`;
  }
}

// ============================================
// ENROLLMENT QUEUE (FCFS - Queue Data Structure)
// ============================================
function updateQueueDisplay() {
  const queueTextarea = document.querySelector('#queue textarea');
  if (enrollmentQueue.length === 0) {
    queueTextarea.value = 'Queue is empty.';
  } else {
    queueTextarea.value = enrollmentQueue.map((item, index) => `${index + 1}. ${item.name}`).join('\n');
  }
  updateDashboard();
}

function addToQueue() {
  const name = prompt('Enter student name to add to enrollment queue:');
  if (name && name.trim()) {
    enrollmentQueue.push({ name: name.trim() });
    updateQueueDisplay();
    
    // Add to undo stack
    actionHistory.push({
      type: 'queue_add',
      studentName: name.trim()
    });
    
    alert(`${name} added to enrollment queue.`);
  }
}

function processNextInQueue() {
  if (enrollmentQueue.length === 0) {
    alert('Queue is empty. No students to process.');
    return;
  }
  
  // FCFS: Remove from front of queue (shift)
  const processed = enrollmentQueue.shift();
  
  // Add to undo stack
  actionHistory.push({
    type: 'queue_process',
    studentName: processed.name
  });
  
  alert(`Processed: ${processed.name}`);
  updateQueueDisplay();
}

// ============================================
// UNDO FUNCTIONALITY (Stack Data Structure)
// ============================================
function updateUndoDisplay() {
  const undoTextarea = document.querySelector('#undo textarea');
  if (actionHistory.length === 0) {
    undoTextarea.value = 'No actions to undo.';
    document.querySelector('#undo button').disabled = true;
  } else {
    const lastAction = actionHistory[actionHistory.length - 1];
    let actionText = '';
    
    switch (lastAction.type) {
      case 'add':
        actionText = `Added Record: ${lastAction.studentData.name} (ID: ${lastAction.studentData.id})`;
        break;
      case 'edit':
        actionText = `Edited Record: ${lastAction.previousData.name} (ID: ${lastAction.studentId})`;
        break;
      case 'delete':
        actionText = `Deleted Record: ${lastAction.studentName}`;
        break;
      case 'queue_add':
        actionText = `Added to Queue: ${lastAction.studentName}`;
        break;
      case 'queue_process':
        actionText = `Processed from Queue: ${lastAction.studentName}`;
        break;
      case 'sort':
        actionText = `Sorted Grades using ${lastAction.algorithm}`;
        break;
      default:
        actionText = 'Last Action';
    }
    
    undoTextarea.value = actionText;
    document.querySelector('#undo button').disabled = false;
  }
  updateDashboard();
}

function undoLastAction() {
  if (actionHistory.length === 0) {
    alert('No actions to undo.');
    return;
  }
  
  // Stack: Pop the last action (LIFO)
  const lastAction = actionHistory.pop();
  
  switch (lastAction.type) {
    case 'add':
      // Remove the added student
      const addIndex = students.findIndex(s => s.id === lastAction.studentData.id);
      if (addIndex >= 0) {
        students.splice(addIndex, 1);
        alert(`Undone: Removed student ${lastAction.studentData.name}`);
      }
      break;
      
    case 'edit':
      // Restore previous data
      const editIndex = students.findIndex(s => s.id === lastAction.studentId);
      if (editIndex >= 0 && lastAction.previousData) {
        students[editIndex] = lastAction.previousData;
        alert(`Undone: Restored student ${lastAction.previousData.name}`);
      }
      break;
      
    case 'delete':
      // Restore deleted student
      if (lastAction.studentData) {
        students.push(lastAction.studentData);
        alert(`Undone: Restored student ${lastAction.studentName}`);
      }
      break;
      
    case 'queue_add':
      // Remove from queue
      const queueRemoveIndex = enrollmentQueue.findIndex(q => q.name === lastAction.studentName);
      if (queueRemoveIndex >= 0) {
        enrollmentQueue.splice(queueRemoveIndex, 1);
        updateQueueDisplay();
        alert(`Undone: Removed ${lastAction.studentName} from queue`);
      }
      break;
      
    case 'queue_process':
      // Add back to front of queue
      enrollmentQueue.unshift({ name: lastAction.studentName });
      updateQueueDisplay();
      alert(`Undone: Added ${lastAction.studentName} back to queue`);
      break;
      
    default:
      alert('Undo completed.');
  }
  
  updateDashboard();
  updateUndoDisplay();
}

// ============================================
// VIEW ALL STUDENTS
// ============================================
function viewAllStudents() {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  
  if (students.length === 0) {
    alert('No students in the system. Add students first.');
    return;
  }
  
  let displayText = `Total Students: ${students.length}\n\n`;
  students.forEach((student, index) => {
    const avgGrade = calculateAverage(student.grades);
    displayText += `${index + 1}. ${student.name} (ID: ${student.id})\n`;
    displayText += `   Course: ${student.course}\n`;
    displayText += `   Grades: ${student.grades && student.grades.length > 0 ? student.grades.join(', ') : 'No grades'}\n`;
    displayText += `   Average: ${avgGrade}\n\n`;
  });
  
  // Redirect to search page and show results
  localStorage.setItem('viewAllResults', displayText);
  window.location.href = 'search.html';
}

// ============================================
// DASHBOARD UPDATE
// ============================================
function updateDashboard() {
  // Update total students
  const totalStudentsEl = document.querySelector('#dashboard .stat-card:nth-child(1) .stat-value');
  if (totalStudentsEl) {
    totalStudentsEl.textContent = students.length;
  }
  
  // Update queue count
  const queueCountEl = document.querySelector('#dashboard .stat-card:nth-child(2) .stat-value');
  if (queueCountEl) {
    queueCountEl.textContent = enrollmentQueue.length;
  }
  
  // Update last action
  const lastActionEl = document.querySelector('#dashboard .stat-card:nth-child(3) .stat-value');
  if (lastActionEl && actionHistory.length > 0) {
    const lastAction = actionHistory[actionHistory.length - 1];
    let actionText = '';
    switch (lastAction.type) {
      case 'add': actionText = 'Added Record'; break;
      case 'edit': actionText = 'Edited Record'; break;
      case 'delete': actionText = 'Deleted Record'; break;
      case 'queue_add': actionText = 'Added to Queue'; break;
      case 'queue_process': actionText = 'Processed Queue'; break;
      case 'sort': actionText = 'Sorted Grades'; break;
      default: actionText = 'Action';
    }
    lastActionEl.textContent = actionText;
  }
  
  updateUndoDisplay();
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize sample data
  initializeSampleData();
  
  // Login form
  const loginForm = document.querySelector('#login form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Add/Edit form
  const addEditForm = document.querySelector('#add-edit form');
  if (addEditForm) {
    addEditForm.addEventListener('submit', handleAddEditStudent);
  }
  
  // Add Grade Field button
  const addGradeBtn = document.querySelector('#add-edit button[type="button"]');
  if (addGradeBtn) {
    addGradeBtn.addEventListener('click', addGradeField);
  }
  
  // Sort form
  const sortForm = document.querySelector('#sort form');
  if (sortForm) {
    sortForm.addEventListener('submit', handleSort);
  }
  
  // Search form
  const searchForm = document.querySelector('#search form');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
  
  // Queue buttons
  const addToQueueBtn = document.querySelector('#queue button.btn-primary');
  if (addToQueueBtn) {
    addToQueueBtn.addEventListener('click', addToQueue);
  }
  
  const processQueueBtn = document.querySelector('#queue button.btn-ghost');
  if (processQueueBtn) {
    processQueueBtn.addEventListener('click', processNextInQueue);
  }
  
  // Undo button
  const undoBtn = document.querySelector('#undo button');
  if (undoBtn) {
    undoBtn.addEventListener('click', undoLastAction);
  }
  
  // Initialize displays
  updateDashboard();
  updateQueueDisplay();
  updateUndoDisplay();
  
  console.log('Smart Student Record Management System initialized!');
});

