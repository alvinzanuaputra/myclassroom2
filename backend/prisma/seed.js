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

  // Data guru sesuai spesifikasi
  const teachers = [
    { name: 'Bu Sari', notes: 'Guru kelas 3A dan 3B' },
    { name: 'Pak Budi', notes: 'Guru kelas 4A' },
    { name: 'Bu Ani', notes: 'Guru kelas 4B' },
    { name: 'Pak Deni', notes: 'Guru kelas 5A' },
    { name: 'Bu Rina', notes: 'Guru kelas 5B' }
  ];

  // Hapus data lama jika ada
  await prisma.studentAssessment.deleteMany({});
  await prisma.teacher.deleteMany({});
  console.log('Data lama dihapus');

  // Insert data guru baru
  const createdTeachers = [];
  for (const teacher of teachers) {
    const createdTeacher = await prisma.teacher.create({
      data: teacher
    });
    createdTeachers.push(createdTeacher);
    console.log(`Guru ${createdTeacher.name} berhasil ditambahkan dengan ID: ${createdTeacher.id}`);
  }

  console.log('Mulai seeding data penilaian siswa...');

  // Data contoh penilaian siswa
  const studentAssessments = [
    {
      studentName: 'Ahmad Rizki',
      className: '3A',
      teacherId: 1, // Bu Sari
      meeting1: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 3, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 4, kosakata: 5, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 4, pengucapan: 4, speaking: 5 },
      progressNotes: 'Siswa menunjukkan perkembangan yang baik dalam speaking dan kosakata.'
    },
    {
      studentName: 'Siti Nurhaliza',
      className: '3A',
      teacherId: 1, // Bu Sari
      meeting1: { kehadiran: 5, membaca: 5, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 4, speaking: 5 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      progressNotes: 'Siswa sangat aktif dan menunjukkan kemampuan yang sangat baik di semua aspek.'
    },
    {
      studentName: 'Budi Santoso',
      className: '3B',
      teacherId: 1, // Bu Sari
      meeting1: { kehadiran: 4, membaca: 3, kosakata: 3, pengucapan: 3, speaking: 3 },
      meeting2: { kehadiran: 4, membaca: 4, kosakata: 3, pengucapan: 3, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      progressNotes: 'Siswa menunjukkan peningkatan bertahap, perlu lebih banyak latihan pengucapan.'
    },
    {
      studentName: 'Dewi Lestari',
      className: '4A',
      teacherId: 2, // Pak Budi
      meeting1: { kehadiran: 5, membaca: 4, kosakata: 5, pengucapan: 4, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 4, speaking: 5 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      progressNotes: 'Siswa sangat berprestasi dan konsisten dalam semua aspek pembelajaran.'
    },
    {
      studentName: 'Andi Wijaya',
      className: '4A',
      teacherId: 2, // Pak Budi
      meeting1: { kehadiran: 3, membaca: 3, kosakata: 2, pengucapan: 2, speaking: 2 },
      meeting2: { kehadiran: 4, membaca: 3, kosakata: 3, pengucapan: 3, speaking: 3 },
      meeting3: { kehadiran: 4, membaca: 4, kosakata: 3, pengucapan: 3, speaking: 3 },
      progressNotes: 'Siswa perlu bimbingan ekstra, terutama dalam kosakata dan speaking.'
    },
    {
      studentName: 'Maya Sari',
      className: '4B',
      teacherId: 3, // Bu Ani
      meeting1: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 4, pengucapan: 4, speaking: 4 },
      progressNotes: 'Siswa stabil dan konsisten, menunjukkan kemampuan yang baik.'
    },
    {
      studentName: 'Rudi Hermawan',
      className: '5A',
      teacherId: 4, // Pak Deni
      meeting1: { kehadiran: 4, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 4 },
      meeting2: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      progressNotes: 'Siswa memiliki kemampuan luar biasa, dapat menjadi contoh untuk teman-teman.'
    },
    {
      studentName: 'Fitri Ramadhani',
      className: '5A',
      teacherId: 4, // Pak Deni
      meeting1: { kehadiran: 5, membaca: 3, kosakata: 4, pengucapan: 3, speaking: 3 },
      meeting2: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      meeting3: { kehadiran: 5, membaca: 4, kosakata: 4, pengucapan: 4, speaking: 4 },
      progressNotes: 'Siswa rajin hadir dan menunjukkan peningkatan yang konsisten.'
    },
    {
      studentName: 'Joko Susilo',
      className: '5B',
      teacherId: 5, // Bu Rina
      meeting1: { kehadiran: 3, membaca: 2, kosakata: 2, pengucapan: 2, speaking: 2 },
      meeting2: { kehadiran: 3, membaca: 3, kosakata: 2, pengucapan: 2, speaking: 3 },
      meeting3: { kehadiran: 4, membaca: 3, kosakata: 3, pengucapan: 3, speaking: 3 },
      progressNotes: 'Siswa memerlukan perhatian khusus dan motivasi tambahan untuk meningkatkan partisipasi.'
    },
    {
      studentName: 'Indah Permata',
      className: '5B',
      teacherId: 5, // Bu Rina
      meeting1: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 4, speaking: 5 },
      meeting2: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      meeting3: { kehadiran: 5, membaca: 5, kosakata: 5, pengucapan: 5, speaking: 5 },
      progressNotes: 'Siswa sangat berprestasi dan dapat membantu teman-teman yang kesulitan.'
    }
  ];

  // Insert data penilaian siswa
  for (const assessment of studentAssessments) {
    const meeting1Total = assessment.meeting1.kehadiran + assessment.meeting1.membaca + assessment.meeting1.kosakata + assessment.meeting1.pengucapan + assessment.meeting1.speaking;
    const meeting2Total = assessment.meeting2.kehadiran + assessment.meeting2.membaca + assessment.meeting2.kosakata + assessment.meeting2.pengucapan + assessment.meeting2.speaking;
    const meeting3Total = assessment.meeting3.kehadiran + assessment.meeting3.membaca + assessment.meeting3.kosakata + assessment.meeting3.pengucapan + assessment.meeting3.speaking;
    
    const totalWeekly = meeting1Total + meeting2Total + meeting3Total;
    const average = Number((totalWeekly / 3).toFixed(2));
    const category = calculateCategory(average);

    const createdAssessment = await prisma.studentAssessment.create({
      data: {
        studentName: assessment.studentName,
        className: assessment.className,
        teacherId: assessment.teacherId,
        
        // Meeting 1 scores
        meeting1_kehadiran: assessment.meeting1.kehadiran,
        meeting1_membaca: assessment.meeting1.membaca,
        meeting1_kosakata: assessment.meeting1.kosakata,
        meeting1_pengucapan: assessment.meeting1.pengucapan,
        meeting1_speaking: assessment.meeting1.speaking,
        meeting1_total: meeting1Total,
        
        // Meeting 2 scores
        meeting2_kehadiran: assessment.meeting2.kehadiran,
        meeting2_membaca: assessment.meeting2.membaca,
        meeting2_kosakata: assessment.meeting2.kosakata,
        meeting2_pengucapan: assessment.meeting2.pengucapan,
        meeting2_speaking: assessment.meeting2.speaking,
        meeting2_total: meeting2Total,
        
        // Meeting 3 scores
        meeting3_kehadiran: assessment.meeting3.kehadiran,
        meeting3_membaca: assessment.meeting3.membaca,
        meeting3_kosakata: assessment.meeting3.kosakata,
        meeting3_pengucapan: assessment.meeting3.pengucapan,
        meeting3_speaking: assessment.meeting3.speaking,
        meeting3_total: meeting3Total,
        
        total_weekly: totalWeekly,
        average: average,
        category: category,
        progress_notes: assessment.progressNotes
      }
    });
    
    console.log(`Penilaian ${createdAssessment.studentName} (${createdAssessment.className}) berhasil ditambahkan - Kategori: ${createdAssessment.category}`);
  }

  console.log('Seeding selesai! Total data:');
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
