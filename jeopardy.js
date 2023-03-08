// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]


const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const BASE_API_URL = "https:jservice.io/api/";
let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const res = await axios.get(`${BASE_API_URL}/categories?count=100`);
    let catIds = res.data.map(category => category.id)
    return _.sampleSize(catIds, 6);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const res = await axios({
        url: `${BASE_API_URL}/category?id=${catId}`,
        method: "GET"
    })
    let category = res.data;
    let allClues = category.clues;
    let useClues = _.sampleSize(allClues, 5);
    let clues =
    useClues.map(result => ({
       question: result.question,
       answer: result.answer,
       showing: null
    }));
    
    return { title: category.title, clues }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() { 


    let $tHead = $('#thead');
        $tHead.empty();
    let $tr = $('<tr>');
    for(let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++){
        $tr.append($('<th>').text(categories[catIdx].title));  
    }
    $tHead.append($tr);

    let $tBody = $('#tbody');
    $tBody.empty();
    for(let clueIdx = 0; clueIdx < NUM_QUESTIONS_PER_CAT; clueIdx++){
        let $tr = $('<tr>');
        for(let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++){
            $tr.append($('<td>').attr("id", `${catIdx}-${clueIdx}`).text('?'))     
        }
        $tBody.append($tr);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
   let id = evt.target.id;
   
   let [catId, clueId] = id.split('-');

   let clue = categories[catId].clues[clueId];
   console.log(clue.showing)

   let display;

   if(clue.showing === null){
    display = clue.question;
    clue.showing = 'question';
   } else if(clue.showing === 'question'){
    display = clue.answer;
    clue.showing = 'answer';
   } else{
    return
   }
   

   $(`#${catId}-${clueId}`).html(display)
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $('#thead').empty();
    $('#tbody').empty();
}

/** Remove the loading spinner and update the button used to fetch data. */


function hideLoadingView() {
    $('#start').text('What is Start Over?');
    $('#spin-container').hide();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let catIds = await getCategoryIds();
    categories = [];

    for(let catId of catIds){
        categories.push(await getCategory(catId))
    }

    console.log(categories)
    fillTable();
}

/** On click of start / restart button, set up game. */
$('#start').on('click', setupAndStart)


// TODO

/** On page load, add event handler for clicking clues */
$(async function () {
    setupAndStart();
    $('#jeopardy').on('click', 'td', handleClick)
  },
    $("#spin-container").hide()
);
// TODO