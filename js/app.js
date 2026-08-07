// ==========================================
// 1. INSIALISASI & PROTEKSI FIREBASE
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Konfigurasi Firebase Anda (SAMA PERSIS seperti di script.js)
const firebaseConfig = {
    apiKey: "AIzaSyABp1sNwc8ON5LhWvlDFeQLXWztz-mD9G0",
    authDomain: "jft-basic-a2.firebaseapp.com",
    projectId: "jft-basic-a2",
    storageBucket: "jft-basic-a2.firebasestorage.app",
    messagingSenderId: "856700351880",
    appId: "1:856700351880:web:a1a126470d664cb453f63d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

// Proteksi: Jika BELUM login, tendang balik ke URL repository login
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "https://anbyofficial.github.io/JFT-BASIC-A2-TES/";
    }
});

// ==========================================
// 2. NAVIGASI HALAMAN & EVENT BUTTONS
// ==========================================
const startBtn = document.getElementById("startBtn");
const pages = document.querySelectorAll(".page");

function showPage(id) {
    pages.forEach(page => {
        page.classList.remove("active");
    });

    let target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
    }
}

if (startBtn) {
    startBtn.onclick = function () {
        showPage("quiz");
        if (typeof loadQuestions === "function") {
            loadQuestions();
        }
    };
}

const historyBtn = document.getElementById("historyBtn");
if (historyBtn) {
    historyBtn.onclick = function () {
        showPage("history");
        if (typeof showHistory === "function") {
            showHistory();
        }
    };
}

// ==============================
// KEMBALI HOME
// ==============================
const backHomeBtn = document.getElementById("backHomeBtn");
if (backHomeBtn) {
    backHomeBtn.onclick = function () {
        showPage("home");
    };
}

const resultHomeBtn = document.getElementById("resultHomeBtn");
if (resultHomeBtn) {
    resultHomeBtn.onclick = function () {
        showPage("home");
    };
}

// ==============================
// DASHBOARD & STATISTIK
// ==============================
function loadDashboard() {
    if (typeof getHistory !== "function") return;

    let history = getHistory();
    const totalExamEl = document.getElementById("totalExam");
    
    if (totalExamEl) {
        totalExamEl.innerHTML = history.length;
    }

    if (history.length === 0) {
        return;
    }

    let best = 0;
    let total = 0;

    history.forEach(item => {
        total += item.score;
        if (item.score > best) {
            best = item.score;
        }
    });

    const bestScoreEl = document.getElementById("bestScore");
    const averageScoreEl = document.getElementById("averageScore");

    if (bestScoreEl) bestScoreEl.innerHTML = best;
    if (averageScoreEl) averageScoreEl.innerHTML = (total / history.length).toFixed(1);
}

// Panggil dashboard awal
loadDashboard();

// ==============================
// DARK MODE
// ==============================
const themeBtn = document.getElementById("themeBtn");

if (themeBtn) {
    // cek tema yang tersimpan
    let theme = localStorage.getItem("theme");

    if (theme === "dark") {
        document.body.classList.add("dark");
        themeBtn.innerHTML = "☀ Light Mode";
    }

    themeBtn.onclick = function () {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            localStorage.setItem("theme", "dark");
            themeBtn.innerHTML = "☀ Light Mode";
        } else {
            localStorage.setItem("theme", "light");
            themeBtn.innerHTML = "🌙 Dark Mode";
        }
    };
}

// ==========================
// HAPUS HISTORY
// ==========================
let deleteHistoryBtn = document.getElementById("deleteHistoryBtn");

if (deleteHistoryBtn) {
    deleteHistoryBtn.onclick = function () {
        let confirmDelete = confirm("Hapus semua riwayat ujian?");

        if (confirmDelete) {
            if (typeof clearHistory === "function") clearHistory();
            if (typeof showHistory === "function") showHistory();
            loadDashboard();
        }
    };
}

// ==========================================
// 3. LOGIKA LOAD AWAL (DOM CONTENT LOADED)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    // 1. Hitung jumlah Bank Soal otomatis
    let bankEl = document.getElementById("bankQuestion") || document.getElementById("bankSoal") || document.getElementById("totalBankSoal");

    if (bankEl && typeof questions !== "undefined") {
        bankEl.innerText = questions.length;
    }

    // 2. Update data dashboard jika ada fungsinya
    if (typeof updateDashboardData === "function") {
        updateDashboardData();
    }
});
