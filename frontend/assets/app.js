// Configuration
const API_BASE_URL =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : window.location.origin + '/api'

console.log('Frontend API Base URL:', API_BASE_URL)

// State management
let currentSearch = ''
let editingId = null
let teachers = []
let assessments = []

// Class grouping configuration with specific ordering: 3A-3B-4A-4B-5A-5B
const CLASS_GROUPS = {
  '3A': {
    name: 'Kelas 3A',
    color: 'bg-green-50 border-l-4 border-green-400',
    headerColor: 'bg-green-100 text-green-800',
    priority: 1
  },
  '3B': {
    name: 'Kelas 3B',
    color: 'bg-green-50 border-l-4 border-green-500',
    headerColor: 'bg-green-100 text-green-800',
    priority: 2
  },
  '4A': {
    name: 'Kelas 4A',
    color: 'bg-blue-50 border-l-4 border-blue-400',
    headerColor: 'bg-blue-100 text-blue-800',
    priority: 3
  },
  '4B': {
    name: 'Kelas 4B',
    color: 'bg-blue-50 border-l-4 border-blue-500',
    headerColor: 'bg-blue-100 text-blue-800',
    priority: 4
  },
  '5A': {
    name: 'Kelas 5A',
    color: 'bg-purple-50 border-l-4 border-purple-400',
    headerColor: 'bg-purple-100 text-purple-800',
    priority: 5
  },
  '5B': {
    name: 'Kelas 5B',
    color: 'bg-purple-50 border-l-4 border-purple-500',
    headerColor: 'bg-purple-100 text-purple-800',
    priority: 6
  }
}

// DOM Elements
const assessmentForm = document.getElementById('assessmentForm')
const editModal = document.getElementById('editModal')
const loadingSpinner = document.getElementById('loadingSpinner')
const toast = document.getElementById('toast')
const toastMessage = document.getElementById('toastMessage')
const assessmentTableBody = document.getElementById('assessmentTableBody')
const searchInput = document.getElementById('searchInput')

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
  loadTeachers()
  loadAssessments()
  setupEventListeners()
  setupClassFilters()
  setupClassChangeHandler()
})

// Setup class change handler
function setupClassChangeHandler () {
  // Removed class-specific logic
}

// Removed all meeting 3 toggle functions

// Event Listeners
function setupEventListeners () {
  assessmentForm.addEventListener('submit', handleFormSubmit)

  document.getElementById('searchBtn').addEventListener('click', handleSearch)
  searchInput.addEventListener('input', handleSearch)
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  })

  document.getElementById('cancelBtn').addEventListener('click', resetForm)

  // Modal event listeners
  const closeModalBtn = document.getElementById('closeModalBtn')
  const cancelEditBtn = document.getElementById('cancelEditBtn')
  const editForm = document.getElementById('editForm')

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeEditModal)
  }

  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditModal)
  }

  if (editModal) {
    editModal.addEventListener('click', function (e) {
      if (e.target === editModal) {
        closeEditModal()
      }
    })
  }

  document.addEventListener('keydown', function (e) {
    if (
      e.key === 'Escape' &&
      editModal &&
      !editModal.classList.contains('hidden')
    ) {
      closeEditModal()
    }
  })

  if (editForm) {
    editForm.addEventListener('submit', handleEditFormSubmit)
  }
}

// API Functions
async function apiCall (endpoint, options = {}) {
  try {
    showLoading(true)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(data.message || 'Terjadi kesalahan')
      error.response = data
      error.status = response.status
      console.error('API Error:', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        response: data
      })
      throw error
    }

    return data
  } catch (error) {
    console.error('API Call Error:', {
      endpoint,
      error: error.message,
      response: error.response,
      stack: error.stack
    })
    showToast(error.message || 'Terjadi kesalahan', 'error')
    throw error
  } finally {
    showLoading(false)
  }
}

// Load teachers data
async function loadTeachers () {
  try {
    const response = await apiCall('/teachers')
    teachers = response.data

    const teacherSelect = document.getElementById('teacherId')
    teacherSelect.innerHTML = '<option value="">Pilih Guru</option>'

    teachers.forEach(teacher => {
      const option = document.createElement('option')
      option.value = teacher.id
      option.textContent = teacher.name
      teacherSelect.appendChild(option)
    })
  } catch (error) {
    console.error('Error loading teachers:', error)
  }
}

