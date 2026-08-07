// ==========================
// ACAK ARRAY
// ==========================

function shuffle(array){

    let result =
    [...array];


    for(
        let i = result.length - 1;
        i > 0;
        i--
    ){

        let j =
        Math.floor(
            Math.random() *
            (i + 1)
        );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}





// ==========================
// AMBIL SOAL ACAK
// ==========================

function getRandomQuestions(
    questions,
    total
){

    let copy =
    [...questions];


    let shuffled =
    shuffle(copy);


    return shuffled.slice(
        0,
        total
    );

}





// ==========================
// ACAK PILIHAN JAWABAN
// ==========================

function randomOptions(question){
    let copyOptions = [...question.options];

    return {
        ...question, // Tanda "..." ini otomatis menyalin SELURUH isi soal termasuk type & passage
        options: shuffle(copyOptions)
    };


}
// Fungsi untuk mengambil soal berdasarkan komposisi resmi JFT
function getStructuredQuestions(data) {
    // 1. Tentukan kuota masing-masing kategori (Total = 50 soal)
    const targets = {
        vocabulary: 12,
        grammar: 10,
        conversation: 10,
        reading: 8,
        choukai: 10   // Kuota Chokai
    };

    let selectedQuestions = [];

    // 2. Loop setiap kategori dan ambil soal sesuai jumlah target
    for (const category in targets) {
        // Filter soal berdasarkan kategori yang ada di JSON
        const categoryQuestions = data.filter(q => q.category === category);
        
        // Acak urutan soal dalam kategori tersebut
        const shuffled = categoryQuestions.sort(() => 0.5 - Math.random());

        // Ambil sebanyak target kuota
        const sliced = shuffled.slice(0, targets[category]);

        // Gabungkan ke array utama
        selectedQuestions = selectedQuestions.concat(sliced);
    }

    return selectedQuestions;
}