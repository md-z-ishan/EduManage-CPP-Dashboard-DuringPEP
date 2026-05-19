/**
 * Student Grade Checker & Management System
 * Hybrid Architecture: C++ Backend & Node.js Server
 */

// --- Data Structure (Array-based Record Management) ---
let students = [];
let chartInstance = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await fetchStudents();
    setupEventListeners();
    updateDashboard();
    renderTable(students);
});

// --- Backend Integration ---
async function fetchStudents() {
    try {
        const response = await fetch('/api/students');
        if (response.ok) {
            const data = await response.json();
            // Convert strings back to numbers if needed, though C++ sends numbers correctly
            students = data.map(s => ({
                ...s,
                total: parseInt(s.total),
                percentage: parseFloat(s.percentage).toFixed(2),
                maths: parseInt(s.maths),
                science: parseInt(s.science),
                english: parseInt(s.english),
                history: parseInt(s.history)
            }));
        }
    } catch (e) {
        console.error('Failed to fetch students:', e);
        showToast('Error connecting to backend!', 'error');
    }
}

// --- DSA: Sorting Algorithms ---
// Merge Sort implementation (inspired by C++ sorting logic)
function mergeSort(arr, compareFn) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), compareFn);
    const right = mergeSort(arr.slice(mid), compareFn);
    
    return merge(left, right, compareFn);
}

function merge(left, right, compareFn) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (compareFn(left[i], right[j]) <= 0) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// Comparators
const comparators = {
    'name-asc': (a, b) => a.name.localeCompare(b.name),
    'marks-desc': (a, b) => b.total - a.total,
    'marks-asc': (a, b) => a.total - b.total,
};

// --- DSA: Searching Algorithms ---
// Linear Search for global search across multiple fields
function linearSearch(arr, query) {
    query = query.toLowerCase();
    let results = [];
    for (let i = 0; i < arr.length; i++) {
        const s = arr[i];
        if (s.name.toLowerCase().includes(query) || 
            String(s.rollno).toLowerCase().includes(query) || 
            s.grade.toLowerCase() === query) {
            results.push(s);
        }
    }
    return results;
}

