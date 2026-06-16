# Full-Stack Web Calculator with Custom Python Engine

Aplikasi kalkulator berbasis web modern yang dibangun dengan arsitektur **Client-Server (Decoupled Architecture)**. Proyek ini memisahkan secara total komponen *Frontend* (User Interface) dan *Backend* (Computational Engine) yang terintegrasi secara *asynchronous* melalui RESTful API.

Berbeda dengan kalkulator web kasual yang mengandalkan fungsi instan bawaan seperti `eval()` di JavaScript—yang dianggap *bad practice* karena rentan terhadap celah keamanan *Remote Code Execution (RCE)*—proyek ini mengisolasi seluruh logika matematika di sisi server menggunakan **Custom Stack Interpreter Engine** yang dibangun sendiri dengan Python.

---

## 🌐 Live Demo
* **Frontend Application:** [https://kalkulator-sederhana-nine.vercel.app](https://kalkulator-sederhana-nine.vercel.app)
* **Backend API Endpoint:** [https://raffiakbrn.pythonanywhere.com/calculate](https://raffiakbrn.pythonanywhere.com/calculate)

---

## 🚀 Fitur Utama

* **Asynchronous Data Fetching & UX Status:** Menggunakan JavaScript `Fetch API` dengan penanganan *loading state* ("Calculating...") untuk memberikan pengalaman interaktif selagi menunggu respon dari server.
* **Custom Math Parser & Stack Engine:** Pemrosesan ekspresi matematika menggunakan konsep struktur data *Stack* (tumpukan) untuk mematuhi aturan hierarki aritmatika (operasi perkalian/pembagian dieksekusi terlebih dahulu sebelum penjumlahan/pengurangan).
* **Anti-Duplicate Operator Logic:** Sistem validasi di frontend yang mencegah pengguna memasukkan operator ganda berturut-turut (misal: `++` atau `×÷`).
* **Physical Keyboard Support:** Integrasi *event listener* penuh untuk navigasi lewat keyboard fisik (Angka, `.`, `+`, `-`, `*`, `/`, `%`, `Enter` untuk hitung, `Backspace` untuk hapus, dan `Escape` untuk *Clear*).
* **Responsive UI & Theme Switcher:** Tampilan minimalis yang *mobile-friendly*, dilengkapi fitur perpindahan tema (Dark/Light Mode) dan otomatis menggeser *scroll* layar ke kanan jika angka melebihi batas lebar layar.
* **Reverse-Chronological History Panel:** Menyimpan riwayat kalkulasi dalam basis data array lokal yang ditampilkan dari data terbaru di posisi paling atas.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Platform Hosting | Fitur Utama |
| :--- | :--- | :--- | :--- |
| **Frontend (Client)** | HTML5, CSS3, JavaScript (ES6+) | **Vercel** | DOM Manipulation, Keyboard Event, Fetch API |
| **Backend (Server)** | Python 3.x, Flask Framework | **PythonAnywhere** | RESTful API, CORS Management, Math Engine |

---

## 📊 Alur Arsitektur (Cara Kerja)

1. **Input Stage:** Pengguna menekan tombol di UI atau keyboard fisik. JavaScript memvalidasi runtunan karakter.
2. **Request Stage:** Saat tombol `=` ditekan, Frontend mengirimkan *payload* data JSON berisi string rumus ke Backend melalui metode `POST HTTP`.
3. **Parsing Stage (Server):** * String rumus dipecah menjadi token-token terpisah (*Tokenization*).
   * Token diproses lewat dua jalur tumpukan (*Double-Pass Stack*) untuk menghitung `*` dan `/` terlebih dahulu, dilanjutkan dengan `+` dan `-`.
4. **Response Stage:** Server mengembalikan hasil kalkulasi dalam bentuk JSON, diterima oleh fungsi `async/await` JavaScript, lalu dirender ke layar utama dan papan riwayat.

```text
[ Client: Vercel (JS) ]  -- POST JSON: {"expression": "12 + 5 × 2"} -->  [ Server: PythonAnywhere (Flask) ]
                                                                                   │
                                                                           [ Custom Stack Engine ]
                                                                                   │
[ Client: Render Screen ] <-- Return JSON: {"result": "22"} ----------             ▼


## Struktur Proyek
├── index.html          # Struktur antarmuka & layout kalkulator
├── style.css           # Desain tema, animasi, dan layout responsive (CSS Variables)
├── script.js          # Arsitektur Frontend, Keyboard Listener, & Async Fetch Engine
├── flask_app.py        # File Backend utama (Custom Math Engine & Flask API)
└── requirements.txt    # Daftar dependensi library Python (Flask, Flask-CORS)

## Menjalankan Secara Lokal:
git clone [https://github.com/raffiakbrn10/Kalkulator-Sederhana.git]([https://github.com/USERNAME_KAMU/NAMA_REPO_KAMU.git](https://github.com/raffiakbrn10/Kalkulator-Sederhana.git))
cd /Kalkulator-Sederhana

## Menjalankan Backend Python:
# Install library yang dibutuhkan
pip install -r requirements.txt

# Jalankan server lokal Flask
python flask_app.py
Catatan: Ubah variabel BACKEND_URL di script.js ke http://127.0.0.1:5000/calculate saat menguji coba secara lokal.

##🔒 Alasan Menggunakan Custom Engine (Bukan eval())
Dalam rekayasa perangkat lunak, penggunaan fungsi bawaan seperti eval() pada string input mentah dari pengguna sangat dihindari (Security Anti-Pattern). Jika proyek ini menggunakan eval(), pengguna bisa memasukkan kode berbahaya (misalnya perintah sistem operasi) yang dapat mengeksploitasi server atau browser.Dengan membangun Custom Stack Interpreter sendiri:Aman: Server hanya mengenali token angka dan 4 operator aritmatika murni. Input teks aneh lainnya otomatis diblokir dan menghasilkan status Error.Efisiensi: Menggunakan memori linear $O(n)$ untuk parsing token, menjadikannya sangat ringan untuk eksekusi skala server.
