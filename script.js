const previousState = existingIndex >= 0
  ? JSON.parse(JSON.stringify(students[existingIndex]))
  : null;

if (existingIndex >= 0) {
  students[existingIndex] = {
    id: studentId,
    name: studentName,
    course: course,
    grades: grades.length > 0 ? grades : students[existingIndex].grades
  };

  actionHistory.push({
    type: 'edit',
    studentId: studentId,
    previousData: previousState,
    newData: JSON.parse(JSON.stringify(students[existingIndex]))
  });

  alert(`Student ${studentName} updated successfully!`);
} else {
  const newStudent = {
    id: studentId,
    name: studentName,
    course: course,
    grades: grades
  };

  students.push(newStudent);

  actionHistory.push({
    type: 'add',
    studentData: JSON.parse(JSON.stringify(newStudent))
  });

  alert(`Student ${studentName} added successfully!`);
}

form.reset();
updateDashboard();

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

function handleSort(event) {
  event.preventDefault();

  const algorithm = document.querySelector('#sort select').value;
  const checkedRadio = document.querySelector('#sort input[type="radio"]:checked');
  const ascending = checkedRadio && checkedRadio.value === '';

  let allGrades = [];
  students.forEach(student => {
    if (student.grades && student.grades.length > 0) {
      allGrades = allGrades.concat(student.grades);
    }
  });

  if (allGrades.length === 0) {
    document.querySelector('#sort textarea').value =
      'No grades to sort. Add students with grades first.';
    return;
  }
}

