function saveAnswer(
    questionId,
    answer
){

    userAnswers[questionId] = answer;


    localStorage.setItem(
        "jft_answers",
        JSON.stringify(userAnswers)
    );

}



function loadAnswers(){

    let data =
    localStorage.getItem(
        "jft_answers"
    );


    if(data){

        userAnswers =
        JSON.parse(data);

    }

}

// ==========================
// HISTORY NILAI
// ==========================


function saveHistory(result){


    let history =
    JSON.parse(
        localStorage.getItem(
            "jft_history"
        )
    ) || [];



    history.unshift(
        result
    );



    localStorage.setItem(
        "jft_history",
        JSON.stringify(history)
    );


}




function getHistory(){


    return JSON.parse(

        localStorage.getItem(
            "jft_history"
        )

    ) || [];


}
// ==========================
// SIMPAN PROGRES UJIAN
// ==========================


function saveProgress(){


    let progress = {


        currentQuestion:
        currentQuestion,


        userAnswers:
        userAnswers,


        questions:
        questions,


        time:
        totalTime


    };



    localStorage.setItem(

        "jft_progress",

        JSON.stringify(progress)

    );


}




// ==========================
// AMBIL PROGRES UJIAN
// ==========================


function loadProgress(){


    let data =
    localStorage.getItem(
        "jft_progress"
    );



    if(data){


        return JSON.parse(
            data
        );


    }



    return null;


}




// ==========================
// HAPUS PROGRES
// ==========================


function clearProgress(){


    localStorage.removeItem(
        "jft_progress"
    );


}
// ==========================
// HAPUS SEMUA HISTORY
// ==========================


function clearHistory(){


    localStorage.removeItem(
        "jft_history"
    );


}