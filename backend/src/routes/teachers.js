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

module.exports = router;
