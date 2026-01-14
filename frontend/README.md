Markdown

# Fullstack Web Developer - Technical Test Zegen

Proyek ini dikembangkan sebagai bagian dari proses seleksi Internship di Zegen. Aplikasi ini mencakup pengembangan **Backend API** dengan sistem autentikasi dan **Frontend App** yang mengimplementasikan manajemen data tabel.

---

## Tech Stack yang Digunakan

### **Frontend**
- **React.js** (Vite) - Framework utama.
- **TanStack Query (React Query)** - Digunakan untuk data fetching dan server-state management yang efisien.
- **TanStack Table (React Table)** - Digunakan untuk menangani tampilan data tabel yang kompleks secara headless.
- **Tailwind CSS** - Framework CSS untuk styling yang responsif dan modern.

### **Backend**
- **Node.js & Express** - Framework server-side.
- **JSON Web Token (JWT)** - Implementasi keamanan dan autentikasi user.
- **Bcrypt.js** - Untuk hashing password demi keamanan data user.
- **Swagger UI Express** - Sebagai alat dokumentasi API interaktif (OpenAPI).

---

## Fitur Aplikasi

1.  **Sistem Autentikasi**: Fitur Register dan Login dengan proteksi JWT.
2.  **Manajemen Tugas (Todo List)**: Endpoint CRUD untuk menambah dan melihat daftar tugas yang terproteksi oleh token.
3.  **Katalog Produk**: Menampilkan data dari API eksternal dengan fitur **Pagination** (Next & Previous) menggunakan TanStack Table.
4.  **Dokumentasi API Terpadu**: Dokumentasi lengkap yang dapat diuji langsung melalui Swagger UI.

---

## Instalasi dan Cara Menjalankan

### **1. Persiapan Awal**
Pastikan Anda sudah menginstal **Node.js** di perangkat Anda. Clone repository ini: 
```bash
git clone [https://github.com/username-anda/test-fullstack-zegen.git](https://github.com/fakhridwptra/test-fullstack-zegen.git)
cd test-fullstack-zegen
2. Menjalankan Backend
Bash

cd backend
npm install
node server.js
Server akan berjalan di: http://localhost:3000

Akses Swagger UI di: http://localhost:3000/api-docs

3. Menjalankan Frontend
Buka terminal baru:

Bash

cd frontend
npm install
npm run dev
Aplikasi dapat diakses di: http://localhost:5173 (atau port yang muncul di terminal).

Panduan Pengujian API (Swagger)
Buka /api-docs di browser.

Gunakan endpoint POST /register untuk membuat akun baru.

Gunakan endpoint POST /login untuk mendapatkan token.

Copy token tersebut, klik tombol "Authorize" di bagian atas Swagger, masukkan token, lalu klik Authorize.

Sekarang Anda dapat mengakses endpoint GET/POST /todos.