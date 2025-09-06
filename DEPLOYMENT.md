# 🚀 Panduan Deploy MyClassroom ke Vercel

## Prasyarat
- Akun GitHub
- Akun Vercel (gratis)
- Database Neon PostgreSQL (sudah ada)
- Git terinstall di komputer

## Langkah 1: Persiapan Repository GitHub

### 1.1 Inisialisasi Git Repository
```bash
# Di root directory project
git init
git add .
git commit -m "Initial commit: MyClassroom application"
```

### 1.2 Buat Repository di GitHub
1. Buka [GitHub](https://github.com)
2. Klik "New repository"
3. Nama repository: `myclassroom`
4. Set sebagai Public atau Private
5. Jangan centang "Initialize with README" (karena sudah ada)
6. Klik "Create repository"

### 1.3 Push ke GitHub
```bash
# Ganti <username> dengan username GitHub Anda
git remote add origin https://github.com/<username>/myclassroom.git
git branch -M main
git push -u origin main
```

## Langkah 2: Deploy ke Vercel

### 2.1 Login ke Vercel
1. Buka [Vercel](https://vercel.com)
2. Login dengan akun GitHub
3. Klik "New Project"

### 2.2 Import Repository
1. Pilih repository `myclassroom` dari GitHub
2. Klik "Import"

### 2.3 Konfigurasi Project
- **Framework Preset**: Other
- **Root Directory**: `./` (default)
- **Build Command**: `cd backend && npm install && npm run build`
- **Output Directory**: `frontend`
- **Install Command**: `cd backend && npm install`

### 2.4 Environment Variables
Tambahkan environment variables berikut di Vercel dashboard:

```
DATABASE_URL=postgresql://neondb_owner:npg_j4SKElB3oizN@ep-summer-grass-adc1qwop-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
```

**Cara menambahkan:**
1. Di project settings Vercel
2. Klik tab "Environment Variables"
3. Tambahkan setiap variable dengan value-nya
4. Klik "Add"

## Langkah 3: Deploy Database

### 3.1 Jalankan Migrasi Production
Setelah deploy pertama, jalankan migrasi database:

```bash
# Clone repository di komputer lain atau terminal baru
git clone https://github.com/<username>/myclassroom.git
cd myclassroom/backend

# Install dependencies
npm install

# Set environment variable untuk production
export DATABASE_URL="postgresql://neondb_owner:npg_j4SKElB3oizN@ep-summer-grass-adc1qwop-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Jalankan migrasi
npx prisma migrate deploy

# Seed data guru
npm run db:seed
```

### 3.2 Alternatif: Menggunakan Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy dengan environment variables
vercel --prod
```

## Langkah 4: Verifikasi Deployment

### 4.1 Test API Endpoints
Setelah deployment selesai, test endpoint berikut:

```bash
# Ganti <your-vercel-url> dengan URL Vercel Anda
curl https://<your-vercel-url>/api/health
curl https://<your-vercel-url>/api/teachers
curl https://<your-vercel-url>/api/classes
```

### 4.2 Test Frontend
1. Buka URL Vercel di browser
2. Test form input penilaian
3. Test search dan pagination
4. Test CRUD operations

## Langkah 5: Custom Domain (Opsional)

### 5.1 Tambah Domain
1. Di Vercel dashboard, buka project settings
2. Klik tab "Domains"
3. Tambahkan domain custom Anda
4. Ikuti instruksi DNS configuration

## Troubleshooting

### Error: "Module not found"
```bash
# Pastikan semua dependencies terinstall
cd backend && npm install
```

### Error: Database connection
- Pastikan DATABASE_URL benar di environment variables
- Cek koneksi Neon database masih aktif

### Error: CORS
- Sudah dikonfigurasi untuk production
- Vercel akan handle CORS secara otomatis

### Error: Build timeout
- Increase function timeout di vercel.json (sudah dikonfigurasi)

## File Konfigurasi yang Sudah Dibuat

✅ `vercel.json` - Konfigurasi deployment  
✅ `.gitignore` - File yang diabaikan Git  
✅ `backend/package.json` - Script build untuk Vercel  
✅ `frontend/assets/app.js` - API URL dinamis  
✅ `backend/src/server.js` - CORS untuk production  

## URL Setelah Deploy

Setelah berhasil deploy, Anda akan mendapat URL seperti:
- **Production**: `https://myclassroom-xyz123.vercel.app`
- **API**: `https://myclassroom-xyz123.vercel.app/api`

## Maintenance

### Update Aplikasi
```bash
# Setelah ada perubahan code
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main
# Vercel akan auto-deploy
```

### Monitor Logs
- Buka Vercel dashboard
- Pilih project
- Klik tab "Functions" untuk melihat logs API
- Klik tab "Deployments" untuk melihat status deployment

## Keamanan Production

✅ Environment variables aman di Vercel  
✅ HTTPS otomatis  
✅ CORS dikonfigurasi  
✅ Helmet.js untuk security headers  
✅ Input validation di backend  

---

**Selamat! MyClassroom Anda sudah live di internet! 🎉**
