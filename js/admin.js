// ==========================================
// 1. INISIALISASI & PERSISTENSI KREDENSIAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Muat kredensial tersimpan dari localStorage
    if (localStorage.getItem("gh_owner")) document.getElementById("githubOwner").value = localStorage.getItem("gh_owner");
    if (localStorage.getItem("gh_repo")) document.getElementById("githubRepo").value = localStorage.getItem("gh_repo");
    if (localStorage.getItem("gh_token")) document.getElementById("githubToken").value = localStorage.getItem("gh_token");

    // Tangkap tombol submit
    const btn = document.getElementById("submitBtn");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            submitNewQuestion();
        });
    }
});

// ==========================================
// 2. LOGIKA UTAMA SUBMIT SOAL
// ==========================================
async function submitNewQuestion() {
    const owner = document.getElementById("githubOwner").value.trim();
    const repo = document.getElementById("githubRepo").value.trim();
    const token = document.getElementById("githubToken").value.trim();
    const btn = document.getElementById("submitBtn");
    const status = document.getElementById("status");

    // Validasi kredensial
    if (!owner || !repo || !token) {
        alert("Harap isi Username, Nama Repo, dan Token GitHub!");
        return;
    }

    // Simpan Kredensial ke localStorage
    localStorage.setItem("gh_owner", owner);
    localStorage.setItem("gh_repo", repo);
    localStorage.setItem("gh_token", token);

    // Set UI State: Loading
    btn.disabled = true;
    btn.innerText = "⏳ Sedang Memproses & Upload...";
    status.style.display = "none";

    try {
        const timestamp = Date.now();
        let audioPath = "";
        let imagePath = "";

        // --- A. UPLOAD AUDIO (JIKA ADA) ---
        const audioInput = document.getElementById("audioFile");
        if (audioInput.files.length > 0) {
            const audioFile = audioInput.files[0];
            const audioBase64 = await fileToBase64(audioFile);
            const ext = audioFile.name.split('.').pop();
            audioPath = `audio/choukai_${timestamp}.${ext}`;

            await uploadFileToGithub(owner, repo, token, audioPath, audioBase64, `Upload audio ${audioPath}`);
        }

        // --- B. UPLOAD GAMBAR (JIKA ADA) ---
        const imageInput = document.getElementById("imageFile");
        if (imageInput.files.length > 0) {
            const imageFile = imageInput.files[0];
            const imageBase64 = await fileToBase64(imageFile);
            const ext = imageFile.name.split('.').pop();
            imagePath = `images/img_${timestamp}.${ext}`;

            await uploadFileToGithub(owner, repo, token, imagePath, imageBase64, `Upload gambar ${imagePath}`);
        }

        // --- C. AMBIL FILE data/questions.json DARI GITHUB ---
        const jsonUrl = `https://api.github.com/repos/${owner}/${repo}/contents/data/questions.json`;
        const resGet = await fetch(jsonUrl, {
            headers: { "Authorization": `token ${token}` }
        });

        let currentQuestions = [];
        let currentSha = "";

        if (resGet.ok) {
            const dataJson = await resGet.json();
            currentSha = dataJson.sha; // SHAs dibutuhkan untuk menimpa file eksisting
            currentQuestions = JSON.parse(decodeURIComponent(escape(atob(dataJson.content))));
        } else if (resGet.status !== 404) {
            throw new Error(`Gagal membaca data/questions.json (Status: ${resGet.status}). Cek Nama Repo/Owner/Token!`);
        }

        // --- D. SUSUN DATA SOAL BARU ---
        const newQuestion = {
            id: timestamp,
            category: document.getElementById("questionType").value,
            type: document.getElementById("questionType").value,
            passage: document.getElementById("passage").value.trim(),
            question: document.getElementById("questionText").value.trim(),
            options: [
                { id: "a", text: document.getElementById("optA").value.trim() },
                { id: "b", text: document.getElementById("optB").value.trim() },
                { id: "c", text: document.getElementById("optC").value.trim() },
                { id: "d", text: document.getElementById("optD").value.trim() }
            ],
            answer: document.getElementById("correctAnswer").value,
            explanation: document.getElementById("explanation").value.trim()
        };

        if (audioPath) newQuestion.audio = audioPath;
        if (imagePath) newQuestion.image = imagePath;

        // Tambahkan soal baru ke dalam array
        currentQuestions.push(newQuestion);

        // --- E. UPDATE / COMMIT FILE data/questions.json KE GITHUB ---
        const updatedContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(currentQuestions, null, 2))));

        const payload = {
            message: `Tambah soal baru ID: ${newQuestion.id}`,
            content: updatedContentBase64
        };
        if (currentSha) payload.sha = currentSha; // Hanya sertakan SHA jika file sudah ada sebelumnya

        const resPut = await fetch(jsonUrl, {
            method: "PUT",
            headers: {
                "Authorization": `token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!resPut.ok) {
            const errBody = await resPut.json();
            throw new Error(errBody.message || "Gagal meng-update questions.json di GitHub.");
        }

        // --- F. RESPONSE SUCCESS ---
        status.className = "success";
        status.innerText = "✅ Soal & Media Berhasil Di-upload ke GitHub! Tunggu 1-2 menit hingga GitHub Pages selesai memprosesnya.";
        status.style.display = "block";

        // Reset Form Inputs
        document.getElementById("passage").value = "";
        document.getElementById("questionText").value = "";
        document.getElementById("optA").value = "";
        document.getElementById("optB").value = "";
        document.getElementById("optC").value = "";
        document.getElementById("optD").value = "";
        document.getElementById("explanation").value = "";
        audioInput.value = "";
        imageInput.value = "";

    } catch (error) {
        console.error(error);
        status.className = "error";
        status.innerText = `❌ Error: ${error.message}`;
        status.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = "🚀 Upload Soal ke GitHub";
    }
}

// ==========================================
// 3. FUNGSI HELPER (PEMBANTU)
// ==========================================

// Helper: Convert File ke Base64 String
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// Helper: Upload file binary ke GitHub REST API
async function uploadFileToGithub(owner, repo, token, path, contentBase64, commitMessage) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: commitMessage,
            content: contentBase64
        })
    });

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Gagal mengupload file media ke ${path}`);
    }
}
