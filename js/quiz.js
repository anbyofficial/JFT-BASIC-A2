// ===================================================
// ➕ TAMBAHKAN VARIABEL INI DI PALING ATAS FILE JS
// ===================================================
const MAX_AUDIO_PLAYS = 2;

let questions = [];
let currentQuestion = 0;
let userAnswers = [];

let correctAnswers = 0;
let score = 0;

// TIMER
let totalTime = 60 * 60;
let timerInterval;

// ==============================
// LOAD SOAL
// ==============================
async function loadQuestions(){
    currentQuestion = 0;
    try {
        let response = await fetch("data/questions.json");
        let data = await response.json();

        let saved = loadProgress();

        if(saved){
            let lanjut = confirm("Ditemukan ujian sebelumnya.\n\nLanjutkan ujian?");
            if(lanjut){
                questions = saved.questions;
                userAnswers = saved.userAnswers;
                currentQuestion = saved.currentQuestion;
                totalTime = saved.time;

                createNumberPanel();
                showQuestion();
                updateProgress();
                startTimer(); // Menjalankan timer saat lanjut ujian
                return;
            } else {
                clearProgress();
            }
        }

        questions = getRandomQuestions(data, 50);
        questions = shuffle(questions);
        questions = questions.map(q => randomOptions(q));

        userAnswers = new Array(questions.length);

        document.getElementById("totalNumber").innerHTML = questions.length;

        createNumberPanel();
        showQuestion();
        updateProgress();
        startTimer();

    } catch(error){
        console.error("Gagal membaca soal:", error);
    }
}

// ==============================
// TAMPIL SOAL
// ==============================
function showQuestion(){
    let card = document.querySelector(".question-card");
    if(card){
        card.classList.remove("animate");
        void card.offsetWidth;
        card.classList.add("animate");
    }

    let q = questions[currentQuestion];
    if(!q) return;

    /// ===================================================
// PENYESUAIAN LABEL KATEGORI SOAL
// ===================================================
const typeLabelElem = document.getElementById("typeLabel");

if (typeLabelElem) {
    // Objek pemetaan nama kategori ke teks tampilan
    const categoryLabels = {
        vocabulary: "🔤 文字・語彙 Vocabulary",
        grammar: "📝 文法 Grammar",
        conversation: "💬 会話 Conversation",
        reading: "📖 読解 Reading",
        choukai: "🎧 聴解 Listening", // ➕ Kunci ini
        chokai: "🎧 聴解 Listening"   // ➕ Dan kunci ini (untuk antisipasi penulisan chokai)
    };

    // Ambil label berdasarkan q.category atau q.type di JSON
   const labelTeks = categoryLabels[q.category] || categoryLabels[q.type] || (q.audio ? "🎧 聴解 Listening" : "📝 文法 Grammar");
    
    typeLabelElem.innerText = labelTeks;
}

    // 2. TEKS BACAAN (PASSAGE)
    let passage = document.getElementById("passage");
    if(passage){
        if(q.type === "reading"){
            passage.style.display = "block";
            passage.innerHTML = q.passage;
        } else if(q.type === "conversation"){
            passage.style.display = "block";
            passage.innerHTML = formatConversation(q.passage);
        } else {
            passage.style.display = "none";
            passage.innerHTML = "";
        }
    }

    // ==============================================
    // 3. TAMBAHKAN KODE GAMBAR DI SINI (SISIPKAN DI SINI)
    // ==============================================
    let imgEl = document.getElementById("questionImage");
    if (imgEl) {
        if (q.image && q.image.trim() !== "") {
            imgEl.src = q.image;
            imgEl.style.display = "block"; // Tampilkan jika ada gambar
        } else {
            imgEl.src = "";
            imgEl.style.display = "none";  // Sembunyikan jika tidak ada gambar
        }
    }
    // ==================================================
    // ➕ KODE AUDIO CHOUKAI (PERBAIKAN STATE PER SOAL)
    // ==================================================
    const audioElem = document.getElementById('questionAudio');
    const audioNotice = document.getElementById('audioNotice');

    if (q.audio) {
        // 1. Inisialisasi hitungan khusus untuk SOAL INI jika belum ada
        if (q.playCount === undefined) {
            q.playCount = 0; 
        }

        audioElem.src = q.audio;
        audioElem.style.display = 'block';
        audioElem.load();

        // 2. CEK STATUS: Apakah soal ini sudah habis batas pemutarannya?
        if (q.playCount >= MAX_AUDIO_PLAYS) {
            audioElem.controls = false; // Matikan tombol play jika sudah 2x diputar
            if (audioNotice) {
                audioNotice.innerText = "Batas pemutaran audio habis (Maksimal 2x).";
                audioNotice.style.color = "#e74c3c";
                audioNotice.style.display = 'block';
            }
        } else {
            audioElem.controls = true; // Aktifkan jika masih ada jatah
            const remaining = MAX_AUDIO_PLAYS - q.playCount;
            if (audioNotice) {
                audioNotice.innerText = `Sisa kesempatan putar audio: ${remaining}x`;
                audioNotice.style.color = '#e67e22';
                audioNotice.style.display = 'block';
            }
        }

        // 3. Deteksi saat tombol PLAY ditekan
        audioElem.onplay = function() {
            // Cek apakah jatah masih ada
            if (q.playCount < MAX_AUDIO_PLAYS) {
                q.playCount++; // Simpan hitungan LANGSUNG di objek soal (q)
                const remaining = MAX_AUDIO_PLAYS - q.playCount;

                if (q.playCount >= MAX_AUDIO_PLAYS) {
                    audioElem.controls = false; // Kunci kontrol audio jika mencapai batas
                    if (audioNotice) {
                        audioNotice.innerText = "Batas pemutaran audio habis (Maksimal 2x).";
                        audioNotice.style.color = "#e74c3c";
                    }
                } else {
                    if (audioNotice) {
                        audioNotice.innerText = `Sisa kesempatan putar audio: ${remaining}x`;
                    }
                }
            } else {
                // Jika sudah habis tapi tertekan play, matikan seketika
                audioElem.pause();
                audioElem.currentTime = 0;
                audioElem.controls = false;
            }
        };

    } else {
        // Jika soal biasa (tidak ada audio)
        audioElem.pause();
        audioElem.currentTime = 0;
        audioElem.src = '';
        audioElem.style.display = 'none';
        if (audioNotice) audioNotice.style.display = 'none';
    }

    // ==============================================

    // 4. TEKS PERTANYAAN
    document.getElementById("questionText").innerHTML = q.question;
    document.getElementById("currentNumber").innerHTML = currentQuestion + 1;

    // 5. PILIHAN JAWABAN
    let optionBox = document.getElementById("options");
    optionBox.innerHTML = "";

    q.options.forEach(option => {
        let button = document.createElement("button");
        button.className = "option";
        button.innerHTML = option.text;

        if(userAnswers[currentQuestion] === option.id){
            button.classList.add("selected");
        }

        button.onclick = function(){
            selectAnswer(option.id, button);
        };

        optionBox.appendChild(button);
    });
}

