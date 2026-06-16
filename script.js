const currentDisplay = document.getElementById('current-display');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const historyToggle = document.getElementById('history-toggle');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const themeToggle = document.getElementById('theme-toggle');
const buttons = document.querySelectorAll('.btn, .btn.operator-equal');

// Konfigurasi URL API Backend Python
// Hubungkan ke http://127.0.0.1:5000/calculate saat uji coba lokal di laptop
// Ganti dengan URL dari Render (misal: https://kalkulator-backend.onrender.com/calculate) saat deploy live
const BACKEND_URL = "https://raffiakbrn.pythonanywhere.com/calculate";

let currentInput = '0';
let isEvaluated = false;
let calculationsHistory = []; // Menyimpan basis data riwayat struktur objek

// 1. Theme Switcher
let isDark = false;
themeToggle.addEventListener('click', () => {
    isDark = !isDark;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

// 2. Tampilkan/Sembunyikan Panel Riwayat
historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('open');
    historyToggle.textContent = historyPanel.classList.contains('open') ? '❌' : '📜';
});

// 3. Hapus Semua Data Riwayat
clearHistoryBtn.addEventListener('click', () => {
    calculationsHistory = [];
    renderHistoryList();
});

// 4. Integrasi Event Listener Klik
buttons.forEach(button => {
    button.addEventListener('click', () => {
        processInput(button.getAttribute('data-value'), button.getAttribute('data-action'));
    });
});

// 5. Integrasi Event Listener Keyboard fisik
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') processInput(e.key, null);
    if (e.key === '.') processInput('.', null);
    if (e.key === '+') processInput('+', null);
    if (e.key === '-') processInput('-', null);
    if (e.key === '*') processInput('×', null);
    if (e.key === '/') processInput('÷', null);
    if (e.key === '%') processInput(null, 'percent');
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); processInput(null, 'calculate'); }
    if (e.key === 'Backspace' && !historyPanel.classList.contains('open')) processInput(null, 'backspace');
    if (e.key === 'Escape') processInput(null, 'clear');
});

// 6. Mesin Pengolah Alur Input (Engine Logic)
function processInput(value, action) {
    const operators = ['+', '-', '×', '÷'];
    const lastChar = currentInput.trim().slice(-1);

    if (action === 'clear') {
        currentInput = '0';
        isEvaluated = false;
    } 
    else if (action === 'backspace') {
        if (isEvaluated) {
            currentInput = '0';
            isEvaluated = false;
        } else {
            if (lastChar === ' ') {
                currentInput = currentInput.slice(0, -3); // Menghapus operator beserta spasi kelilingnya
            } else {
                currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : '0';
            }
        }
    } 
    else if (action === 'percent') {
        if (!operators.includes(lastChar) && currentInput !== 'Error') {
            let tokens = currentInput.split(' ');
            let lastNum = tokens[tokens.length - 1];
            if (lastNum) {
                let parsedPercent = (parseFloat(lastNum) / 100).toString();
                tokens[tokens.length - 1] = parsedPercent;
                currentInput = tokens.join(' ');
            }
        }
    } 
    else if (action === 'calculate') {
        if (currentInput && !operators.includes(lastChar) && !isEvaluated) {
            const rawExpression = currentInput;
            
            // Tampilkan animasi status memproses agar user tahu web sedang mengirim data ke Python
            currentDisplay.innerText = "Calculating..."; 
            
            // Panggil fungsi asynchronous untuk menembak API Python
            evaluateViaPythonBackend(rawExpression);
            
            return; // Return early agar fungsi renderDisplay() di bawah tidak langsung menimpa tulisan "Calculating..."
        }
    } 
    else if (value) {
        if (operators.includes(value)) {
            if (isEvaluated) isEvaluated = false;

            // Aturan penanganan anti duplikasi runtunan operator ganda
            if (operators.includes(lastChar)) {
                currentInput = currentInput.slice(0, -3) + ` ${value} `;
            } else {
                currentInput += ` ${value} `;
            }
        } 
        else if (value === '.') {
            if (isEvaluated) {
                currentInput = '0.';
                isEvaluated = false;
                return;
            }
            let tokens = currentInput.split(' ');
            let currentNumBlock = tokens[tokens.length - 1];
            if (!currentNumBlock.includes('.')) {
                currentInput += '.';
            }
        } 
        else {
            if (currentInput === '0' || isEvaluated || currentInput === 'Error' || currentInput === 'Error API') {
                currentInput = value;
                isEvaluated = false;
            } else {
                currentInput += value;
            }
        }
    }
    renderDisplay();
}

function renderDisplay() {
    currentDisplay.innerText = currentInput;
    // Otomatis geser scroll display ke kanan jika angka melebihi batas lebar HP
    currentDisplay.scrollLeft = currentDisplay.scrollWidth;
}

// 7. Pengolah List Item Riwayat Terhitung
function renderHistoryList() {
    if (calculationsHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Belum ada riwayat</div>';
        return;
    }

    // Render item dengan susunan terbalik (Kalkulasi terbaru berada paling atas)
    historyList.innerHTML = calculationsHistory.map(item => `
        <div class="history-item">
            <div class="history-expr">${item.expression}</div>
            <div class="history-res">${item.result}</div>
        </div>
    `).reverse().join('');
}

// 8. ASYNC FETCH ENGINE: Mengirim Data ke API Python Backend (Menggantikan local evaluateEngine)
async function evaluateViaPythonBackend(expr) {
    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ expression: expr }) // Mengirim rumus ke python dalam bentuk JSON
        });

        if (!response.ok) throw new Error("HTTP Error");

        const data = await response.json(); // Mengambil data kembalian hasil perhitungan Python
        const result = data.result;

        // Masukkan data hasil kalkulasi sukses dari Python ke database array riwayat
        calculationsHistory.push({
            expression: expr,
            result: result
        });
        renderHistoryList();

        currentInput = result;
        isEvaluated = true;
        renderDisplay();

    } catch (err) {
        // Penanganan error jika server mati/gagal terkoneksi
        currentInput = "Error API";
        isEvaluated = true; 
        renderDisplay();
        console.error("Gagal terhubung ke API Python:", err);
    }
}