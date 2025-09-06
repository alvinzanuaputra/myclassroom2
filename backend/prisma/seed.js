const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
  await prisma.teacher.deleteMany({});
  console.log('Data guru lama dihapus');

  // Insert data guru baru
  for (const teacher of teachers) {
    const createdTeacher = await prisma.teacher.create({
      data: teacher
    });
    console.log(`Guru ${createdTeacher.name} berhasil ditambahkan dengan ID: ${createdTeacher.id}`);
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
