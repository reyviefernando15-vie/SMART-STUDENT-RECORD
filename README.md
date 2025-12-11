# Smart Student Record Management System (SRMS)

A complete web-based student record management system implementing various Data Structures & Algorithms concepts.

## Features

✅ **Add/Edit Students** - Manage student records with ID, Name, Course, and Grades  
✅ **Sort Grades** - Implement Bubble Sort, Selection Sort, and Insertion Sort algorithms  
✅ **Search Students** - Binary Search by Name or Student ID  
✅ **Enrollment Queue** - First-Come-First-Served (FCFS) Queue implementation  
✅ **Undo Functionality** - Stack-based undo system for reverting actions  
✅ **Dashboard** - Real-time statistics and overview  

## How to Run

### Method 1: Direct File Opening (Simplest)

1. **Double-click** `Index.html` file to open it in your default web browser
2. That's it! The system will load automatically.

### Method 2: Using a Local Server (Recommended for development)

1. **Using Python** (if installed):
   ```bash
   python -m http.server 8000
   ```
   Then open: `http://localhost:8000/Index.html`

2. **Using Node.js** (if installed):
   ```bash
   npx http-server
   ```
   Then open the URL shown in the terminal.

3. **Using VS Code Live Server**:
   - Install "Live Server" extension in VS Code
   - Right-click on `Index.html` → "Open with Live Server"

## Quick Start Guide

1. **Login** (Demo):
   - Enter any username and password
   - Click "Login" to start
   - Sample data will be automatically loaded

2. **Add Student**:
   - Go to "Add / Edit Student" section
   - Fill in: Student ID, Name, Course, Grades (comma-separated, e.g., `89.5, 92.1, 94.0`)
   - Click "Save"

3. **View All Students**:
   - Click "View" button in Dashboard
   - All students will be displayed in the Search section

4. **Search Student**:
   - Go to "Search Student" section
   - Select search by "Name" or "ID"
   - Enter search term and click "Search"
   - Uses Binary Search algorithm

5. **Sort Grades**:
   - Go to "Sort Grades" section
   - Select algorithm (Bubble/Selection/Insertion Sort)
   - Choose order (Ascending/Descending)
   - Click "Sort Now"

6. **Enrollment Queue**:
   - Click "Add to Queue" to add students
   - Click "Process Next" to process (FCFS - removes from front)

7. **Undo Action**:
   - Click "Undo Action" to revert the last operation
   - Uses Stack data structure (LIFO)

## Data Structures & Algorithms Used

- **Array** - Student records storage
- **Queue (FCFS)** - Enrollment queue management
- **Stack** - Undo functionality
- **Binary Search** - Student search
- **Bubble Sort** - Grade sorting algorithm
- **Selection Sort** - Grade sorting algorithm
- **Insertion Sort** - Grade sorting algorithm

## File Structure

```
DSA_Final_Project/
├── Index.html      # Main HTML file
├── style.css       # Stylesheet
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Opera

## Notes

- All data is stored in browser memory (refreshing will reset to sample data)
- Login is for demonstration purposes only (accepts any credentials)
- Sample data is automatically loaded on first login

## System Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- No server required (runs entirely in browser)
- JavaScript must be enabled

---

**Built for New Era University - Data Structures & Algorithms Final Project**

