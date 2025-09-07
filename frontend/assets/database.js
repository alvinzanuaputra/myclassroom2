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
    refreshBtn.addEventListener('click', function() {
        // Add loading animation to refresh button
        const refreshIcon = document.getElementById('refreshIcon');
        const refreshSpinner = document.getElementById('refreshSpinner');
        const refreshText = document.getElementById('refreshText');
        
        // Show loading state
        refreshIcon.classList.add('hidden');
        refreshSpinner.classList.remove('hidden');
        refreshText.textContent = 'Refreshing...';
        refreshBtn.disabled = true;
        refreshBtn.classList.add('opacity-75', 'cursor-not-allowed');
        
        // Add pulse animation to statistics cards
        const statCards = document.querySelectorAll('[id$="Count"]').forEach(card => {
            card.parentElement.parentElement.classList.add('animate__animated', 'animate__pulse');
        });
        
        loadAllData().finally(() => {
            // Reset button state after loading
            setTimeout(() => {
                refreshIcon.classList.remove('hidden');
                refreshSpinner.classList.add('hidden');
                refreshText.textContent = 'Refresh Data';
                refreshBtn.disabled = false;
                refreshBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                
                // Remove pulse animation
                document.querySelectorAll('[id$="Count"]').forEach(card => {
                    card.parentElement.parentElement.classList.remove('animate__animated', 'animate__pulse');
                });
                
                // Add success animation
                refreshBtn.classList.add('animate__animated', 'animate__bounce');
                setTimeout(() => {
                    refreshBtn.classList.remove('animate__animated', 'animate__bounce');
                }, 1000);
            }, 500);
        });
    });
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

    teachersTableBody.innerHTML = teachers.map((teacher, index) => `
        <tr class="hover:bg-gray-50 transition-colors duration-200 animate__animated animate__fadeInUp" 
            data-teacher-id="${teacher.id}" 
            style="animation-delay: ${index * 0.1}s">
            <td class="pl-4 px-1 py-1 whitespace-nowrap text-sm text-gray-900">${teacher.id}</td>
            <td class="px-1 py-1 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                    <input type="text" 
                           value="${teacher.name}" 
                           class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 teacher-name-input transition-all duration-200 hover:bg-gray-50"
                           data-teacher-id="${teacher.id}">
                    <button class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded text-xs hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-md save-teacher-btn"
                            data-teacher-id="${teacher.id}">
                        💾 Save
                    </button>
                </div>
            </td>
            <td class="px-1 py-1 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📊 ${teacher._count?.assessments || 0} penilaian
                </span>
            </td>
        </tr>
    `).join('');

    // Add event listeners for save buttons
    document.querySelectorAll('.save-teacher-btn').forEach(button => {
        button.addEventListener('click', async function() {
            const teacherId = this.getAttribute('data-teacher-id');
            const input = document.querySelector(`input[data-teacher-id="${teacherId}"]`);
            const newName = input.value.trim();
            
            if (!newName) {
                showNotification('Nama guru tidak boleh kosong!', 'error');
                return;
            }
            
            // Add loading state to button
            const originalText = this.innerHTML;
            this.innerHTML = '⏳ Saving...';
            this.disabled = true;
            this.classList.add('opacity-75', 'cursor-not-allowed');
            
            try {
                const response = await fetch(`${API_BASE_URL}/teachers/${teacherId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newName })
                });
                
                const result = await response.json();
                console.log('Teacher update response:', result);
                
                if (result.success) {
                    showNotification('Nama guru berhasil diperbarui!', 'success');
                    // Add success animation to row
                    this.closest('tr').classList.add('animate__animated', 'animate__pulse');
                    setTimeout(() => {
                        this.closest('tr').classList.remove('animate__animated', 'animate__pulse');
                    }, 1000);
                } else {
                    showNotification(result.message || 'Gagal memperbarui nama guru', 'error');
                }
            } catch (error) {
                console.error('Error updating teacher:', error);
                showNotification('Terjadi kesalahan saat memperbarui nama guru', 'error');
            } finally {
                // Reset button state
                this.innerHTML = originalText;
                this.disabled = false;
                this.classList.remove('opacity-75', 'cursor-not-allowed');
            }
        });
    });
}

document.addEventListener('click', async function(e) {
    
    // Handle created date save button
    if (e.target.closest('.save-created-date-btn')) {
        const button = e.target.closest('.save-created-date-btn');
        const input = button.parentElement.querySelector('.created-date-input');
        const assessmentId = input.getAttribute('data-assessment-id');
        const newDate = input.value;
        
        if (!newDate) {
            alert('Tanggal tidak boleh kosong');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/timestamps`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    createdAt: new Date(newDate).toISOString()
                })
            });
            
            if (response.ok) {
                // Update the original value
                input.setAttribute('data-original-date', new Date(newDate).toISOString());
                // Show success notification
                showNotification('Tanggal dibuat berhasil diperbarui', 'success');
                // Show visual feedback on button
                button.style.color = '#10b981';
                setTimeout(() => {
                    button.style.color = '';
                }, 2000);
            } else {
                throw new Error('Failed to update created date');
            }
        } catch (error) {
            console.error('Error updating created date:', error);
            showNotification('Gagal mengupdate tanggal dibuat', 'error');
            // Reset to original value
            input.value = formatDateTimeForInput(input.getAttribute('data-original-date'));
        }
    }
    
    // Handle updated date save button
    if (e.target.closest('.save-updated-date-btn')) {
        const button = e.target.closest('.save-updated-date-btn');
        const input = button.parentElement.querySelector('.updated-date-input');
        const assessmentId = input.getAttribute('data-assessment-id');
        const newDate = input.value;
        
        if (!newDate) {
            alert('Tanggal tidak boleh kosong');
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/assessments/${assessmentId}/timestamps`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    updatedAt: new Date(newDate).toISOString()
                })
            });
            
            if (response.ok) {
                // Update the original value
                input.setAttribute('data-original-date', new Date(newDate).toISOString());
                // Show success notification
                showNotification('Tanggal diupdate berhasil diperbarui', 'success');
                // Show visual feedback on button
                button.style.color = '#10b981';
                setTimeout(() => {
                    button.style.color = '';
                }, 2000);
            } else {
                throw new Error('Failed to update updated date');
            }
        } catch (error) {
            console.error('Error updating updated date:', error);
            showNotification('Gagal mengupdate tanggal diupdate', 'error');
            // Reset to original value
            input.value = formatDateTimeForInput(input.getAttribute('data-original-date'));
        }
    }
});

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

    assessmentsTableBody.innerHTML = assessments.map((assessment, index) => {
        const categoryColor = getCategoryColor(assessment.category);
        const createdAt = new Date(assessment.createdAt).toLocaleDateString('id-ID');
        const updatedAt = new Date(assessment.updatedAt).toLocaleDateString('id-ID');
        
        return `
            <tr class="hover:bg-gray-50 transition-colors duration-200 animate__animated animate__fadeInUp" 
                style="animation-delay: ${index * 0.05}s">
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
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex items-center space-x-2">
                        <input type="datetime-local" 
                               value="${formatDateTimeForInput(assessment.createdAt)}" 
                               class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 created-date-input"
                               data-assessment-id="${assessment.id}"
                               data-original-date="${assessment.createdAt}">
                        <button class="save-created-date-btn p-1 text-gray-400 hover:text-blue-600 hover:border-blue-600 focus:outline-none border border-gray-300 rounded-md" 
                                title="Simpan perubahan tanggal dibuat">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex items-center space-x-2">
                        <input type="datetime-local" 
                               value="${formatDateTimeForInput(assessment.updatedAt)}" 
                               class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 updated-date-input"
                               data-assessment-id="${assessment.id}"
                               data-original-date="${assessment.updatedAt}">
                        <button class="save-updated-date-btn p-1 text-gray-400 hover:text-blue-600 hover:border-blue-600 focus:outline-none border border-gray-300 rounded-md" 
                                title="Simpan perubahan tanggal diupdate">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Format date for datetime-local input
function formatDateTimeForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format to YYYY-MM-DDTHH:MM format required by datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Show overlay notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification-overlay');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification overlay
    const notification = document.createElement('div');
    notification.className = 'notification-overlay fixed top-4 right-4 z-50 max-w-sm';
    
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 
        `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>` :
        `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>`;

    notification.innerHTML = `
        <div class="${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-slide-in">
            <div class="flex-shrink-0">
                ${icon}
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="flex-shrink-0 ml-2 text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

    // Add CSS animation styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            .animate-slide-in {
                animation: slide-in 0.3s ease-out;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
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
