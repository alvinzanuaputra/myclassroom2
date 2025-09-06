// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api';

// State management
let currentPage = 1;
let currentSearch = '';
let editingId = null;
let teachers = [];

// DOM Elements
const assessmentForm = document.getElementById('assessmentForm');
const editModal = document.getElementById('editModal');
const loadingSpinner = document.getElementById('loadingSpinner');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

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
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Pagination
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadAssessments();
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        currentPage++;
        loadAssessments();
    });
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
    
    // Modal close
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
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

// Load assessments data
async function loadAssessments() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            limit: 10,
            q: currentSearch
        });
        
        const response = await apiCall(`/assessments?${params}`);
        const { data: assessments, pagination } = response;
        
        renderAssessmentsTable(assessments);
        updatePagination(pagination);
    } catch (error) {
        console.error('Error loading assessments:', error);
    }
}

// Render assessments table
function renderAssessmentsTable(assessments) {
    const tbody = document.getElementById('assessmentTableBody');
    
    if (assessments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="px-4 py-8 text-center text-gray-500">
                    Tidak ada data penilaian
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = assessments.map((assessment, index) => {
        const rowNumber = (currentPage - 1) * 10 + index + 1;
        const categoryBadge = getCategoryBadge(assessment.category);
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${rowNumber}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.studentName}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.className}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.teacher.name}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.meeting1_total}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.meeting2_total}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.meeting3_total}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.total_weekly}</td>
                <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${assessment.average}</td>
                <td class="px-4 py-4 whitespace-nowrap">${categoryBadge}</td>
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
    }).join('');
}

// Get category badge HTML
function getCategoryBadge(category) {
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

// Get form data
function getFormData() {
    const studentName = document.getElementById('studentName').value;
    const className = document.getElementById('className').value;
    const teacherId = parseInt(document.getElementById('teacherId').value);
    const progressNotes = document.getElementById('progressNotes').value;
    
    const pertemuan = [];
    for (let i = 1; i <= 3; i++) {
        const scores = {
            kehadiran: parseInt(document.getElementById(`meeting${i}_kehadiran`).value),
            membaca: parseInt(document.getElementById(`meeting${i}_membaca`).value),
            kosakata: parseInt(document.getElementById(`meeting${i}_kosakata`).value),
            pengucapan: parseInt(document.getElementById(`meeting${i}_pengucapan`).value),
            speaking: parseInt(document.getElementById(`meeting${i}_speaking`).value)
        };
        
        pertemuan.push({
            meeting: i,
            scores
        });
    }
    
    return {
        studentName,
        className,
        teacherId,
        pertemuan,
        progressNotes
    };
}

// Search handler
function handleSearch() {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    loadAssessments();
}

// Edit assessment
async function editAssessment(id) {
    try {
        const response = await apiCall(`/assessments/${id}`);
        const assessment = response.data;
        
        editingId = id;
        
        // Populate form with existing data
        document.getElementById('studentName').value = assessment.studentName;
        document.getElementById('className').value = assessment.className;
        document.getElementById('teacherId').value = assessment.teacherId;
        document.getElementById('progressNotes').value = assessment.progress_notes || '';
        
        // Note: We would need to store individual scores to populate them
        // For now, we'll show a simplified edit form
        document.getElementById('submitBtn').textContent = 'Perbarui Penilaian';
        
        // Scroll to form
        document.getElementById('assessmentForm').scrollIntoView({ behavior: 'smooth' });
        
        showToast('Mode edit aktif. Silakan ubah data dan simpan.');
    } catch (error) {
        console.error('Error loading assessment for edit:', error);
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
    toastMessage.textContent = message;
    
    const toastDiv = toast.querySelector('div');
    toastDiv.className = `px-6 py-3 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Make functions globally available
window.editAssessment = editAssessment;
window.deleteAssessment = deleteAssessment;
