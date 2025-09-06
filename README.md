# 🎓 MyClassroom - Sistem Penilaian HRVPS

Sistem penilaian digital untuk rubrik HRVPS (Kehadiran, Membaca, Kosakata, Pengucapan, Speaking) yang membantu guru melakukan evaluasi pembelajaran bahasa secara komprehensif dan terstruktur.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Rumus Kalkulasi HRVPS](#-rumus-kalkulasi-hrvps)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

## ✨ Fitur Utama

### 🎯 **Penilaian HRVPS**
- **H** - Kehadiran (0-5)
- **R** - Membaca (0-5)  
- **V** - Kosakata (0-5)
- **P** - Pengucapan (0-5)
- **S** - Speaking (0-5)

### 📊 **Manajemen Data**
- ✅ Input penilaian per pertemuan (3 pertemuan/minggu)
- ✅ Kalkulasi otomatis total dan rata-rata
- ✅ Kategorisasi berdasarkan performa
- ✅ Pencarian dan filter data
- ✅ Pagination untuk data besar
- ✅ Edit dan hapus penilaian

### 👥 **Manajemen Pengguna**
- ✅ Data guru dan kelas
- ✅ Catatan perkembangan siswa
- ✅ Riwayat penilaian lengkap

### 🎨 **Interface Modern**
- ✅ Responsive design (mobile-friendly)
- ✅ Dark overlay modal untuk edit
- ✅ Toast notifications
- ✅ Loading states
- ✅ Form validation

## 🛠 Teknologi

### **Backend**
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **Prisma** - ORM database
- **PostgreSQL** - Database (Neon)
- **CORS** - Cross-origin resource sharing

### **Frontend**
- **HTML5** - Markup
- **CSS3** - Styling (Tailwind CSS)
- **JavaScript (ES6+)** - Logic
- **Fetch API** - HTTP requests

### **Database**
- **Neon PostgreSQL** - Cloud database
- **Prisma Schema** - Database modeling

## 🚀 Instalasi

### **Prasyarat**
- Node.js 16+
- npm atau yarn
- Database PostgreSQL (Neon)

### **Langkah Instalasi**

1. **Clone Repository**
```bash
git clone https://github.com/alvinzanuaputra/myclassroom2.git
cd myclassroom2
```

2. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend (jika diperlukan)
cd ../frontend
npm install
```

3. **Setup Environment**
```bash
# Backend/.env
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
NODE_ENV="development"
```

4. **Database Migration**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

`Error Handle Databases :`

```bash
cd backend
npx prisma migrate dev
npx prisma migrate reset --force
npm run db:seed
```

5. **Jalankan Aplikasi**
```bash
# Backend (Port 3000)
cd backend
npm start

# Frontend (Port 5000 atau Live Server)
cd frontend
# Buka index.html dengan Live Server
```

## 📊 Rumus Kalkulasi HRVPS

### **1. Komponen Penilaian (Per Pertemuan)**
```
H = Kehadiran (0-5)
R = Membaca (0-5)  
V = Kosakata (0-5)
P = Pengucapan (0-5)
S = Speaking (0-5)
```

### **2. Total Per Pertemuan**
```javascript
Total Pertemuan = H + R + V + P + S
// Maksimal: 25 poin per pertemuan
```

### **3. Total Mingguan**
```javascript
Total Mingguan = Pertemuan1 + Pertemuan2 + Pertemuan3
// Maksimal: 75 poin (25 × 3)
```

### **4. Rata-rata**
```javascript
Rata-rata = Total Mingguan ÷ 3
// Dibulatkan 2 desimal
```

### **5. Kategori Penilaian**
```javascript
function calculateCategory(average) {
  if (average >= 21) return 'Sangat Baik';    // 21-25 (84-100%)
  if (average >= 16) return 'Baik';           // 16-20 (64-80%)
  if (average >= 11) return 'Cukup';          // 11-15 (44-60%)
  if (average >= 6)  return 'Kurang';         // 6-10 (24-40%)
  return 'Sangat Kurang';                     // 1-5 (4-20%)
}
```

### **Contoh Perhitungan**

**Siswa: Ahmad**
| Pertemuan | H | R | V | P | S | Total |
|-----------|---|---|---|---|---|-------|
| 1         | 4 | 3 | 5 | 4 | 3 | **19** |
| 2         | 3 | 4 | 4 | 5 | 4 | **20** |
| 3         | 5 | 4 | 3 | 4 | 5 | **21** |

**Hasil:**
- **Total Mingguan:** 19 + 20 + 21 = **60**
- **Rata-rata:** 60 ÷ 3 = **20.00**
- **Kategori:** **Baik** (16-20 range)

## 📖 Panduan Penggunaan

### **1. Input Penilaian Baru**
1. Isi data siswa (nama, kelas, minggu, guru)
2. Pilih skor HRVPS untuk setiap pertemuan (0-5)
3. Tambahkan catatan perkembangan (opsional)
4. Klik "Simpan Penilaian Baru"

### **2. Edit Penilaian**
1. Klik tombol "Edit" pada tabel rekap
2. Modal edit akan terbuka dengan data terpopulasi
3. Ubah nilai yang diperlukan
4. Klik "Perbarui Penilaian"

### **3. Pencarian Data**
- Gunakan search box untuk mencari nama siswa
- Hasil akan difilter secara real-time

### **4. Navigasi Halaman**
- Gunakan tombol "Sebelumnya" dan "Selanjutnya"
- Informasi pagination ditampilkan di bawah tabel

## 🔌 API Endpoints

### **Assessments**
```
GET    /api/assessments          # Daftar penilaian (pagination, search)
POST   /api/assessments          # Buat penilaian baru
GET    /api/assessments/:id      # Detail penilaian
PUT    /api/assessments/:id      # Update penilaian
DELETE /api/assessments/:id      # Hapus penilaian
```

### **Teachers**
```
GET    /api/teachers             # Daftar guru
POST   /api/teachers             # Buat guru baru
```

### **Health Check**
```
GET    /api/health               # Status server
```

## 🗄 Database Schema

### **StudentAssessment**
```prisma
model StudentAssessment {
  id                    Int      @id @default(autoincrement())
  studentName           String
  className             String
  weekNumber            Int
  teacherId             Int
  
  // Meeting 1 scores
  meeting1_kehadiran    Int
  meeting1_membaca      Int
  meeting1_kosakata     Int
  meeting1_pengucapan   Int
  meeting1_speaking     Int
  meeting1_total        Int
  
  // Meeting 2 scores
  meeting2_kehadiran    Int
  meeting2_membaca      Int
  meeting2_kosakata     Int
  meeting2_pengucapan   Int
  meeting2_speaking     Int
  meeting2_total        Int
  
  // Meeting 3 scores
  meeting3_kehadiran    Int
  meeting3_membaca      Int
  meeting3_kosakata     Int
  meeting3_pengucapan   Int
  meeting3_speaking     Int
  meeting3_total        Int
  
  // Calculated fields
  total_weekly          Int
  average               Float
  category              String
  progress_notes        String?
  
  // Relations
  teacher               Teacher  @relation(fields: [teacherId], references: [id])
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

### **Teacher**
```prisma
model Teacher {
  id          Int                 @id @default(autoincrement())
  name        String
  notes       String?
  assessments StudentAssessment[]
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push code ke GitHub
2. Connect repository di Vercel
3. Set environment variables
4. Deploy otomatis

### **Environment Variables**
```env
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
NODE_ENV=production
```

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap.

## 🎯 Fitur Khusus

### **Nilai 0 (Belum)**
- Aspek yang tidak dinilai otomatis bernilai 0
- Label "Belum" untuk indikasi belum ada penilaian
- Tidak mempengaruhi perhitungan negatif

### **Fleksibilitas Input**
- Form tidak wajib diisi semua (non-required)
- Guru bisa mengisi sebagian aspek
- Sistem tetap menghitung dengan nilai yang ada

### **Modal Edit**
- Dark overlay untuk fokus editing
- Multiple cara close (X, Cancel, ESC, click outside)
- Form terpopulasi otomatis dengan data existing

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet compatibility
- ✅ Desktop optimization
- ✅ Touch-friendly interface

## 🔒 Keamanan

- ✅ Input validation (frontend & backend)
- ✅ SQL injection protection (Prisma ORM)
- ✅ CORS configuration
- ✅ Environment variables untuk sensitive data

## 📈 Statistik Sistem

- Total Guru: Dinamis
- Total Penilaian: Real-time count
- Kelas Aktif: Berdasarkan data
- Rata-rata Skor: Kalkulasi otomatis

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 👨‍💻 Developer

**Tim Pengembang MyClassroom**
- Backend: Node.js + Express + Prisma
- Frontend: HTML + CSS + JavaScript
- Database: PostgreSQL (Neon)
- Deployment: Vercel

## 📞 Kontak & Support

My Website : https://alvinzanuaputra.vercel.app/contact

Email : zanuaputraalvin123@gmail.com

---

**MyClassroom v1.0** - Sistem Penilaian HRVPS Digital 🎓