// ==============================
// PILIH JAWABAN
// ==============================
function selectAnswer(answer, element){
    userAnswers[currentQuestion] = answer;
    saveProgress();
    saveAnswer(currentQuestion, answer);

    document.querySelectorAll(".option").forEach(btn => {
        btn.classList.remove("selected");
    });

    element.classList.add("selected");
    updateNumberColor();
}

// ==============================
// NEXT / PREVIOUS
// ==============================
function nextQuestion(){
    if(currentQuestion < questions.length - 1){
        currentQuestion++;
        saveProgress();
        showQuestion();
        updateProgress();
        updateNumberColor();
    }
}

function previousQuestion(){
    if(currentQuestion > 0){
        currentQuestion--;
        showQuestion();
        updateProgress();
        updateNumberColor();
    }
}

// ==============================
// 1. FUNGSI ANIMASI CONFETTI
// ==============================
function triggerPassAnimation() {
    if (typeof confetti !== 'function') return;

    var duration = 3 * 1000; // Durasi 3 detik
    var end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 }
        });
        
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// ==============================
// 2. PROGRESS & TIMER
// ==============================
function updateProgress(){
    if(questions.length === 0) return;
    let percent = ((currentQuestion + 1) / questions.length) * 100;
    let bar = document.getElementById("progress");
    if(bar) bar.style.width = percent + "%";
}

function startTimer(){
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        let timer = document.getElementById("time");

        if(timer){
            timer.innerHTML = minutes + ":" + (seconds < 10 ? "0" + seconds : seconds);
        }

        totalTime--;

        if(totalTime < 0){
            clearInterval(timerInterval);
            finishExam(true); // Jika waktu habis, otomatis selesai tanpa pop-up
        }
    }, 1000);
}

// ==============================
// 3. SELESAI UJIAN (SweetAlert2)
// ==============================
function finishExam(isAutoSubmit = false){
    // 1. Jika waktu habis, langsung selesaikan tanpa pop-up
    if (isAutoSubmit) {
        processFinishExam();
        return;
    }

    // 2. Tampilkan Pop-Up Konfirmasi Modern SweetAlert2
    Swal.fire({
        title: 'Selesaikan Ujian?',
        text: 'Pastikan semua jawaban sudah kamu periksa dengan teliti.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16a34a', // Warna Hijau
        cancelButtonColor: '#dc2626',  // Warna Merah
        confirmButtonText: 'Ya, Selesaikan!',
        cancelButtonText: 'Cek Lagi',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            processFinishExam();
        }
    });
}

