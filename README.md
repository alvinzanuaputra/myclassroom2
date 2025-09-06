# MyClassroom - Rubrik Penilaian Guru

Aplikasi web responsif untuk mengelola penilaian siswa dengan sistem rubrik HRVPS (Kehadiran, Membaca, Kosakata, Pengucapan, Speaking). Aplikasi ini dirancang khusus untuk guru di R&S Corner dengan interface berbahasa Indonesia.

## 🚀 Fitur Utama

- **Form Input Penilaian**: Input skor HRVPS untuk 3 pertemuan per siswa
- **Perhitungan Otomatis**: Total mingguan, rata-rata, dan kategori dihitung secara otomatis
- **CRUD Lengkap**: Create, Read, Update, Delete data penilaian
- **Search & Pagination**: Pencarian berdasarkan nama siswa dengan pagination
- **Responsive Design**: Tampilan optimal di desktop dan mobile
- **Validasi Data**: Validasi skor 0-5 di frontend dan backend

## 📊 Sistem Penilaian

### Aspek Penilaian (HRVPS)
1. **Kehadiran** (0-5)
2. **Membaca** (0-5) 
3. **Kosakata** (0-5)
4. **Pengucapan** (0-5)
5. **Speaking** (0-5)

### Perhitungan
- **Total per Pertemuan**: Jumlah 5 aspek (maksimal 25)
- **Total Mingguan**: Jumlah 3 pertemuan (maksimal 75)
- **Rata-rata**: Total mingguan ÷ 3 (2 desimal)

### Kategori Berdasarkan Rata-rata
- **21-25**: Sangat Baik
- **16-20**: Baik
- **11-15**: Cukup
- **6-10**: Kurang
- **1-5**: Sangat Kurang

## 🛠️ Teknologi

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Deployment**: Siap untuk Vercel/Render

## 📁 Struktur Project

```
myclassroom/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js
│   │   ├── prismaClient.js
│   │   └── routes/
│   │       ├── assessments.js
│   │       └── teachers.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── .env.example
├── frontend/
│   ├── index.html
│   └── assets/
│       └── app.js
└── README.md
```

## ⚙️ Setup Lokal

### Prasyarat
- Node.js 18+ 
- PostgreSQL database (disarankan Neon)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd myclassroom
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Konfigurasi Database

1. Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```

2. Edit `.env` dan isi dengan connection string PostgreSQL Neon:
```env
DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
PORT=3000
NODE_ENV=development
```

### 4. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Jalankan migrasi database
npm run db:migrate
# ATAU untuk production:
# npm run db:push

# Seed data guru
npm run db:seed
```

### 5. Jalankan Backend
```bash
npm run dev
```
Backend akan berjalan di `http://localhost:3000`

### 6. Jalankan Frontend
Buka `frontend/index.html` di browser atau gunakan live server.

## 🌐 API Endpoints

### Assessments
- `GET /api/assessments` - List penilaian (dengan pagination & search)
- `GET /api/assessments/:id` - Detail penilaian
- `POST /api/assessments` - Buat penilaian baru
- `PUT /api/assessments/:id` - Update penilaian
- `DELETE /api/assessments/:id` - Hapus penilaian

### Teachers
- `GET /api/teachers` - List guru
- `GET /api/teachers/:id` - Detail guru

### Classes
- `GET /api/classes` - List kelas (3A, 3B, 4A, 4B, 5A, 5B)

## 📝 Contoh Request API

### POST /api/assessments
```bash
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Ahmad Rizki",
    "className": "3A",
    "teacherId": 1,
    "pertemuan": [
      {
        "meeting": 1,
        "scores": {
          "kehadiran": 5,
          "membaca": 4,
          "kosakata": 4,
          "pengucapan": 3,
          "speaking": 4
        }
      },
      {
        "meeting": 2,
        "scores": {
          "kehadiran": 5,
          "membaca": 4,
          "kosakata": 5,
          "pengucapan": 4,
          "speaking": 4
        }
      },
      {
        "meeting": 3,
        "scores": {
          "kehadiran": 5,
          "membaca": 5,
          "kosakata": 4,
          "pengucapan": 4,
          "speaking": 5
        }
      }
    ],
    "progressNotes": "Siswa menunjukkan perkembangan yang baik dalam speaking dan kosakata."
  }'
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "studentName": "Ahmad Rizki",
    "className": "3A",
    "teacherId": 1,
    "meeting1_total": 20,
    "meeting2_total": 22,
    "meeting3_total": 23,
    "total_weekly": 65,
    "average": 21.67,
    "category": "Sangat Baik",
    "progress_notes": "Siswa menunjukkan perkembangan yang baik dalam speaking dan kosakata.",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "teacher": {
      "id": 1,
      "name": "Bu Sari"
    }
  },
  "message": "Penilaian berhasil disimpan"
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Setup Vercel Project**
```bash
npm install -g vercel
vercel login
vercel
```

2. **Environment Variables**
Tambahkan di Vercel dashboard:
```
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```

3. **Deploy Database**
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Render

1. **Backend Service**
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`

2. **Frontend Static Site**
   - Build Command: `# No build needed`
   - Publish Directory: `frontend`

3. **Environment Variables**
```
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```

## 🧪 Testing

### Manual Testing
1. Buka aplikasi di browser
2. Test form input dengan data valid
3. Test validasi (skor di luar 0-5)
4. Test search dan pagination
5. Test edit dan delete

### Data Guru (Seeded)
- Bu Sari (ID: 1)
- Pak Budi (ID: 2)
- Bu Ani (ID: 3)
- Pak Deni (ID: 4)
- Bu Rina (ID: 5)

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Pastikan DATABASE_URL benar
echo $DATABASE_URL

# Reset database
npx prisma migrate reset
npm run db:seed
```

### CORS Error
Pastikan backend berjalan di port 3000 dan frontend mengakses URL yang benar.

### Prisma Error
```bash
# Regenerate client
npx prisma generate

# Reset dan migrate ulang
npx prisma migrate reset
```

## 📋 Acceptance Criteria

✅ **CRUD Lengkap**: Create, Read, Update, Delete penilaian  
✅ **Perhitungan Otomatis**: Total, rata-rata, kategori dihitung server  
✅ **UI Bahasa Indonesia**: Semua label, tombol, pesan dalam Bahasa Indonesia  
✅ **Data Tersimpan**: Semua data persist ke PostgreSQL (Neon)  
✅ **Responsive Design**: Tampilan optimal di mobile & desktop  
✅ **Validasi**: Skor 0-5, input required, error handling  
✅ **Search & Pagination**: Pencarian nama siswa dengan pagination  

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 Lisensi

MIT License - lihat file LICENSE untuk detail.

## 📞 Support

Jika mengalami masalah atau butuh bantuan:
1. Cek troubleshooting di atas
2. Buat issue di GitHub
3. Hubungi tim development

---

**MyClassroom** - Memudahkan guru dalam mengelola penilaian siswa dengan sistem rubrik yang terstruktur dan mudah digunakan.
