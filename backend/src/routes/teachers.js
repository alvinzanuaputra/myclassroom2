const express = require('express');
const prisma = require('../prismaClient');

const router = express.Router();

// GET /api/teachers - Mendapatkan daftar semua guru
router.get('/', async (req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        _count: {
          select: {
            assessments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Transform the data to include assessmentCount
    const teachersWithCount = teachers.map(teacher => ({
      ...teacher,
      assessmentCount: teacher._count.assessments
    }));

    res.json({
      success: true,
      data: teachersWithCount,
      message: 'Data guru berhasil diambil'
    });
  } catch (error) {
    console.error('Error mengambil data guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data guru'
    });
  }
});

// GET /api/teachers/:id - Mendapatkan detail guru berdasarkan ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: teacher,
      message: 'Detail guru berhasil diambil'
    });
  } catch (error) {
    console.error('Error mengambil detail guru:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail guru'
    });
  }
});

// PUT /api/teachers/:id - Mengupdate data guru
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nama guru tidak valid'
      });
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim()
      }
    });

    res.json({
      success: true,
      data: updatedTeacher,
      message: 'Data guru berhasil diperbarui'
    });
  } catch (error) {
    console.error('Error updating teacher:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Guru tidak ditemukan'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data guru'
    });
  }
});

module.exports = router;