// --- CRUD Operations ---
async function addStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const rollno = document.getElementById('rollno').value.trim();
    const maths = parseInt(document.getElementById('maths').value) || 0;
    const science = parseInt(document.getElementById('science').value) || 0;
    const english = parseInt(document.getElementById('english').value) || 0;
    const history = parseInt(document.getElementById('history').value) || 0;
    const editId = document.getElementById('edit-id').value;

    // Validation
    if (!name || !rollno) {
        showToast('Name and Roll Number are required!', 'error');
        return;
    }

    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollno, name, maths, science, english, history })
        });
        
        if (response.ok) {
            await fetchStudents();
            
            showToast(editId ? 'Student record updated successfully!' : 'Student added successfully!', 'success');
            
            document.getElementById('student-form').reset();
            document.getElementById('form-title').textContent = 'Add New Student';
            document.getElementById('cancel-btn').style.display = 'none';
            document.getElementById('edit-id').value = '';
            
            updateDashboard();
            renderTable(students);
        } else {
            showToast('Failed to save student!', 'error');
        }
    } catch (err) {
        showToast('Backend Error!', 'error');
    }
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        try {
            const response = await fetch(`/api/students/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await fetchStudents();
                updateDashboard();
                renderTable(students);
                showToast('Student record deleted!', 'success');
            }
        } catch (err) {
            showToast('Failed to delete student!', 'error');
        }
    }
}

function editStudent(id) {
    let student = null;
    for(let i=0; i<students.length; i++){
        // Convert to string for safe comparison
        if(String(students[i].id) === String(id)) {
            student = students[i];
            break;
        }
    }
    
    if (student) {
        document.getElementById('edit-id').value = student.id;
        document.getElementById('name').value = student.name;
        document.getElementById('rollno').value = student.rollno;
        document.getElementById('maths').value = student.maths;
        document.getElementById('science').value = student.science;
        document.getElementById('english').value = student.english;
        document.getElementById('history').value = student.history;
        
        document.getElementById('form-title').textContent = 'Edit Student (ID: ' + student.id + ')';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        
        // Switch to manage view
        document.querySelectorAll('.nav-item')[1].click();
    }
}

// --- DOM & UI Management ---

function renderTable(dataArray) {
    const tbody = document.getElementById('students-table-body');
    const noData = document.getElementById('no-data-msg');
    
    tbody.innerHTML = '';
    
    if (dataArray.length === 0) {
        noData.style.display = 'block';
    } else {
        noData.style.display = 'none';
        
        for (let i = 0; i < dataArray.length; i++) {
            const s = dataArray[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${s.rollno}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.total} / 400</td>
                <td>${s.percentage}%</td>
                <td><span class="badge badge-${s.grade}">${s.grade}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn btn-view" onclick="viewProfile('${s.id}')" title="View Report"><i class="fa-solid fa-eye"></i></button>
                        <button class="action-btn btn-edit" onclick="editStudent('${s.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteStudent('${s.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }
}

function updateDashboard() {
    // Basic Statistics
    const totalStudents = students.length;
    document.getElementById('stat-total').textContent = totalStudents;
    
    if (totalStudents === 0) {
        document.getElementById('stat-average').textContent = '0%';
        document.getElementById('stat-highest').textContent = '0';
        document.getElementById('stat-lowest').textContent = '0';
        document.getElementById('top-performers-list').innerHTML = '<li class="performer-item">No data</li>';
        updateChart(0, 0, 0, 0);
        return;
    }
    
    let sumPercentage = 0;
    let highest = students[0].total;
    let lowest = students[0].total;
    
    let sumMaths = 0, sumScience = 0, sumEnglish = 0, sumHistory = 0;

    for (let i = 0; i < totalStudents; i++) {
        const s = students[i];
        sumPercentage += parseFloat(s.percentage);
        
        if (s.total > highest) highest = s.total;
        if (s.total < lowest) lowest = s.total;
        
        sumMaths += s.maths;
        sumScience += s.science;
        sumEnglish += s.english;
        sumHistory += s.history;
    }
    
    document.getElementById('stat-average').textContent = (sumPercentage / totalStudents).toFixed(1) + '%';
    document.getElementById('stat-highest').textContent = highest;
    document.getElementById('stat-lowest').textContent = lowest;
    
    // Top Performers (Sorting using our custom Merge Sort)
    const sortedDesc = mergeSort([...students], comparators['marks-desc']);
    const topList = document.getElementById('top-performers-list');
    topList.innerHTML = '';
    
    const topCount = Math.min(3, sortedDesc.length);
    for (let i = 0; i < topCount; i++) {
        const s = sortedDesc[i];
        topList.innerHTML += `
            <li class="performer-item">
                <span class="performer-name"><i class="fa-solid fa-medal" style="color: ${i===0?'gold':i===1?'silver':'#cd7f32'}"></i> ${s.name}</span>
                <span class="performer-marks">${s.percentage}%</span>
            </li>
        `;
    }

    // Update Chart
    const avgMaths = sumMaths / totalStudents;
    const avgScience = sumScience / totalStudents;
    const avgEnglish = sumEnglish / totalStudents;
    const avgHistory = sumHistory / totalStudents;
    
    updateChart(avgMaths, avgScience, avgEnglish, avgHistory);
}

function updateChart(maths, science, english, history) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#f8fafc' : '#1e293b';
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Maths', 'Science', 'English', 'History'],
            datasets: [{
                label: 'Class Average Marks',
                data: [maths, science, english, history],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(245, 158, 11, 0.6)'
                ],
                borderColor: [
                    'rgb(59, 130, 246)',
                    'rgb(16, 185, 129)',
                    'rgb(139, 92, 246)',
                    'rgb(245, 158, 11)'
                ],
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: textColor }
                },
                x: {
                    ticks: { color: textColor }
                }
            },
            plugins: {
                legend: { labels: { color: textColor } }
            }
        }
    });
}

function viewProfile(id) {
    let student = null;
    for(let i=0; i<students.length; i++){
        if(String(students[i].id) === String(id)) {
            student = students[i];
            break;
        }
    }
    
    if (student) {
        document.getElementById('modal-name').textContent = student.name;
        document.getElementById('modal-rollno').textContent = student.rollno;
        document.getElementById('modal-maths').textContent = student.maths;
        document.getElementById('modal-science').textContent = student.science;
        document.getElementById('modal-english').textContent = student.english;
        document.getElementById('modal-history').textContent = student.history;
        
        document.getElementById('modal-total').textContent = student.total + " / 400";
        document.getElementById('modal-percentage').textContent = student.percentage + "%";
        
        const badge = document.getElementById('modal-grade');
        badge.textContent = student.grade;
        badge.className = `grade-badge badge badge-${student.grade}`;
        
        document.getElementById('profile-modal').classList.add('show');
    }
}

// --- Event Listeners ---
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Re-render chart if switching to dashboard
            if (targetId === 'dashboard-view') {
                updateDashboard();
            }
        });
    });

    // Theme Toggle
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        const icon = document.querySelector('#theme-toggle i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            document.getElementById('theme-toggle').innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
        }
        
        updateDashboard();
    });

    // Form Submit
    document.getElementById('student-form').addEventListener('submit', addStudent);

    // Cancel Edit
    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.getElementById('student-form').reset();
        document.getElementById('form-title').textContent = 'Add New Student';
        document.getElementById('cancel-btn').style.display = 'none';
        document.getElementById('edit-id').value = '';
    });

    // Search
    document.getElementById('global-search').addEventListener('input', (e) => {
        const query = e.target.value;
        if (query) {
            const results = linearSearch(students, query);
            renderTable(results);
        } else {
            applyFilters();
        }
    });

    // Sorting & Filtering
    document.getElementById('sort-by').addEventListener('change', applyFilters);
    document.getElementById('filter-grade').addEventListener('change', applyFilters);

    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('profile-modal').classList.remove('show');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('profile-modal')) {
            document.getElementById('profile-modal').classList.remove('show');
        }
    });
}

function applyFilters() {
    const sortVal = document.getElementById('sort-by').value;
    const filterVal = document.getElementById('filter-grade').value;
    
    let currentList = [...students];
    
    // Apply Filter
    if (filterVal !== 'ALL') {
        let filtered = [];
        for(let i=0; i<currentList.length; i++){
            if(currentList[i].grade === filterVal) {
                filtered.push(currentList[i]);
            }
        }
        currentList = filtered;
    }
    
    // Apply Sort (Using Merge Sort)
    if (sortVal !== 'default' && comparators[sortVal]) {
        currentList = mergeSort(currentList, comparators[sortVal]);
    }
    
    renderTable(currentList);
}

// --- Toast Notifications ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
