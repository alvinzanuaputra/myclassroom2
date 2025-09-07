import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load variabel dari .env
load_dotenv()

# Ambil DATABASE_URL dari .env
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("❌ DATABASE_URL tidak ditemukan di file .env")

# Buat koneksi
engine = create_engine(DATABASE_URL)

# Folder output
output_dir = "./frontend/assets/database"
os.makedirs(output_dir, exist_ok=True)

# Ambil data dari tabel
df_teacher = pd.read_sql('SELECT * FROM "Teacher"', engine)
df_student = pd.read_sql('SELECT * FROM "StudentAssessment"', engine)
df_migrations = pd.read_sql('SELECT * FROM "_prisma_migrations"', engine)

# Hilangkan timezone di datetime (biar bisa export ke Excel)
for col in df_migrations.select_dtypes(include=["datetimetz"]).columns:
    df_migrations[col] = df_migrations[col].dt.tz_localize(None)

# Simpan ke Excel (multi-sheet agar rapi)
# output_file = f"{output_dir}/backup_all.xlsx"
output_file = f"{output_dir}/backup_all2.xlsx"
# output_file = f"{output_dir}/backup_all3.xlsx"
# output_file = f"{output_dir}/backup_all4.xlsx"
# output_file = f"{output_dir}/backup_all5.xlsx"
# output_file = f"{output_dir}/backup_all6.xlsx"
# output_file = f"{output_dir}/backup_all7.xlsx"
# output_file = f"{output_dir}/backup_all8.xlsx"
# output_file = f"{output_dir}/backup_all9.xlsx"
# output_file = f"{output_dir}/backup_all10.xlsx"


with pd.ExcelWriter(output_file) as writer:
    df_teacher.to_excel(writer, sheet_name="Teacher", index=False)
    df_student.to_excel(writer, sheet_name="StudentAssessment", index=False)
    df_migrations.to_excel(writer, sheet_name="_prisma_migrations", index=False)

print(f"✅ Semua tabel berhasil diexport ke {output_file}")
