const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fungsi untuk menghitung kategori berdasarkan rata-rata
function calculateCategory(average) {
  if (average >= 21) return 'Sangat Baik';
  if (average >= 16) return 'Baik';
  if (average >= 11) return 'Cukup';
  if (average >= 6) return 'Kurang';
  return 'Sangat Kurang';
}

async function main() {
  console.log('Mulai seeding data guru...');

  // Data guru sesuai kelas
  const teachers = [
    { name: 'Zendaya Mareta', notes: 'Guru kelas 3A dan 3B' }, // index 0
    { name: 'Andrew Garfield', notes: 'Guru kelas 4A' },       // index 1
    { name: 'Tom Holland', notes: 'Guru kelas 4B' },           // index 2
    { name: 'Peter Parker', notes: 'Guru kelas 5A' },          // index 3
    { name: 'Crysten Dunst', notes: 'Guru kelas 5B' }          // index 4
  ];

  // Hapus data lama
  await prisma.studentAssessment.deleteMany({});
  await prisma.teacher.deleteMany({});
  console.log('Data lama dihapus');

  // Insert guru
  const createdTeachers = [];
  for (const teacher of teachers) {
    const createdTeacher = await prisma.teacher.create({ data: teacher });
    createdTeachers.push(createdTeacher);
    console.log(`Guru ${createdTeacher.name} berhasil ditambahkan (ID: ${createdTeacher.id})`);
  }

  console.log('Mulai seeding data siswa semua kelas...');

  const studentAssessments = [
    // --- Kelas 3A ---
    {
      studentName: 'Liam Carter',
      className: '3A',
      teacherId: createdTeachers[0].id, // Zendaya Mareta
      meeting1: { kehadiran: 5, membaca: 4, kosakata: 3, pengucapan: 4, speaking: 3 },
      meeting2: { kehadiran: 4, membaca: 4, kosakata: 4, pengucapan: 3, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 4, pengucapan: 4, speaking: 5 },
      progressNotes: 'Anak cukup aktif dan mulai berani berbicara.'
    },
    {
      studentName: 'Emma White',
      className: '3A',
      teacherId: createdTeachers[0].id,
      meeting1: { kehadiran: 4, membaca: 3, kosakata: 3, pengucapan: 3, speaking: 3 },
      meeting2: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      progressNotes: 'Ada perkembangan bagus dalam membaca.'
    },

    // --- Kelas 4A ---
    {
      studentName: 'Noah Harris',
      className: '4A',
      teacherId: createdTeachers[1].id, // Andrew Garfield
      meeting1: { kehadiran: 5, membaca: 5, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting2: { kehadiran: 4, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      progressNotes: 'Sangat rajin dan konsisten.'
    },
    {
      studentName: 'Mia Clark',
      className: '4A',
      teacherId: createdTeachers[1].id,
      meeting1: { kehadiran: 4, membaca: 3, kosakata: 3, pengucapan: 3, speaking: 3 },
      meeting2: { kehadiran: 4, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      progressNotes: 'Perlu lebih percaya diri saat berbicara.'
    },

    // --- Kelas 5A (Peter Parker) ---
    {
      studentName: 'James Smith',
      className: '5A',
      teacherId: createdTeachers[3].id,
      meeting1: { kehadiran: 5, membaca: 4, kosakata: 5, pengucapan: 4, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 5, kosakata: 4, pengucapan: 5, speaking: 5 },
      meeting3: { kehadiran: 0, membaca: 0, kosakata: 0, pengucapan: 0, speaking: 0 },
      progressNotes: 'Anak aktif dan cepat memahami materi.'
    },
    {
      studentName: 'Emily Johnson',
      className: '5A',
      teacherId: createdTeachers[3].id,
      meeting1: { kehadiran: 4, membaca: 4, kosakata: 3, pengucapan: 3, speaking: 3 },
      meeting2: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 0, membaca: 0, kosakata: 0, pengucapan: 0, speaking: 0 },
      progressNotes: 'Sudah menunjukkan perkembangan terutama dalam membaca.'
    },

    // --- Kelas 5B (Crysten Dunst) ---
    {
      studentName: 'Olivia Wilson',
      className: '5B',
      teacherId: createdTeachers[4].id,
      meeting1: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      meeting3: { kehadiran: 0, membaca: 0, kosakata: 0, pengucapan: 0, speaking: 0 },
      progressNotes: 'Sangat aktif dan jadi panutan.'
    },
    {
      studentName: 'Ethan Moore',
      className: '5B',
      teacherId: createdTeachers[4].id,
      meeting1: { kehadiran: 3, membaca: 2, kosakata: 2, pengucapan: 2, speaking: 2 },
      meeting2: { kehadiran: 4, membaca: 3, kosakata: 3, pengucapan: 3, speaking: 3 },
      meeting3: { kehadiran: 0, membaca: 0, kosakata: 0, pengucapan: 0, speaking: 0 },
      progressNotes: 'Butuh motivasi tambahan.'
    }
  ];

  // Insert data siswa
  for (const assessment of studentAssessments) {
    const meeting1Total = Object.values(assessment.meeting1).reduce((a, b) => a + b, 0);
    const meeting2Total = Object.values(assessment.meeting2).reduce((a, b) => a + b, 0);
    const meeting3Total = Object.values(assessment.meeting3).reduce((a, b) => a + b, 0);

    const totalWeekly = meeting1Total + meeting2Total + meeting3Total;
    const average = Number((totalWeekly / 3).toFixed(2));
    const category = calculateCategory(average);

    const createdAssessment = await prisma.studentAssessment.create({
      data: {
        studentName: assessment.studentName,
        className: assessment.className,
        teacherId: assessment.teacherId,

        meeting1_kehadiran: assessment.meeting1.kehadiran,
        meeting1_membaca: assessment.meeting1.membaca,
        meeting1_kosakata: assessment.meeting1.kosakata,
        meeting1_pengucapan: assessment.meeting1.pengucapan,
        meeting1_speaking: assessment.meeting1.speaking,
        meeting1_total: meeting1Total,

        meeting2_kehadiran: assessment.meeting2.kehadiran,
        meeting2_membaca: assessment.meeting2.membaca,
        meeting2_kosakata: assessment.meeting2.kosakata,
        meeting2_pengucapan: assessment.meeting2.pengucapan,
        meeting2_speaking: assessment.meeting2.speaking,
        meeting2_total: meeting2Total,

        meeting3_kehadiran: assessment.meeting3.kehadiran,
        meeting3_membaca: assessment.meeting3.membaca,
        meeting3_kosakata: assessment.meeting3.kosakata,
        meeting3_pengucapan: assessment.meeting3.pengucapan,
        meeting3_speaking: assessment.meeting3.speaking,
        meeting3_total: meeting3Total,

        total_weekly: totalWeekly,
        average,
        category,
        progress_notes: assessment.progressNotes
      }
    });

    console.log(`Penilaian ${createdAssessment.studentName} (${createdAssessment.className}) berhasil ditambahkan - Kategori: ${createdAssessment.category}`);
  }

  console.log('Seeding selesai!');
  console.log(`- ${createdTeachers.length} guru`);
  console.log(`- ${studentAssessments.length} penilaian siswa`);
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