// Load teachers data for edit form
async function loadTeachersForEdit (selectedTeacherId = null) {
  try {
    const response = await apiCall('/teachers')
    teachers = response.data

    const teacherSelect = document.getElementById('editTeacherId')
    teacherSelect.innerHTML = '<option value="">Pilih Guru</option>'

    teachers.forEach(teacher => {
      const option = document.createElement('option')
      option.value = teacher.id
      option.textContent = teacher.name
      // Set selected attribute if this is the teacher we want to select
      if (
        selectedTeacherId &&
        teacher.id.toString() === selectedTeacherId.toString()
      ) {
        option.selected = true
      }
      teacherSelect.appendChild(option)
    })

    return teachers
  } catch (error) {
    console.error('Error loading teachers for edit:', error)
    showToast('Gagal memuat data guru', 'error')
    return []
  }
}

// Load assessments data
async function loadAssessments (search = '') {
  try {
    const params = new URLSearchParams({
      q: search
    })

    const response = await apiCall(`/assessments?${params}`)
    const { data: assessmentsData } = response

    assessments = assessmentsData
    displayAssessments(assessmentsData)

    currentSearch = search
  } catch (error) {
    console.error('Error loading assessments:', error)
  }
}

// Calculate attendance percentage with different logic for class levels
function calculateAttendancePercentage (assessment) {
  if (!assessment || !assessment.className) return '0.0'

  // Determine if this is class 5 (only 2 meetings) or class 3-4 (3 meetings)
  const isClass5 =
    assessment.className === '5A' || assessment.className === '5B'
  const maxMeetings = isClass5 ? 2 : 3
  const maxPossibleScore = 25 * maxMeetings // 50 for class 5, 75 for class 3-4

  let totalScore = 0

  for (let i = 1; i <= maxMeetings; i++) {
    const meetingTotal = assessment[`meeting${i}_total`] || 0
    totalScore += Math.min(25, Math.max(0, meetingTotal)) // Ensure value is between 0-25
  }

  // Calculate percentage relative to the maximum possible for that class type
  const percentage =
    maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0

  return percentage.toFixed(1)
}

