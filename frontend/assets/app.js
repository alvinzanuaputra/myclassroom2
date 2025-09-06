// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// State management
let currentPage = 1;
let currentSearch = '';
let editingId = null;
let teachers = [];
let assessments = [];

// DOM Elements
const assessmentForm = document.getElementById('assessmentForm');
const editModal = document.getElementById('editModal');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const assessmentTableBody = document.getElementById('assessmentTableBody');
const searchInput = document.getElementById('searchInput');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadTeachers();
    loadAssessments();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Form submission
    assessmentForm.addEventListener('submit', handleFormSubmit);
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    searchInput.addEventListener('input', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Pagination
    prevBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    
    // Modal close functionality
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    
    // Close modal when clicking close button (X)
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }
    
    // Close modal when clicking cancel button
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }
    
    // Close modal when clicking outside (on overlay)
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && editModal && !editModal.classList.contains('hidden')) {
            closeEditModal();
        }
    });
    
    // Edit form submission
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmit);
    }
}

// API Functions
async function apiCall(endpoint, options = {}) {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Terjadi kesalahan');
        }
        
        return data;
    } catch (error) {
        showToast(error.message, 'error');
        throw error;
    } finally {
        showLoading(false);
    }
}

// Load teachers data
async function loadTeachers() {
    try {
        const response = await apiCall('/teachers');
        teachers = response.data;
        
        const teacherSelect = document.getElementById('teacherId');
        teacherSelect.innerHTML = '<option value="">Pilih Guru</option>';
        
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

// Load teachers data for edit form
async function loadTeachersForEdit() {
    try {
        const response = await apiCall('/teachers');
        teachers = response.data;
        
        const teacherSelect = document.getElementById('editTeacherId');
        teacherSelect.innerHTML = '<option value="">Pilih Guru</option>';
        
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading teachers for edit:', error);
    }
}

// Load assessments data
async function loadAssessments(page = 1, search = '') {
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            q: search
        });
        
        const response = await apiCall(`/assessments?${params}`);
        const { data: assessmentsData, pagination } = response;
        
        assessments = assessmentsData;
        displayAssessments(assessmentsData);
        updatePagination(pagination);
        currentPage = page;
        currentSearch = search;
    } catch (error) {
        console.error('Error loading assessments:', error);
    }
}

// Display assessments in table with detailed score format
function displayAssessments(data) {
    const tbody = assessmentTableBody;
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="px-4 py-8 text-center text-gray-500">
                    Tidak ada data penilaian
                </td>
            </tr>
        `;
        return;
    }

    // Sort data by weekNumber first, then by className
    const sortedData = data.sort((a, b) => {
        if (a.weekNumber !== b.weekNumber) {
            return a.weekNumber - b.weekNumber;
        }
        return a.className.localeCompare(b.className);
    });

    // Group assessments by week only for better organization
    const groupedByWeek = sortedData.reduce((acc, assessment) => {
        const weekKey = assessment.weekNumber || 1;
        if (!acc[weekKey]) {
            acc[weekKey] = {
                weekNumber: weekKey,
                assessments: []
            };
        }
        acc[weekKey].assessments.push(assessment);
        return acc;
    }, {});

    let tableHTML = '';
    
    // Sort weeks numerically
    const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedWeeks.forEach(weekKey => {
        const group = groupedByWeek[weekKey];
        
        // Add week header
        tableHTML += `
            <tr class="bg-blue-50">
                <td colspan="11" class="px-6 py-3 text-left font-semibold text-blue-800">
                    Minggu ${group.weekNumber}
                </td>
            </tr>
        `;
        
        group.assessments.forEach((assessment, index) => {
            // Format detailed scores for each meeting
            const meeting1Scores = `${assessment.meeting1_kehadiran}-${assessment.meeting1_membaca}-${assessment.meeting1_kosakata}-${assessment.meeting1_pengucapan}-${assessment.meeting1_speaking} (${assessment.meeting1_total})`;
            const meeting2Scores = `${assessment.meeting2_kehadiran}-${assessment.meeting2_membaca}-${assessment.meeting2_kosakata}-${assessment.meeting2_pengucapan}-${assessment.meeting2_speaking} (${assessment.meeting2_total})`;
            const meeting3Scores = `${assessment.meeting3_kehadiran}-${assessment.meeting3_membaca}-${assessment.meeting3_kosakata}-${assessment.meeting3_pengucapan}-${assessment.meeting3_speaking} (${assessment.meeting3_total})`;
            
            // Determine category color
            let categoryColor = 'text-gray-600';
            switch (assessment.category) {
                case 'Sangat Baik':
                    categoryColor = 'text-green-600 font-semibold';
                    break;
                case 'Baik':
                    categoryColor = 'text-blue-600 font-semibold';
                    break;
                case 'Cukup':
                    categoryColor = 'text-yellow-600 font-semibold';
                    break;
                case 'Kurang':
                    categoryColor = 'text-orange-600 font-semibold';
                    break;
                case 'Sangat Kurang':
                    categoryColor = 'text-red-600 font-semibold';
                    break;
            }
            
            // <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">Minggu ${assessment.weekNumber || 1}</td>
            tableHTML += `
                <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.studentName}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.className}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">${assessment.teacherName}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">${meeting1Scores}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">${meeting2Scores}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">${meeting3Scores}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.total_weekly}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.average}</td>
                    <td class="px-4 py-4 whitespace-nowrap">${categoryBadge(assessment.category)}</td>
                    <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="editAssessment(${assessment.id})" 
                                class="text-indigo-600 hover:text-indigo-900 mr-3">
                            Edit
                        </button>
                        <button onclick="deleteAssessment(${assessment.id})" 
                                class="text-red-600 hover:text-red-900">
                            Hapus
                        </button>
                    </td>
                </tr>
            `;
        });
    });
    
    tbody.innerHTML = tableHTML;
}

// Get category badge HTML
function categoryBadge(category) {
    const badges = {
        'Sangat Baik': 'bg-green-100 text-green-800',
        'Baik': 'bg-blue-100 text-blue-800',
        'Cukup': 'bg-yellow-100 text-yellow-800',
        'Kurang': 'bg-orange-100 text-orange-800',
        'Sangat Kurang': 'bg-red-100 text-red-800'
    };
    
    const badgeClass = badges[category] || 'bg-gray-100 text-gray-800';
    return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}">${category}</span>`;
}

