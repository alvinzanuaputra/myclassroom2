const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

// Fungsi untuk menghitung kategori berdasarkan rata-rata
function calculateCategory(average) {
  if (average >= 21) return 'Sangat Baik';
  if (average >= 16) return 'Baik';
  if (average >= 11) return 'Cukup';
  if (average >= 6) return 'Kurang';
  return 'Sangat Kurang';
}

// Fungsi untuk validasi skor
function validateScores(scores) {
  const aspects = ['kehadiran', 'membaca', 'kosakata', 'pengucapan', 'speaking'];
  for (const aspect of aspects) {
    const score = scores[aspect];
    if (typeof score !== 'number' || score < 1 || score > 5 || !Number.isInteger(score)) {
      return false;
    }
  }
  return true;
}

// Fungsi untuk menghitung total per pertemuan
function calculateMeetingTotal(scores) {
  return scores.kehadiran + scores.membaca + scores.kosakata + scores.pengucapan + scores.speaking;
}

// GET /api/assessments - Mendapatkan daftar penilaian dengan pagination dan search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, q = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = q ? {
      studentName: {
        contains: q,
        mode: 'insensitive'
      }
    } : {};

    const [assessments, total] = await Promise.all([
      prisma.studentAssessment.findMany({
        where,
        include: {
          teacher: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.studentAssessment.count({ where })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: assessments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      message: 'Data penilaian berhasil diambil'
    });
  } catch (error) {
    console.error('Error mengambil data penilaian:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data penilaian'
    });
  }
});

// GET /api/assessments/:id - Mendapatkan detail penilaian
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await prisma.studentAssessment.findUnique({
      where: { id: parseInt(id) },
      include: {
        teacher: true
      }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Data penilaian tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: assessment,
      message: 'Detail penilaian berhasil diambil'
    });
  } catch (error) {
    console.error('Error mengambil detail penilaian:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail penilaian'
    });
  }
});

// POST /api/assessments - Membuat penilaian baru
router.post('/', async (req, res) => {
  try {
    const { studentName, className, teacherId, pertemuan, progressNotes } = req.body;

    // Validasi input dasar
    if (!studentName || !className || !teacherId || !pertemuan || !Array.isArray(pertemuan)) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Pastikan semua field terisi dengan benar.'
      });
    }

    if (pertemuan.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Data pertemuan harus berisi 3 pertemuan'
      });
    }

    // Validasi guru exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Validasi kelas
    const validClasses = ['3A', '3B', '4A', '4B', '5A', '5B'];
    if (!validClasses.includes(className)) {
      return res.status(400).json({
        success: false,
        message: 'Kelas tidak valid'
      });
    }

    // Validasi dan hitung skor per pertemuan
    const meetingTotals = [];
    const meetingScores = {};
    
    for (let i = 0; i < 3; i++) {
      const meeting = pertemuan[i];
      if (meeting.meeting !== i + 1) {
        return res.status(400).json({
          success: false,
          message: `Data pertemuan ${i + 1} tidak valid`
        });
      }

      if (!validateScores(meeting.scores)) {
        return res.status(400).json({
          success: false,
          message: `Skor pada pertemuan ${i + 1} tidak valid. Semua skor harus berupa angka bulat 1-5.`
        });
      }

      const total = calculateMeetingTotal(meeting.scores);
      meetingTotals.push(total);
      
      // Store individual scores
      meetingScores[`meeting${i + 1}_kehadiran`] = meeting.scores.kehadiran;
      meetingScores[`meeting${i + 1}_membaca`] = meeting.scores.membaca;
      meetingScores[`meeting${i + 1}_kosakata`] = meeting.scores.kosakata;
      meetingScores[`meeting${i + 1}_pengucapan`] = meeting.scores.pengucapan;
      meetingScores[`meeting${i + 1}_speaking`] = meeting.scores.speaking;
      meetingScores[`meeting${i + 1}_total`] = total;
    }

    // Hitung total mingguan dan rata-rata
    const totalWeekly = meetingTotals.reduce((sum, total) => sum + total, 0);
    const average = Number((totalWeekly / 3).toFixed(2));
    const category = calculateCategory(average);

    // Simpan ke database
    const assessment = await prisma.studentAssessment.create({
      data: {
        studentName,
        className,
        teacherId: parseInt(teacherId),
        ...meetingScores,
        total_weekly: totalWeekly,
        average,
        category,
        progress_notes: progressNotes || null
      },
      include: {
        teacher: true
      }
    });

    res.status(201).json({
      success: true,
      data: assessment,
      message: 'Penilaian berhasil disimpan'
    });
  } catch (error) {
    console.error('Error membuat penilaian:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menyimpan penilaian'
    });
  }
});