// Enhanced display function with better class grouping
function displayAssessments (data) {
  const tbody = assessmentTableBody

  if (data.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="14" class="px-4 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p class="text-lg font-medium text-gray-900">Tidak ada data penilaian</p>
                        <p class="text-sm text-gray-500">Mulai tambahkan penilaian siswa</p>
                    </div>
                </td>
            </tr>
        `
    return
  }

  // Group and sort data by specific class order (3A-3B-4A-4B-5A-5B)
  const groupedData = groupAssessmentsByClass(data)
  let tableHTML = ''

  // Process each class group in the specified order (3A-3B-4A-4B-5A-5B)
  Object.keys(groupedData)
    .sort(
      (a, b) =>
        (CLASS_GROUPS[a]?.priority || 99) - (CLASS_GROUPS[b]?.priority || 99)
    )
    .forEach(className => {
      const group = groupedData[className]
      const classConfig = CLASS_GROUPS[className] || {
        name: `Kelas ${className}`,
        color: 'bg-gray-50 border-l-4 border-gray-400',
        headerColor: 'bg-gray-100 text-gray-800'
      }

      const totalStudents = group.assessments.length
      const averageAttendance = calculateGroupAverageAttendance(
        group.assessments
      )

      tableHTML += `
                <tr class="${classConfig.color}">
                    <td colspan="14" class="px-6 py-4">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="text-lg font-bold ${
                                  classConfig.headerColor.split(' ')[1]
                                } mb-1">
                                    ${classConfig.name}
                                </h3>
                                <p class="text-sm text-gray-600">
                                    ${totalStudents} siswa • 3 pertemuan/minggu
                                    • Rata-rata kehadiran: ${averageAttendance}%
                                </p>
                            </div>
                            <div class="flex gap-2">
                                <span class="px-3 py-1 text-xs font-medium ${
                                  classConfig.headerColor
                                } rounded-full">
                                    ${totalStudents} Penilaian
                                </span>
                            </div>
                        </div>
                    </td>
                </tr>
            `

      // Add individual assessment rows for this class
      group.assessments.forEach((assessment, index) => {
        tableHTML += createAssessmentRow(assessment, index, classConfig)
      })

      // Add spacing between class groups
      tableHTML += `
                <tr class="bg-gray-50">
                    <td colspan="14" class="py-2"></td>
                </tr>
            `
    })

  tbody.innerHTML = tableHTML
}

// Group assessments by specific class names (3A, 3B, 4A, 4B, 5A, 5B)
function groupAssessmentsByClass (data) {
  const grouped = {}

  data.forEach(assessment => {
    // Use the full className (3A, 3B, 4A, 4B, 5A, 5B)
    const className = assessment.className || 'Other'

    if (!grouped[className]) {
      grouped[className] = {
        className,
        assessments: []
      }
    }

    grouped[className].assessments.push(assessment)
  })

  // Sort assessments within each group by week number and student name
  Object.values(grouped).forEach(group => {
    group.assessments.sort((a, b) => {
      if (a.weekNumber !== b.weekNumber) {
        return a.weekNumber - b.weekNumber
      }
      return a.studentName.localeCompare(b.studentName)
    })
  })

  return grouped
}

// Calculate group average attendance
function calculateGroupAverageAttendance (assessments) {
  if (assessments.length === 0) return '0.0'

  const totalPercentage = assessments.reduce((sum, assessment) => {
    return sum + parseFloat(calculateAttendancePercentage(assessment))
  }, 0)

  return (totalPercentage / assessments.length).toFixed(1)
}

// Calculate average score for a group
function calculateGroupAverage (assessments) {
  if (assessments.length === 0) return '0.0'

  const totalAverage = assessments.reduce((sum, assessment) => {
    return sum + (parseFloat(assessment.average) || 0)
  }, 0)

  return (totalAverage / assessments.length).toFixed(1)
}

// Create individual assessment row
function createAssessmentRow (assessment, index, classConfig) {
  const attendancePercentage = calculateAttendancePercentage(assessment)
  const isClass5 =
    assessment.className === '5A' || assessment.className === '5B'

  const meeting1Scores = `${assessment.meeting1_kehadiran}-${assessment.meeting1_membaca}-${assessment.meeting1_kosakata}-${assessment.meeting1_pengucapan}-${assessment.meeting1_speaking} (${assessment.meeting1_total})`
  const meeting2Scores = `${assessment.meeting2_kehadiran}-${assessment.meeting2_membaca}-${assessment.meeting2_kosakata}-${assessment.meeting2_pengucapan}-${assessment.meeting2_speaking} (${assessment.meeting2_total})`
  const meeting3Scores = isClass5
    ? 'Tidak Ada Kelas'
    : `${assessment.meeting3_kehadiran}-${assessment.meeting3_membaca}-${assessment.meeting3_kosakata}-${assessment.meeting3_pengucapan}-${assessment.meeting3_speaking} (${assessment.meeting3_total})`

  return `
        <tr class="hover:bg-gray-50 ${
          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        } border-l-4 ${classConfig.color.split(' ').pop()}">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${
              index + 1
            }</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">${
              assessment.studentName
            }</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Minggu ${assessment.weekNumber || 1}
                </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${
              assessment.className
            }</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${
              assessment.teacherName
            }</td>
            <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-mono bg-gray-50">${meeting1Scores}</td>
            <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-mono bg-gray-50">${meeting2Scores}</td>
            <td class="px-4 py-3 whitespace-nowrap text-xs text-gray-600 font-mono bg-gray-50">${meeting3Scores}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">${
              assessment.total_weekly
            }</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-600">${
              assessment.average
            }</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-bold ${
              attendancePercentage >= 80
                ? 'text-green-600'
                : attendancePercentage >= 60
                ? 'text-yellow-600'
                : 'text-red-600'
            }">
                <div class="flex items-center gap-1">
                    <span>${attendancePercentage}%</span>
                    ${
                      attendancePercentage >= 80
                        ? '<svg class="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'
                        : attendancePercentage >= 60
                        ? '<svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>'
                        : '<svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
                    }
                </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">${categoryBadge(
              assessment.category
            )}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-center">
                <button onclick="showAssessmentDetail(${
                  assessment.id
                })" class="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors" title="Lihat detail lengkap">
                    <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Detail
                </button>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                    <button onclick="editAssessment(${
                      assessment.id
                    })" class="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors">
                        Edit
                    </button>
                    <button onclick="deleteAssessment(${
                      assessment.id
                    })" class="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                        Hapus
                    </button>
                </div>
            </td>
        </tr>
    `
}

// Get category badge HTML (enhanced)
function categoryBadge (category) {
  const badges = {
    'Sangat Baik': 'bg-green-100 text-green-800 border border-green-200',
    Baik: 'bg-blue-100 text-blue-800 border border-blue-200',
    Cukup: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    Kurang: 'bg-orange-100 text-orange-800 border border-orange-200',
    'Sangat Kurang': 'bg-red-100 text-red-800 border border-red-200'
  }

  const badgeClass =
    badges[category] || 'bg-gray-100 text-gray-800 border border-gray-200'

  return `
        <span class="px-2 py-1 text-xs leading-4 font-semibold rounded-full ${badgeClass}">
            ${category}
        </span>
    `
}

// Get form data
function getFormData () {
  const studentName = document.getElementById('studentName').value
  const className = document.getElementById('className').value
  const weekNumber = parseInt(document.getElementById('weekNumber').value)
  const teacherId = parseInt(document.getElementById('teacherId').value)
  const progressNotes = document.getElementById('progressNotes').value

  const pertemuan = []
  for (let i = 1; i <= 3; i++) {
    const scores = {
      kehadiran:
        parseInt(document.getElementById(`meeting${i}_kehadiran`).value) || 0,
      membaca:
        parseInt(document.getElementById(`meeting${i}_membaca`).value) || 0,
      kosakata:
        parseInt(document.getElementById(`meeting${i}_kosakata`).value) || 0,
      pengucapan:
        parseInt(document.getElementById(`meeting${i}_pengucapan`).value) || 0,
      speaking:
        parseInt(document.getElementById(`meeting${i}_speaking`).value) || 0
    }

    pertemuan.push({ meeting: i, scores })
  }

  return {
    studentName,
    className,
    weekNumber,
    teacherId,
    pertemuan,
    progress_notes: progressNotes
  }
}

// Form submission handler
async function handleFormSubmit (e) {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  try {
    const formData = getFormData()

    if (editingId) {
      await apiCall(`/assessments/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })
      showToast(`Penilaian berhasil diperbarui`)
      closeEditModal()
    } else {
      await apiCall('/assessments', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      showToast(`Penilaian berhasil disimpan`)
    }

    resetForm()
    loadAssessments()
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

// Search handler
function handleSearch () {
  const searchTerm = searchInput.value.trim()
  loadAssessments(searchTerm)
}

// Edit assessment
async function editAssessment (id) {
  try {
    const response = await apiCall(`/assessments/${id}`)
    const assessment = response.data
    editingId = id

    // Load teachers and set the selected teacher
    await loadTeachersForEdit(assessment.teacherId)

    // Populate form fields
    document.getElementById('editStudentName').value =
      assessment.studentName || ''
    document.getElementById('editClassName').value = assessment.className || ''
    document.getElementById('editWeekNumber').value = assessment.weekNumber || 1
    document.getElementById('editProgressNotes').value =
      assessment.progress_notes || ''

    // Populate meeting scores from database fields - uniform for all classes
    for (let i = 1; i <= 3; i++) {
      const kehadiran = assessment[`meeting${i}_kehadiran`]
      const membaca = assessment[`meeting${i}_membaca`]
      const kosakata = assessment[`meeting${i}_kosakata`]
      const pengucapan = assessment[`meeting${i}_pengucapan`]
      const speaking = assessment[`meeting${i}_speaking`]

      // Set the dropdown values
      const kehadiranEl = document.getElementById(`editMeeting${i}_kehadiran`)
      const membacaEl = document.getElementById(`editMeeting${i}_membaca`)
      const kosakatEl = document.getElementById(`editMeeting${i}_kosakata`)
      const pengucapanEl = document.getElementById(`editMeeting${i}_pengucapan`)
      const speakingEl = document.getElementById(`editMeeting${i}_speaking`)

      if (kehadiranEl && kehadiran !== undefined && kehadiran !== null) {
        kehadiranEl.value = kehadiran.toString()
      }
      if (membacaEl && membaca !== undefined && membaca !== null) {
        membacaEl.value = membaca.toString()
      }
      if (kosakatEl && kosakata !== undefined && kosakata !== null) {
        kosakatEl.value = kosakata.toString()
      }
      if (pengucapanEl && pengucapan !== undefined && pengucapan !== null) {
        pengucapanEl.value = pengucapan.toString()
      }
      if (speakingEl && speaking !== undefined && speaking !== null) {
        speakingEl.value = speaking.toString()
      }
    }

    // Show the modal
    document.getElementById('editModal').classList.remove('hidden')
  } catch (error) {
    console.error('Error loading assessment for edit:', error)
    showToast('Gagal memuat data penilaian', 'error')
  }
}

// Delete assessment
async function deleteAssessment (id) {
  if (!confirm('Apakah Anda yakin ingin menghapus penilaian ini?')) {
    return
  }

  try {
    await apiCall(`/assessments/${id}`, { method: 'DELETE' })
    showToast('Penilaian berhasil dihapus')
    loadAssessments()
  } catch (error) {
    console.error('Error deleting assessment:', error)
  }
}

// Reset form
function resetForm () {
  assessmentForm.reset()
  editingId = null
  document.getElementById('submitBtn').textContent = 'Simpan Penilaian'
}

// Close edit modal
function closeEditModal () {
  editModal.classList.add('hidden')
  resetForm()
}

// Show loading spinner
function showLoading (show) {
  if (show) {
    loadingSpinner.classList.remove('hidden')
  } else {
    loadingSpinner.classList.add('hidden')
  }
}

// Show toast notification
function showToast (message, type = 'success') {
  const toastElement = document.getElementById('toast')
  const toastMessageElement = document.getElementById('toastMessage')

  if (!toastElement || !toastMessageElement) {
    console.error('Toast elements not found')
    return
  }

  toastMessageElement.textContent = message

  const toastDiv = toastElement.querySelector('div')
  if (toastDiv) {
    toastDiv.className = `px-6 py-3 rounded-lg shadow-lg ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`
  }

  toastElement.classList.remove('hidden')
  setTimeout(() => {
    toastElement.classList.add('hidden')
  }, 3000)
}

// Handle edit form submission
async function handleEditFormSubmit (e) {
  e.preventDefault()

  if (!editingId) {
    showToast('Tidak ada data yang dipilih untuk diedit', 'error')
    return
  }

  try {
    showLoading(true)

    // Get form values
    const studentName = document.getElementById('editStudentName')?.value.trim()
    const className = document.getElementById('editClassName')?.value
    const weekNumber = parseInt(
      document.getElementById('editWeekNumber')?.value
    )
    const teacherId = document.getElementById('editTeacherId')?.value
    const progressNotes = document.getElementById('editProgressNotes')?.value

    // Manual validation
    if (!studentName) {
      showToast('Nama siswa harus diisi', 'error')
      showLoading(false)
      return
    }

    if (!className) {
      showToast('Kelas harus dipilih', 'error')
      showLoading(false)
      return
    }

    if (!weekNumber || isNaN(weekNumber) || weekNumber < 1) {
      showToast('Minggu ke harus diisi dengan angka lebih dari 0', 'error')
      showLoading(false)
      return
    }

    if (!teacherId) {
      showToast('Guru harus dipilih', 'error')
      showLoading(false)
      return
    }

    // Prepare form data
    const formData = {
      studentName,
      className,
      weekNumber,
      teacherId: parseInt(teacherId),
      progress_notes: progressNotes
    }

    // Collect meeting scores in the format expected by backend
    formData.meeting1_kehadiran =
      parseInt(document.getElementById('editMeeting1_kehadiran')?.value) || 0
    formData.meeting1_membaca =
      parseInt(document.getElementById('editMeeting1_membaca')?.value) || 0
    formData.meeting1_kosakata =
      parseInt(document.getElementById('editMeeting1_kosakata')?.value) || 0
    formData.meeting1_pengucapan =
      parseInt(document.getElementById('editMeeting1_pengucapan')?.value) || 0
    formData.meeting1_speaking =
      parseInt(document.getElementById('editMeeting1_speaking')?.value) || 0

    formData.meeting2_kehadiran =
      parseInt(document.getElementById('editMeeting2_kehadiran')?.value) || 0
    formData.meeting2_membaca =
      parseInt(document.getElementById('editMeeting2_membaca')?.value) || 0
    formData.meeting2_kosakata =
      parseInt(document.getElementById('editMeeting2_kosakata')?.value) || 0
    formData.meeting2_pengucapan =
      parseInt(document.getElementById('editMeeting2_pengucapan')?.value) || 0
    formData.meeting2_speaking =
      parseInt(document.getElementById('editMeeting2_speaking')?.value) || 0

    formData.meeting3_kehadiran =
      parseInt(document.getElementById('editMeeting3_kehadiran')?.value) || 0
    formData.meeting3_membaca =
      parseInt(document.getElementById('editMeeting3_membaca')?.value) || 0
    formData.meeting3_kosakata =
      parseInt(document.getElementById('editMeeting3_kosakata')?.value) || 0
    formData.meeting3_pengucapan =
      parseInt(document.getElementById('editMeeting3_pengucapan')?.value) || 0
    formData.meeting3_speaking =
      parseInt(document.getElementById('editMeeting3_speaking')?.value) || 0

    // Send the update request
    await apiCall(`/assessments/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    showToast('Penilaian berhasil diperbarui', 'success')
    closeEditModal()
    loadAssessments()
  } catch (error) {
    console.error('Error updating assessment:', error)
    showToast(
      'Gagal memperbarui penilaian: ' + (error.message || 'Terjadi kesalahan'),
      'error'
    )
  } finally {
    showLoading(false)
  }
}

// Setup class filters (enhanced for specific class filtering)
function setupClassFilters () {
  // Add filter buttons for each class if they don't exist
  const filterContainer = document.getElementById('classFilters')
  if (!filterContainer) return

  const specificClasses = ['3A', '3B', '4A', '4B', '5A', '5B']
  filterContainer.innerHTML = `
        <div class="flex flex-wrap gap-2 mb-4">
            <button onclick="filterByClass('all')" class="filter-btn active px-4 py-2 text-sm font-medium rounded-lg border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                Semua Kelas
            </button>
            ${specificClasses
              .map(className => {
                const config = CLASS_GROUPS[className]
                return `
                    <button onclick="filterByClass('${className}')" class="filter-btn px-4 py-2 text-sm font-medium rounded-lg border-2 ${config.color} hover:opacity-80 transition-colors">
                        ${config.name}
                    </button>
                `
              })
              .join('')}
        </div>
        <div class="text-sm text-gray-600 mb-4">
            <span class="font-medium">Keterangan:</span>
            <span class="ml-2">Kelas 3 & 4: 3 pertemuan/minggu (max 75)</span>
            <span class="mx-2">•</span>
            <span>Kelas 5: 2 pertemuan/minggu (max 50)</span>
            <span class="mx-2">•</span>
            <span>Persentase kehadiran untuk perbandingan yang setara</span>
        </div>
    `
}

// Filter assessments by specific class name
function filterByClass (className) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-blue-500', 'text-white')
    btn.classList.add('bg-white', 'text-gray-700')
  })

  event.target.classList.remove('bg-white', 'text-gray-700')
  event.target.classList.add('active', 'bg-blue-500', 'text-white')

  // Filter data
  if (className === 'all') {
    displayAssessments(assessments)
  } else {
    const filtered = assessments.filter(
      assessment => assessment.className === className
    )
    displayAssessments(filtered)
  }
}

// Enhanced validation for form inputs
function validateForm (prefix = '') {
  // For edit form, we need to add 'edit' prefix to the element IDs
  const idPrefix = prefix === 'edit' ? 'edit' : ''

  const studentName = document
    .getElementById(`${idPrefix}studentName`)
    ?.value.trim()
  const className = document.getElementById(`${idPrefix}className`)?.value
  const weekNumber = document.getElementById(`${idPrefix}weekNumber`)?.value
  const teacherId = document.getElementById(`${idPrefix}teacherId`)?.value

  if (!studentName) {
    showToast('Nama siswa harus diisi', 'error')
    return false
  }

  if (!className) {
    showToast('Kelas harus dipilih', 'error')
    return false
  }

  if (!weekNumber || isNaN(weekNumber) || weekNumber < 1) {
    showToast('Minggu ke harus diisi dengan angka lebih dari 0', 'error')
    return false
  }

  if (!teacherId) {
    showToast('Guru harus dipilih', 'error')
    return false
  }

  // Validate meeting scores for all 3 meetings
  for (let i = 1; i <= 3; i++) {
    const kehadiran =
      parseInt(
        document.getElementById(`${idPrefix}Meeting${i}_kehadiran`)?.value
      ) || 0
    const membaca =
      parseInt(
        document.getElementById(`${idPrefix}Meeting${i}_membaca`)?.value
      ) || 0
    const kosakata =
      parseInt(
        document.getElementById(`${idPrefix}Meeting${i}_kosakata`)?.value
      ) || 0
    const pengucapan =
      parseInt(
        document.getElementById(`${idPrefix}Meeting${i}_pengucapan`)?.value
      ) || 0
    const speaking =
      parseInt(
        document.getElementById(`${idPrefix}Meeting${i}_speaking`)?.value
      ) || 0

    if (kehadiran < 0 || kehadiran > 5) {
      showToast(`Pertemuan ${i}: Nilai kehadiran harus 0-5`, 'error')
      return false
    }

    if (membaca < 0 || membaca > 5) {
      showToast(`Pertemuan ${i}: Nilai membaca harus 0-5`, 'error')
      return false
    }

    if (kosakata < 0 || kosakata > 5) {
      showToast(`Pertemuan ${i}: Nilai kosakata harus 0-5`, 'error')
      return false
    }

    if (pengucapan < 0 || pengucapan > 5) {
      showToast(`Pertemuan ${i}: Nilai pengucapan harus 0-5`, 'error')
      return false
    }

    if (speaking < 0 || speaking > 5) {
      showToast(`Pertemuan ${i}: Nilai speaking harus 0-5`, 'error')
      return false
    }
  }

  return true
}

// Enhanced form submit with validation
async function handleFormSubmit (e) {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  try {
    const formData = getFormData()

    if (editingId) {
      await apiCall(`/assessments/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      })
      showToast(`Penilaian berhasil diperbarui`)
      closeEditModal()
    } else {
      await apiCall('/assessments', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      showToast(`Penilaian berhasil disimpan`)
    }

    resetForm()
    loadAssessments()
  } catch (error) {
    console.error('Error submitting form:', error)
  }
}