// Update pagination
function updatePagination(pagination) {
    const { currentPage: page, totalPages, totalItems, itemsPerPage, hasNext, hasPrev } = pagination;
    
    const showingFrom = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
    const showingTo = Math.min(page * itemsPerPage, totalItems);
    
    document.getElementById('showingFrom').textContent = showingFrom;
    document.getElementById('showingTo').textContent = showingTo;
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('pageInfo').textContent = `Halaman ${page} dari ${totalPages}`;
    
    document.getElementById('prevBtn').disabled = !hasPrev;
    document.getElementById('nextBtn').disabled = !hasNext;
}

// Get form data
function getFormData() {
    const studentName = document.getElementById('studentName').value;
    const className = document.getElementById('className').value;
    const weekNumber = parseInt(document.getElementById('weekNumber').value);
    const teacherId = parseInt(document.getElementById('teacherId').value);
    const progressNotes = document.getElementById('progressNotes').value;
    
    // Debug log to check values
    console.log('Form data:', { studentName, className, weekNumber, teacherId });
    
    const pertemuan = [];
    for (let i = 1; i <= 3; i++) {
        const scores = {
            kehadiran: parseInt(document.getElementById(`meeting${i}_kehadiran`).value) || 0,
            membaca: parseInt(document.getElementById(`meeting${i}_membaca`).value) || 0,
            kosakata: parseInt(document.getElementById(`meeting${i}_kosakata`).value) || 0,
            pengucapan: parseInt(document.getElementById(`meeting${i}_pengucapan`).value) || 0,
            speaking: parseInt(document.getElementById(`meeting${i}_speaking`).value) || 0
        };
        
        pertemuan.push({
            meeting: i,
            scores
        });
    }
    
    return {
        studentName,
        className,
        weekNumber,
        teacherId,
        pertemuan,
        progressNotes
    };
}

