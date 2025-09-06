// Database Admin Page JavaScript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api' 
    : window.location.origin + '/api';

// Add debug log
console.log('API Base URL:', API_BASE_URL);

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const refreshBtn = document.getElementById('refreshBtn');

// Table bodies
const teachersTableBody = document.getElementById('teachersTableBody');
const assessmentsTableBody = document.getElementById('assessmentsTableBody');

// Statistics elements
const totalTeachersCount = document.getElementById('totalTeachersCount');
const totalAssessmentsCount = document.getElementById('totalAssessmentsCount');
const totalClassesCount = document.getElementById('totalClassesCount');
const avgScoreCount = document.getElementById('avgScoreCount');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    
    // Event listeners
    refreshBtn.addEventListener('click', loadAllData);
});

// Load all database data
async function loadAllData() {
    showLoading(true);
    hideError();
    
    try {
        await Promise.all([
            loadTeachers(),
            loadAssessments()
        ]);
        updateStatistics();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Gagal memuat data database');
    } finally {
        showLoading(false);
    }
}

// Load teachers data
async function loadTeachers() {
    try {
        const response = await fetch(`${API_BASE_URL}/teachers`);
        const result = await response.json();
        
        if (result.success) {
            displayTeachers(result.data);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading teachers:', error);
        throw error;
    }
}

// Load assessments data
// Load assessments data
async function loadAssessments() {
    try {
        const response = await fetch(`${API_BASE_URL}/assessments?limit=1000`);
        const result = await response.json();
        
        if (result.success) {
            // Urutkan berdasarkan ID dari kecil ke besar
            const sortedAssessments = result.data.sort((a, b) => a.id - b.id);

            displayAssessments(sortedAssessments);
            return sortedAssessments;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error loading assessments:', error);
        throw error;
    }
}


// Display teachers in table
function displayTeachers(teachers) {
    if (!teachers || teachers.length === 0) {
        teachersTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data guru
                </td>
            </tr>
        `;
        return;
    }

    teachersTableBody.innerHTML = teachers.map(teacher => `
        <tr class="hover:bg-gray-50" data-teacher-id="${teacher.id}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${teacher.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                    <input type="text" 
                           value="${teacher.name}" 
                           class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 teacher-name-input"
                           data-original-name="${teacher.name}">
                    <button class="save-teacher-btn p-1.5 text-gray-400 hover:text-blue-600 hover:border-blue-600 focus:outline-none border border-gray-300 rounded-md" 
                            title="Simpan perubahan">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">${teacher.notes || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${teacher.assessmentCount || 0}</td>
        </tr>
    `).join('');

    // Add event listeners for save buttons
    document.querySelectorAll('.save-teacher-btn').forEach(btn => {
        btn.addEventListener('click', handleSaveTeacher);
    });

    // Add input event to show/hide save button
    document.querySelectorAll('.teacher-name-input').forEach(input => {
        input.addEventListener('input', function() {
            const saveBtn = this.nextElementSibling;
            const originalName = this.dataset.originalName;
            saveBtn.classList.toggle('text-blue-600', this.value !== originalName);
            saveBtn.disabled = this.value === originalName;
        });
    });
}

// Handle save teacher name
async function handleSaveTeacher(e) {
    const btn = e.currentTarget;
    const input = btn.previousElementSibling;
    const teacherId = btn.closest('tr').dataset.teacherId;
    const newName = input.value.trim();

    if (!newName) {
        showError('Nama guru tidak boleh kosong');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) {
            throw new Error('Gagal memperbarui nama guru');
        }

        // Update the original name in the data attribute
        input.dataset.originalName = newName;
        btn.classList.remove('text-blue-600');
        btn.disabled = true;
        
        showToast('Nama guru berhasil diperbarui');
    } catch (error) {
        console.error('Error updating teacher:', error);
        showError('Gagal memperbarui nama guru');
    } finally {
        showLoading(false);
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-lg';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Display assessments in table
function displayAssessments(assessments) {
    if (assessments.length === 0) {
        assessmentsTableBody.innerHTML = `
            <tr>
                <td colspan="28" class="px-3 py-4 text-center text-gray-500">
                    Tidak ada data penilaian
                </td>
            </tr>
        `;
        return;
    }

    assessmentsTableBody.innerHTML = assessments.map(assessment => {
        const categoryColor = getCategoryColor(assessment.category);
        const createdAt = new Date(assessment.createdAt).toLocaleDateString('id-ID');
        const updatedAt = new Date(assessment.updatedAt).toLocaleDateString('id-ID');
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.id}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.studentName}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.className}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.weekNumber}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.teacherId}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting1_kehadiran}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting1_membaca}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting1_kosakata}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting1_pengucapan}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting1_speaking}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.meeting1_total}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting2_kehadiran}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting2_membaca}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting2_kosakata}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting2_pengucapan}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting2_speaking}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.meeting2_total}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting3_kehadiran}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting3_membaca}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting3_kosakata}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting3_pengucapan}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.meeting3_speaking}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.meeting3_total}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${assessment.total_weekly}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.average}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm ${categoryColor}">${assessment.category}</td>
                <td class="px-3 py-4 text-sm text-gray-600 max-w-xs truncate" title="${assessment.progress_notes || ''}">${assessment.progress_notes || '-'}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${createdAt}</td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">${updatedAt}</td>
            </tr>
        `;
    }).join('');
}

// Get category color class
function getCategoryColor(category) {
    switch (category) {
        case 'Sangat Baik':
            return 'text-green-600 font-semibold';
        case 'Baik':
            return 'text-blue-600 font-semibold';
        case 'Cukup':
            return 'text-yellow-600 font-semibold';
        case 'Kurang':
            return 'text-orange-600 font-semibold';
        case 'Sangat Kurang':
            return 'text-red-600 font-semibold';
        default:
            return 'text-gray-600';
    }
}

// Update statistics
async function updateStatistics() {
    try {
        // Get teachers count
        const teachersResponse = await fetch(`${API_BASE_URL}/teachers`);
        const teachersResult = await teachersResponse.json();
        const teachersCount = teachersResult.success ? teachersResult.data.length : 0;

        // Get assessments data
        const assessmentsResponse = await fetch(`${API_BASE_URL}/assessments?limit=1000`);
        const assessmentsResult = await assessmentsResponse.json();
        const assessments = assessmentsResult.success ? assessmentsResult.data : [];
        const assessmentsCount = assessments.length;

        // Calculate unique classes
        const uniqueClasses = [...new Set(assessments.map(a => a.className))];
        const classesCount = uniqueClasses.length;

        // Calculate average score
        const totalScores = assessments.reduce((sum, a) => sum + a.average, 0);
        const avgScore = assessmentsCount > 0 ? (totalScores / assessmentsCount).toFixed(1) : 0;

        // Update DOM
        totalTeachersCount.textContent = teachersCount;
        totalAssessmentsCount.textContent = assessmentsCount;
        totalClassesCount.textContent = classesCount;
        avgScoreCount.textContent = avgScore;

    } catch (error) {
        console.error('Error updating statistics:', error);
    }
}

// Utility functions
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}