// Assessment Detail Modal Functions
async function showAssessmentDetail (id) {
  try {
    const response = await apiCall(`/assessments/${id}`)
    const assessment = response.data

    // Populate student info
    document.getElementById('detailStudentName').textContent =
      assessment.studentName || ''
    document.getElementById('detailClassName').textContent =
      assessment.className || ''
    document.getElementById('detailWeekNumber').textContent =
      assessment.weekNumber || ''
    document.getElementById('detailTeacher').textContent =
      assessment.teacher?.name || ''

    // Populate meeting details
    for (let i = 1; i <= 3; i++) {
      const kehadiran = assessment[`meeting${i}_kehadiran`] || 0
      const membaca = assessment[`meeting${i}_membaca`] || 0
      const kosakata = assessment[`meeting${i}_kosakata`] || 0
      const pengucapan = assessment[`meeting${i}_pengucapan`] || 0
      const speaking = assessment[`meeting${i}_speaking`] || 0

      document.getElementById(`detailMeeting${i}Kehadiran`).textContent =
        getScoreLabel(kehadiran)
      document.getElementById(`detailMeeting${i}Membaca`).textContent =
        getScoreLabel(membaca)
      document.getElementById(`detailMeeting${i}Kosakata`).textContent =
        getScoreLabel(kosakata)
      document.getElementById(`detailMeeting${i}Pengucapan`).textContent =
        getScoreLabel(pengucapan)
      document.getElementById(`detailMeeting${i}Speaking`).textContent =
        getScoreLabel(speaking)
    }

    // Populate summary
    document.getElementById('detailTotalWeekly').textContent =
      assessment.total_weekly || '0'
    document.getElementById('detailAverage').textContent =
      assessment.average || '0'
    document.getElementById('detailPercentage').textContent =
      calculateAttendancePercentage(assessment) + '%'
    document.getElementById('detailCategory').textContent =
      assessment.category || ''

    // Populate progress notes
    const progressNotes =
      assessment.progress_notes || 'Tidak ada catatan perkembangan.'
    document.getElementById('detailProgressNotes').textContent = progressNotes

    // Show modal
    document.getElementById('detailModal').classList.remove('hidden')
  } catch (error) {
    console.error('Error loading assessment detail:', error)
    showToast('Gagal memuat detail penilaian', 'error')
  }
}

function closeDetailModal () {
  document.getElementById('detailModal').classList.add('hidden')
}

function getScoreLabel (score) {
  const labels = {
    0: 'Belum',
    1: '1. Sangat Kurang',
    2: '2. Kurang',
    3: '3. Cukup',
    4: '4. Baik',
    5: '5. Baik Sekali'
  }
  return labels[score] || 'Belum'
}

// Make functions globally available
window.editAssessment = editAssessment
window.deleteAssessment = deleteAssessment
window.filterByClass = filterByClass
window.showAssessmentDetail = showAssessmentDetail
window.closeDetailModal = closeDetailModal