// PUT /api/assessments/:id - Update penilaian
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { studentName, className, teacherId, pertemuan, progressNotes } = req.body;

    // Cek apakah assessment exists
    const existingAssessment = await prisma.studentAssessment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Data penilaian tidak ditemukan'
      });
    }

    // Validasi input dasar
    if (!studentName || !className || !teacherId || !pertemuan || !Array.isArray(pertemuan)) {
      return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Pastikan semua field terisi dengan benar.'
      });
    }

    if (pertemuan.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Data pertemuan harus berisi 3 pertemuan'
      });
    }

    // Validasi guru exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(teacherId) }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    // Validasi kelas
    const validClasses = ['3A', '3B', '4A', '4B', '5A', '5B'];
    if (!validClasses.includes(className)) {
      return res.status(400).json({
        success: false,
        message: 'Kelas tidak valid'
      });
    }

    // Validasi dan hitung skor per pertemuan
    const meetingTotals = [];
    const meetingScores = {};
    
    for (let i = 0; i < 3; i++) {
      const meeting = pertemuan[i];
      if (meeting.meeting !== i + 1) {
        return res.status(400).json({
          success: false,
          message: `Data pertemuan ${i + 1} tidak valid`
        });
      }

      if (!validateScores(meeting.scores)) {
        return res.status(400).json({
          success: false,
          message: `Skor pada pertemuan ${i + 1} tidak valid. Semua skor harus berupa angka bulat 1-5.`
        });
      }

      const total = calculateMeetingTotal(meeting.scores);
      meetingTotals.push(total);
      
      // Store individual scores
      meetingScores[`meeting${i + 1}_kehadiran`] = meeting.scores.kehadiran;
      meetingScores[`meeting${i + 1}_membaca`] = meeting.scores.membaca;
      meetingScores[`meeting${i + 1}_kosakata`] = meeting.scores.kosakata;
      meetingScores[`meeting${i + 1}_pengucapan`] = meeting.scores.pengucapan;
      meetingScores[`meeting${i + 1}_speaking`] = meeting.scores.speaking;
      meetingScores[`meeting${i + 1}_total`] = total;
    }

    // Hitung total mingguan dan rata-rata
    const totalWeekly = meetingTotals.reduce((sum, total) => sum + total, 0);
    const average = Number((totalWeekly / 3).toFixed(2));
    const category = calculateCategory(average);

    // Update database
    const assessment = await prisma.studentAssessment.update({
      where: { id: parseInt(id) },
      data: {
        studentName,
        className,
        teacherId: parseInt(teacherId),
        ...meetingScores,
        total_weekly: totalWeekly,
        average,
        category,
        progress_notes: progressNotes || null
      },
      include: {
        teacher: true
      }
    });

    res.json({
      success: true,
      data: assessment,
      message: 'Penilaian berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error mengupdate penilaian:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui penilaian'
    });
  }
});

// DELETE /api/assessments/:id - Hapus penilaian
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah assessment exists
    const existingAssessment = await prisma.studentAssessment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAssessment) {
      return res.status(404).json({
        success: false,
        message: 'Data penilaian tidak ditemukan'
      });
    }

    // Hapus assessment
    await prisma.studentAssessment.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Penilaian berhasil dihapus'
    });
  } catch (error) {
    console.error('Error menghapus penilaian:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus penilaian'
    });
  }
});

module.exports = router;
