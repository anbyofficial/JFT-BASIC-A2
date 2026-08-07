// Jika belum login, tendang balik ke URL repository login
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "https://anbyofficial.github.io/JFT-BASIC-A2-TES/";
    }
});


const startBtn = 
document.getElementById("startBtn");


const pages =
document.querySelectorAll(".page");



function showPage(id){


    pages.forEach(page=>{

        page.classList.remove(
            "active"
        );

    });



    let target =
    document.getElementById(
        id
    );



    if(target){

        target.classList.add(
            "active"
        );

    }


}





if(startBtn){

    startBtn.onclick=function(){

        showPage("quiz");

        loadQuestions();

    };

}

const historyBtn =
document.getElementById(
"historyBtn"
);



if(historyBtn){


historyBtn.onclick=function(){


    showPage(
        "history"
    );


    showHistory();


};


}
// ==============================
// KEMBALI HOME
// ==============================


const backHomeBtn =
document.getElementById(
    "backHomeBtn"
);


if(backHomeBtn){


    backHomeBtn.onclick=function(){


        showPage(
            "home"
        );


    };


}




const resultHomeBtn =
document.getElementById(
    "resultHomeBtn"
);


if(resultHomeBtn){


    resultHomeBtn.onclick=function(){


        showPage(
            "home"
        );


    };


}
loadDashboard();

function loadDashboard(){

    let history = getHistory();



    document
    .getElementById("totalExam")
    .innerHTML =
    history.length;



    if(history.length===0){

        return;

    }



    let best = 0;

    let total = 0;



    history.forEach(item=>{

        total += item.score;

        if(item.score > best){

            best = item.score;

        }

    });



    document
    .getElementById("bestScore")
    .innerHTML =
    best;



    document
    .getElementById("averageScore")
    .innerHTML =
    (
        total /
        history.length
    ).toFixed(1);

}
// ==============================
// DARK MODE
// ==============================

const themeBtn =
document.getElementById(
    "themeBtn"
);



if(themeBtn){

    // cek tema yang tersimpan
    let theme =
    localStorage.getItem("theme");


    if(theme==="dark"){

        document.body.classList.add(
            "dark"
        );

        themeBtn.innerHTML =
        "☀ Light Mode";

    }



    themeBtn.onclick=function(){


        document.body.classList.toggle(
            "dark"
        );



        if(
            document.body.classList.contains("dark")
        ){

            localStorage.setItem(
                "theme",
                "dark"
            );

            themeBtn.innerHTML =
            "☀ Light Mode";

        }
        else{

            localStorage.setItem(
                "theme",
                "light"
            );

            themeBtn.innerHTML =
            "🌙 Dark Mode";

        }

    };

}
// ==========================
// HAPUS HISTORY
// ==========================


let deleteHistoryBtn =
document.getElementById(
    "deleteHistoryBtn"
);



if(deleteHistoryBtn){


    deleteHistoryBtn.onclick=function(){


        let confirmDelete =
        confirm(
            "Hapus semua riwayat ujian?"
        );



        if(confirmDelete){


            clearHistory();


            showHistory();


            loadDashboard();


        }


    };


}
// Memastikan data Bank Soal langsung terhitung otomatis begitu halaman terbuka
document.addEventListener("DOMContentLoaded", function () {
    // Sesuaikan 'bankSoal' dengan ID HTML tempat angka Bank Soal kamu ditampilkan
    let elementBankSoal = document.getElementById("bankSoal") || document.getElementById("totalBankSoal");
    
    // Cek apakah array soal (misal: 'questions' atau 'bankSoalArray') sudah terdefinisi
    if (elementBankSoal && typeof questions !== "undefined") {
        elementBankSoal.innerText = questions.length;
    }
});
document.addEventListener("DOMContentLoaded", function () {
    let bankEl = document.getElementById("bankQuestion");

    // Menghitung jumlah soal dari array 'questions' (atau sesuaikan dengan nama variabel soal di quiz.js kamu)
    if (bankEl && typeof questions !== "undefined") {
        bankEl.innerText = questions.length;
    }
});
// Jalankan pembaharuan dashboard otomatis saat pertama kali dibuka
document.addEventListener("DOMContentLoaded", function () {
    updateDashboardData();
});