// Form submission handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = getFormData();
        
        if (editingId) {
            await apiCall(`/assessments/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showToast('Penilaian berhasil diperbarui');
            closeEditModal();
        } else {
            await apiCall('/assessments', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Penilaian berhasil disimpan');
        }
        
        resetForm();
        loadAssessments();
    } catch (error) {
        console.error('Error submitting form:', error);
    }
}

// Search handler
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    loadAssessments(1, searchTerm);
}

// Change page
function changePage(page) {
    if (page < 1) return;
    loadAssessments(page, currentSearch);
}

// Edit assessment
async function editAssessment(id) {
    try {
        const response = await apiCall(`/assessments/${id}`);
        const assessment = response.data;
        
        editingId = id;
        
        // Populate form with existing data
        document.getElementById('editStudentName').value = assessment.studentName;
        document.getElementById('editClassName').value = assessment.className;
        document.getElementById('editWeekNumber').value = assessment.weekNumber || 1;
        document.getElementById('editTeacherId').value = assessment.teacherId;
        document.getElementById('editProgressNotes').value = assessment.progress_notes || '';
        
        // Populate all meeting scores for dropdowns
        // Meeting 1
        document.getElementById('editMeeting1_kehadiran').value = assessment.meeting1_kehadiran;
        document.getElementById('editMeeting1_membaca').value = assessment.meeting1_membaca;
        document.getElementById('editMeeting1_kosakata').value = assessment.meeting1_kosakata;
        document.getElementById('editMeeting1_pengucapan').value = assessment.meeting1_pengucapan;
        document.getElementById('editMeeting1_speaking').value = assessment.meeting1_speaking;
        
        // Meeting 2
        document.getElementById('editMeeting2_kehadiran').value = assessment.meeting2_kehadiran;
        document.getElementById('editMeeting2_membaca').value = assessment.meeting2_membaca;
        document.getElementById('editMeeting2_kosakata').value = assessment.meeting2_kosakata;
        document.getElementById('editMeeting2_pengucapan').value = assessment.meeting2_pengucapan;
        document.getElementById('editMeeting2_speaking').value = assessment.meeting2_speaking;
        
        // Meeting 3
        document.getElementById('editMeeting3_kehadiran').value = assessment.meeting3_kehadiran;
        document.getElementById('editMeeting3_membaca').value = assessment.meeting3_membaca;
        document.getElementById('editMeeting3_kosakata').value = assessment.meeting3_kosakata;
        document.getElementById('editMeeting3_pengucapan').value = assessment.meeting3_pengucapan;
        document.getElementById('editMeeting3_speaking').value = assessment.meeting3_speaking;
        
        // Load teachers for the edit form
        await loadTeachersForEdit();
        document.getElementById('editTeacherId').value = assessment.teacherId;
        
        // Show modal
        document.getElementById('editModal').classList.remove('hidden');
        
        showToast('Mode edit aktif. Semua nilai penilaian telah dimuat.');
    } catch (error) {
        console.error('Error loading assessment for edit:', error);
        showToast('Gagal memuat data untuk edit', 'error');
    }
}

// Delete assessment
async function deleteAssessment(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus penilaian ini?')) {
        return;
    }
    
    try {
        await apiCall(`/assessments/${id}`, {
            method: 'DELETE'
        });
        
        showToast('Penilaian berhasil dihapus');
        loadAssessments();
    } catch (error) {
        console.error('Error deleting assessment:', error);
    }
}

// Reset form
function resetForm() {
    assessmentForm.reset();
    editingId = null;
    document.getElementById('submitBtn').textContent = 'Simpan Penilaian';
}

// Close edit modal
function closeEditModal() {
    editModal.classList.add('hidden');
    resetForm();
}

// Show loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastMessageElement = document.getElementById('toastMessage');
    
    if (!toastElement || !toastMessageElement) {
        console.error('Toast elements not found');
        return;
    }
    
    toastMessageElement.textContent = message;
    
    const toastDiv = toastElement.querySelector('div');
    if (toastDiv) {
        toastDiv.className = `px-6 py-3 rounded-lg shadow-lg ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
    }
    
    toastElement.classList.remove('hidden');
    
    setTimeout(() => {
        toastElement.classList.add('hidden');
    }, 3000);
}

// Handle edit form submission
async function handleEditFormSubmit(e) {
    e.preventDefault();
    
    if (!editingId) {
        showToast('Error: No assessment selected for editing', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        // Collect form data from edit modal
        const formData = {
            studentName: document.getElementById('editStudentName').value,
            className: document.getElementById('editClassName').value,
            weekNumber: parseInt(document.getElementById('editWeekNumber').value),
            teacherId: parseInt(document.getElementById('editTeacherId').value),
            progressNotes: document.getElementById('editProgressNotes').value,
            pertemuan: [
                {
                    meeting: 1,
                    scores: {
                        kehadiran: parseInt(document.getElementById('editMeeting1_kehadiran').value) || 0,
                        membaca: parseInt(document.getElementById('editMeeting1_membaca').value) || 0,
                        kosakata: parseInt(document.getElementById('editMeeting1_kosakata').value) || 0,
                        pengucapan: parseInt(document.getElementById('editMeeting1_pengucapan').value) || 0,
                        speaking: parseInt(document.getElementById('editMeeting1_speaking').value) || 0
                    }
                },
                {
                    meeting: 2,
                    scores: {
                        kehadiran: parseInt(document.getElementById('editMeeting2_kehadiran').value) || 0,
                        membaca: parseInt(document.getElementById('editMeeting2_membaca').value) || 0,
                        kosakata: parseInt(document.getElementById('editMeeting2_kosakata').value) || 0,
                        pengucapan: parseInt(document.getElementById('editMeeting2_pengucapan').value) || 0,
                        speaking: parseInt(document.getElementById('editMeeting2_speaking').value) || 0
                    }
                },
                {
                    meeting: 3,
                    scores: {
                        kehadiran: parseInt(document.getElementById('editMeeting3_kehadiran').value) || 0,
                        membaca: parseInt(document.getElementById('editMeeting3_membaca').value) || 0,
                        kosakata: parseInt(document.getElementById('editMeeting3_kosakata').value) || 0,
                        pengucapan: parseInt(document.getElementById('editMeeting3_pengucapan').value) || 0,
                        speaking: parseInt(document.getElementById('editMeeting3_speaking').value) || 0
                    }
                }
            ]
        };
        
        // Debug logging
        console.log('Edit form data:', formData);
        console.log('Editing ID:', editingId);
        
        // Submit update
        const response = await apiCall(`/assessments/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        console.log('Update response:', response);
        
        showToast('Penilaian berhasil diperbarui!', 'success');
        closeEditModal();
        loadAssessments();
        
    } catch (error) {
        console.error('Error updating assessment:', error);
        showToast('Gagal memperbarui penilaian: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Make functions globally available
window.editAssessment = editAssessment;
window.deleteAssessment = deleteAssessment;