// ==============================
// SELESAI UJIAN & PROSES HASIL
// ==============================
function processFinishExam() {

    // ===================================================
    // ➕ TAMBAHKAN KODE INI DI BARIS PALING ATAS
    // ===================================================
    const audioElem = document.getElementById('questionAudio');
    if (audioElem) {
        audioElem.pause();         // Hentikan suara seketika
        audioElem.currentTime = 0;    // Reset durasi ke awal (00:00)
    }
    // ===================================================

    window.onbeforeunload = null;
    clearProgress();
    clearInterval(timerInterval);
    calculateResult();
    updateDashboardData();
    showResult();
}

function calculateResult(){
    correctAnswers = 0;

    questions.forEach((q, index) => {
        if(userAnswers[index] === q.answer){
            correctAnswers++;
        }
    });

    // Hitung score
    // Hitung score
    score = Math.round((correctAnswers / questions.length) * 100);


    saveHistory({
        date: new Date().toLocaleDateString("id-ID"),
        score: score,
        correct: correctAnswers,
        wrong: questions.length - correctAnswers
    });
}

// ==============================
// TAMPIL HASIL & STATUS LULUS
// ==============================
function showResult(){
    let quizPage = document.getElementById("quiz");
    let resultPage = document.getElementById("result");

    if (quizPage) quizPage.classList.remove("active");
    if (resultPage) resultPage.classList.add("active");

    let passingScore = 75;
    let isPass = score >= passingScore;
    
    // Status Badge & Efek Animasi
    let statusHTML = "";
    if (isPass) {
        statusHTML = `<div class="badge-pass" style="font-size: 24px; color: #16a34a; font-weight: bold; margin-bottom: 10px;">合格 (LULUS)</div>`;
        
        // Panggil animasi kertas/confetti
        if (typeof triggerPassAnimation === "function") {
            triggerPassAnimation();
        } else if (typeof confetti === "function") {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    } else {
        statusHTML = `<div class="badge-fail" style="font-size: 24px; color: #dc2626; font-weight: bold; margin-bottom: 10px;">不合格 (TIDAK LULUS)</div>`;
    }

    // Tampilkan badge status dan detail nilai di halaman hasil
    let resultTextEl = document.getElementById("resultText");
    if (resultTextEl) {
        resultTextEl.innerHTML = `
            ${statusHTML}
            <p>Jumlah Soal : ${questions.length}</p>
            <p>Benar : ${correctAnswers}</p>
            <p>Salah : ${questions.length - correctAnswers}</p>
            <h1 style="font-size: 36px; margin-top: 10px;">Nilai : ${score}</h1>
        `;
    }

    let reviewBtn = document.getElementById("reviewBtn");
    if (reviewBtn) {
        reviewBtn.onclick = function(){
            showReview();
        };
    }
}

// ==============================
// NOMOR SOAL (PANEL)
// ==============================
function updateNumberColor(){
    let buttons = document.querySelectorAll(".number");
    buttons.forEach((btn, index) => {
        btn.classList.remove("active", "done");
        if(index === currentQuestion){
            btn.classList.add("active");
        }
        if(userAnswers[index]){
            btn.classList.add("done");
        }
    });
}

function createNumberPanel(){
    let panel = document.getElementById("numberPanel");
    if(!panel) return;
    panel.innerHTML = "";

    questions.forEach((q, index) => {
        let button = document.createElement("button");
        button.className = "number";
        button.innerHTML = index + 1;

        button.onclick = function(){
            currentQuestion = index;
            showQuestion();
            updateProgress();
            updateNumberColor();
        };

        panel.appendChild(button);
    });

    updateNumberColor();
}

// ==============================
// REVIEW SOAL SALAH
// ==============================
function showReview(){
    let box = document.getElementById("reviewBox");
    if(!box) return;
    
    box.innerHTML = "";
    let wrongCount = 0;

    questions.forEach((q, index) => {
        let user = userAnswers[index];
        let benar = user === q.answer;

        if(!benar){
            wrongCount++;
            let div = document.createElement("div");
            div.className = "review-card wrong";
            div.innerHTML = `
                <h3>Soal ${index + 1}</h3>
                <p class="question">${q.question}</p>
                <p>Jawaban kamu: <span class="wrong-text">${user ? user : "Tidak dijawab"}</span></p>
                <p>Jawaban benar: <span class="correct-text">${q.answer}</span></p>
                <p>Penjelasan: ${q.explanation}</p>
            `;
            box.appendChild(div);
        }
    });

    if(wrongCount === 0){
        box.innerHTML = `<h2 class="perfect">🎉 Semua jawaban benar!</h2>`;
    }

    let backResultBtn = document.getElementById("backResultBtn");
    if (backResultBtn) {
        backResultBtn.onclick = function(){
            document.getElementById("reviewBox").innerHTML = "";
        };
    }
}

// ==============================
// RESTART & HISTORY
// ==============================
function restartExam(){
    currentQuestion = 0;
    userAnswers = [];
    correctAnswers = 0;
    score = 0;
    clearInterval(timerInterval);
    totalTime = 60 * 60;

    localStorage.removeItem("jft_answers");

    let resultEl = document.getElementById("result");
    let quizEl = document.getElementById("quiz");
    
    if (resultEl) resultEl.classList.remove("active");
    if (quizEl) quizEl.classList.add("active");

    loadQuestions();
}

function showHistory(){
    let list = document.getElementById("historyList");
    if (!list) return;
    
    let data = typeof getHistory === "function" ? getHistory() : [];

    if(data.length === 0){
        list.innerHTML = "Belum ada riwayat ujian";
        return;
    }

    list.innerHTML = "";
    data.forEach(item => {
        let div = document.createElement("div");
        div.className = "review-card";
        div.innerHTML = `
            <p>📅 ${item.date}</p>
            <p>Nilai: <b>${item.score}</b></p>
            <p>Benar: ${item.correct} / Salah: ${item.wrong}</p>
        `;
        list.appendChild(div);
    });
}

// ==============================
// FORMAT CONVERSATION
// ==============================
function formatConversation(text){
    if(!text) return "";
    let lines = text.split("\n");
    let html = "";

    lines.forEach(line => {
        if(line.startsWith("A:")){
            html += `
                <div class="dialog a">
                    <div class="speaker">👤 A</div>
                    <div class="bubble">${line.replace("A:", "")}</div>
                </div>`;
        } else if(line.startsWith("B:")){
            html += `
                <div class="dialog b">
                    <div class="speaker">👤 B</div>
                    <div class="bubble">${line.replace("B:", "")}</div>
                </div>`;
        }
    });

    return html;
}

window.onbeforeunload = function(e){
    if(questions.length > 0 && currentQuestion < questions.length){
        e.preventDefault();
        e.returnValue = "";
        return "";
    }
};

let retryBtn = document.getElementById("retryBtn");
if (retryBtn) {
    retryBtn.onclick = function(){
        restartExam();
    };
}

// ==============================================
// UPDATE METRIK DASHBOARD & STATISTIK REAL-TIME
// ==============================================
async function updateDashboardData() {
    try {
        let res = await fetch("data/questions.json");
        let data = await res.json();
        
        let elBank = document.getElementById("bankQuestion");
        if (elBank) {
            elBank.innerText = data.length; 
        }
    } catch (e) {
        console.error("Gagal membaca questions.json:", e);
    }

    let history = typeof getHistory === "function" ? getHistory() : [];
    let totalUjian = history.length;
    let highScore = 0;
    let avgScore = "0.0";

    if (totalUjian > 0) {
        let scores = history.map(item => Number(item.score) || 0);
        highScore = Math.max(...scores);
        let totalScore = scores.reduce((acc, curr) => acc + curr, 0);
        avgScore = (totalScore / totalUjian).toFixed(1);
    }

    // ID disesuaikan persis dengan HTML (bestScore & averageScore)
    let elTotal = document.getElementById("totalExam");
    let elHigh = document.getElementById("bestScore");
    let elAvg = document.getElementById("averageScore");

    if (elTotal) elTotal.innerText = totalUjian;
    if (elHigh) elHigh.innerText = highScore;
    if (elAvg) elAvg.innerText = avgScore;
}
    

// ==========================================
// 1. FUNGSI ANIMASI CONFETTI (HARUS GLOBAL)
// ==========================================
function triggerPassAnimation() {
    // Cek apakah library confetti sudah dimuat
    if (typeof confetti !== 'function') {
        console.warn("Library confetti belum dimuat!");
        return;
    }

    var duration = 3 * 1000; // Durasi 3 detik
    var end = Date.now() + duration;

    (function frame() {
        // Confetti dari sisi kiri
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 }
        });
        
        // Confetti dari sisi kanan
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}
// Tambahkan kode ini di baris paling bawah quiz.js
document.addEventListener("DOMContentLoaded", function () {
    const bankEl = document.getElementById("bankQuestion");
    
    // Ganti 'questions' jika nama variabel array soalmu berbeda
    if (bankEl && typeof questions !== "undefined") {
        bankEl.innerText = questions.length;
    }
});
