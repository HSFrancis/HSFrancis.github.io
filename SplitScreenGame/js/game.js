
var CURRENT_COLUMN_KEY = Object.keys(vocabulary_sets_in_dropdown_data)[0]; // Number of syllables in the column, 18 for Ꭰ
var CURRENT_COLUMN_DATA_WITH_METADATA = vocabulary_sets_in_dropdown_data[CURRENT_COLUMN_KEY]; 
var CURRENT_COLUMN_DATA = CURRENT_COLUMN_DATA_WITH_METADATA["data"];
var NUMBER_OF_ITEMS = CURRENT_COLUMN_DATA.length; // Number of syllables in the column, 18 for Ꭰ
var PAGE_SIZE = 18;
var SHOW_ALL_TEXT_CLICKED_LAST = true; // starts true bc starts with all text showing
var PAGE_NUM = 0; // Which page in the vocabulary is displayed. 0 is the first page.

const MAX_NUM_PER_SIDE = 6;

// Game variables
var roundNumber = 0; // what number round we're on, 0-indexed
var leftPoints = 0;
var rightPoints = 0;
var randomizedElementsAtStart = []; // keeps order when first scrambled, lets you go through this to play.
var roundOver = false;

// Round variables
var gridIndexWinningWord = 0; // index of where the current word is at
var wordToPlayElementIndex = 0; // element index of element that's being played in the round

// keeps track of the glowing red 
var glowWrongInterval = null;

var GAME_SETTINGS = {};


// Creates an array with numbers 0 to NUMBER_OF_ITEMS. 
// element_order_in_grid will contain a list of element id's. They are ordered by their placement
// in the grid. 
// For example, if element_order_in_grid = [1, 0, 2]
// 			then the 0th element in the grid is actually element 1 in a_column_data. 
// In this way, we can shuffle the indexes to randomize what text/pictures appear. 
var element_order_in_grid = [...Array(NUMBER_OF_ITEMS).keys()]; 

onPageLoaded();


// Call once when the page is loaded to initialize audio and grid onClick functions.
function onPageLoaded(){

	// NOTE: Load all elements before dropdown so that it cannot be switched while still loading

	// loadColumnAudio();
	randomizeVocabList();

	// // Set onClicks
	document.getElementById("column-title").onchange = onDropdownChanged;	
	document.getElementById("start-button").onclick = onStartButtonClicked;
	document.getElementById("left-color-dropdown").onchange = onLeftColorChanged;	
	document.getElementById("right-color-dropdown").onchange = onRightColorChanged;	
	document.getElementById("new-game-button").onclick = onNewGameButtonClicked;
	document.getElementById("restart-button").onclick = onRestartButtonClicked;

	var earButtons = document.getElementsByClassName("ear-img");
	for (var i=0; i < earButtons.length; i++) {
		earButtons[i].onclick = onEarClicked;
	}

	// setGridOnClicks();

	// Set up the dropdown menu
	setUpDropdownMenu();

	// Call onDropdownChange to set up this page.
	onDropdownChanged();
}

function onEarClicked() {
	// stop other sounds playing
	stopAllSound();
	// repeat the sound
	playWordToRepeat();
}

function onRestartButtonClicked() {
	// stop sounds
	stopAllSound();

	// stop intervals
	clearInterval(glowWrongInterval);

	hideFireworks(); // just in case

	// restarts game with same settings
	onStartButtonClicked();
}

function onNewGameButtonClicked() {
	hideFireworks(); // just in case

	document.getElementById("settings-div").style.display = "inline";
	document.getElementById("playing-div").classList.add("hide");	
	// stop sounds
	stopAllSound();

	// stop intervals
	clearInterval(glowWrongInterval);
}

function onStartButtonClicked() {
	// Store all attibutes
	// how many vocab words to play in the round
	var selectedWordsPerGame = document.getElementById("rounds-per-game-dropdown").value;
	GAME_SETTINGS["rounds_per_game"] = parseInt(selectedWordsPerGame, 10);

	// number words to show to pick from
	var selectedWordsPerRound = document.getElementById("num-words-to-show-dropdown").value;
	GAME_SETTINGS["num_words_to_show"] = parseInt(selectedWordsPerRound, 10);

	if (CURRENT_COLUMN_DATA_WITH_METADATA['has_pictures']) {
		// Either pictures, words, or words_and_pictures
		GAME_SETTINGS["show_type"] = document.querySelector('input[name="play-with"]:checked').value;	
	} else {
		GAME_SETTINGS["show_type"] = "words";
	}

	// Color for left side
	GAME_SETTINGS["left_color_class"] = document.getElementById("left-color-dropdown").value;
	// Color for right side
	GAME_SETTINGS["right_color_class"] = document.getElementById("right-color-dropdown").value;

	// Hide settings div.
	document.getElementById("settings-div").style.display = "none";
	document.getElementById("playing-div").classList.remove("hide");	

	// Set colors
	setLeftAndRightColors(GAME_SETTINGS["left_color_class"], GAME_SETTINGS["right_color_class"]);

	// Get which vocab list to play with
	var selectedColumnKey = document.getElementById("column-title").value;
	CURRENT_COLUMN_KEY = selectedColumnKey;

	loadColumnAudio();
	setUpGame();
}

function setLeftAndRightColors(left_color_class, right_color_class) {
	var leftSideElem = document.getElementById("left-side");
	var rightSideElem = document.getElementById("right-side");

	// clear all
	leftSideElem.className = "";
	rightSideElem.className = "";

	// Add formatting classes back
	leftSideElem.classList.add("custom-font");  
	leftSideElem.classList.add("settings-text");
	rightSideElem.classList.add("custom-font");  
	rightSideElem.classList.add("settings-text");

	// Add class colors
	leftSideElem.classList.add(left_color_class);
	rightSideElem.classList.add(right_color_class);
}

/* Sets up variables for the new game. */
function setUpGame() {
	roundNumber = 0; // Number of rounds is:  GAME_SETTINGS["rounds_per_game"];
	leftPoints = 0;
	rightPoints = 0;

	// randomize
	randomizeVocabList();
	randomizedElementsAtStart = element_order_in_grid.slice(0); // deep copy

	// set points
	document.getElementById("left-points").innerHTML = leftPoints;
	document.getElementById("right-points").innerHTML = rightPoints;

	var title = CURRENT_COLUMN_DATA_WITH_METADATA["title"];
	document.getElementById("vocab-set-title").innerHTML = title;

	// set on clicks
	setOnGameGridClicks();

	setUpRound();
	// setFontLayout(); // TODO: customize font

}


function onCorrectWordClicked(isLeft, grid_id) {
	// stop other things from being clicked
	roundOver = true;

	// make it show just that one on the correct side
	var glowInterval = setInterval(function(){
			document.getElementById(getLeftOrRightGridDivID(isLeft, grid_id)).classList.toggle("glow");
	}, 200);

	// increment point
	incrementPoint(isLeft);

	playWordToEndRound(glowInterval, isLeft, grid_id);
}

function onGameEnded() {
	hideAllGridDivs();
	// Show fireworks
	if (leftPoints > rightPoints) {
		// Left wins
		document.getElementById("left-fireworks").style.display = "flex";
	} else if (rightPoints > leftPoints) {
		// Right wins
		document.getElementById("right-fireworks").style.display = "flex";
	} else {
		// Tie
		document.getElementById("left-fireworks").style.display = "flex";
		document.getElementById("right-fireworks").style.display = "flex";
	}
}

function hideFireworks() {
		document.getElementById("left-fireworks").style.display = "none";
		document.getElementById("right-fireworks").style.display = "none";
}


function onRoundEnded(glowInterval, isLeft, grid_id) {
	clearInterval(glowInterval);
	clearInterval(glowWrongInterval);

	document.getElementById(getLeftOrRightGridDivID(isLeft, grid_id)).classList.remove("glow");

	roundNumber += 1;
	if (roundNumber >= GAME_SETTINGS["rounds_per_game"]) {
		// GAME OVER
		onGameEnded();
	} else {
		setUpRound(); // start new round
	}
}

function playWordToRepeat() {
	if (CURRENT_COLUMN_DATA_WITH_METADATA["audio_data"] == USE_TEXT_AUDIO) {
		var textAudioID = getTextAudioID(wordToPlayElementIndex);
		playTextSound(textAudioID);
	} else { // Using Image Audio
		var imageAudioID = getImageAudioID(wordToPlayElementIndex);
		playImageSound(imageAudioID);
	}
}

function playWordToEndRound(glowInterval, isLeft, grid_id) {
	stopAllSound(); // don't let anything else play
	if (CURRENT_COLUMN_DATA_WITH_METADATA["audio_data"] == USE_TEXT_AUDIO) {
		var textAudioID = getTextAudioID(wordToPlayElementIndex);
		document.getElementById(textAudioID).onended = function(elem) {
		 	// sound stops, clear glowing
		 	onRoundEnded(glowInterval, isLeft, grid_id);
		};
		playTextSound(textAudioID);

	} else { // Using Image Audio
		var imageAudioID = getImageAudioID(wordToPlayElementIndex);
		document.getElementById(imageAudioID).onended = function(elem) {
			// sound stops, clear glowing
		 	onRoundEnded(glowInterval, isLeft, grid_id);
		};
		playImageSound(imageAudioID);
	}

}


function incrementPoint(isLeft) {
	// increment point itself
	if (isLeft) {
		leftPoints += 1;
		document.getElementById("left-points").innerHTML = leftPoints;
	} else {
		rightPoints += 1;
		document.getElementById("right-points").innerHTML = rightPoints;
	}
}

function onWrongWordClicked(isLeft, grid_id) {
	// Play sound??

	// make it show wrong one
	glowWrongInterval = setInterval(function(){
			document.getElementById(getLeftOrRightGridDivID(isLeft, grid_id)).classList.toggle("wrong-glow");
	}, 250);

	setTimeout(function() {
		clearInterval(glowWrongInterval);
	}, 500);
}

function onGameGridClicked(elementClicked) {
	if (roundOver){
		return;
	}
	var grid_element_id = elementClicked.target.id;

	// Gets last numbers from string, returns int
	// var grid_id = parseInt(grid_element_id.match(/\d+$/)[0], 10);

	var split_id = grid_element_id.split("-");

	var isLeft = (split_id[1] == 0);

	var grid_id = split_id[2];

	if (grid_id == gridIndexWinningWord) {
			// Correct word clicked
			onCorrectWordClicked(isLeft, grid_id);
	} else {
		onWrongWordClicked(isLeft, grid_id);
	}

}

function setUpRound() {
	wordToPlayElementIndex = randomizedElementsAtStart[roundNumber]; // like elementIndex
	console.log(CURRENT_COLUMN_DATA[wordToPlayElementIndex][0]);

	// gets index to put word at, between 0 and number words to show -1 .
	gridIndexWinningWord = getRandomInt(0, GAME_SETTINGS["num_words_to_show"]-1);

	// hide all elements
	hideAllGridDivs();

	// show ears
	showEars();
	// play sound of the word of the round
	playWordSoundToStartRound(gridIndexWinningWord, wordToPlayElementIndex);

}

function showEars() {
	document.getElementById("right-waiting-content").classList.remove("hide");	
	document.getElementById("left-waiting-content").classList.remove("hide");	
}

function hideEars() {
	document.getElementById("right-waiting-content").classList.add("hide");	
	document.getElementById("left-waiting-content").classList.add("hide");	
}

function hideAllGridDivs() {
	for (var grid_id=0; grid_id < MAX_NUM_PER_SIDE; grid_id++) {
		var gridDiv_left = getGridDivLeft(grid_id);
		document.getElementById(gridDiv_left).style.visibility = "hidden";

		var gridDiv_right = getGridDivRight(grid_id);
		document.getElementById(gridDiv_right).style.visibility = "hidden";

		// Make sure no buttons are red
		document.getElementById(gridDiv_left).classList.remove("wrong-glow");
		document.getElementById(gridDiv_right).classList.remove("wrong-glow");
	}
}

function showAllGridDivs() {
	for (var grid_id=0; grid_id < MAX_NUM_PER_SIDE; grid_id++) {
		var gridDiv_left = getGridDivLeft(grid_id);
		document.getElementById(gridDiv_left).style.visibility = "visible";

		var gridDiv_right = getGridDivRight(grid_id);
		document.getElementById(gridDiv_right).style.visibility = "visible";
	}
}

function hideContent() {
	document.getElementById("right-side-content").style.visibility = "hidden";	
	document.getElementById("left-side-content").style.visibility = "hidden";
}

function showContent() {
	document.getElementById("right-side-content").style.visibility = "visible";	
	document.getElementById("left-side-content").style.visibility = "visible";
}

function startRound() {
	roundOver = false;
}

function playWordSoundToStartRound(gridIndexWinningWord, wordToPlayElementIndex) {

	if (CURRENT_COLUMN_DATA_WITH_METADATA["audio_data"] == USE_TEXT_AUDIO) {
		var textAudioID = getTextAudioID(wordToPlayElementIndex);
		document.getElementById(textAudioID).onended = function(elem) {
			// When sound ends, show elements
			// load elements for round
			hideEars();
			showContent();
			showAllGridDivs();
			placeElementsForRound(gridIndexWinningWord, wordToPlayElementIndex);
			startRound();
		};
		playTextSound(textAudioID);

	} else { // Using Image Audio
		var imageAudioID = getImageAudioID(wordToPlayElementIndex);
		document.getElementById(imageAudioID).onended = function(elem) {
			// When sound ends, show elements
			// load elements for round
			hideEars();
			showContent();
			showAllGridDivs();
			placeElementsForRound(gridIndexForWord, wordToPlayElementIndex);
			startRound();
		};
		playImageSound(imageAudioID);
	}

}

function placeElementsForRound(gridIndexForWord, wordToPlayElementIndex) {
	var gridIndex = 0;
	var i = 0;

	while (gridIndex < GAME_SETTINGS["num_words_to_show"]) {
		if (element_order_in_grid[i] == wordToPlayElementIndex) {
			// this would be same SKIP
			i++; // increment
			continue;
		}
		// Know not the same as the other one

		if (gridIndex == gridIndexForWord) {
			// Place the word here 
			placeElementAtGridIndexLeftAndRight(gridIndexForWord, wordToPlayElementIndex);
		} else {
			// Place actual word here
			var elementIndex = element_order_in_grid[i];
			placeElementAtGridIndexLeftAndRight(gridIndex, elementIndex);
		}

		i++;
		gridIndex++;
	}

	for (var i = GAME_SETTINGS["num_words_to_show"]; i < MAX_NUM_PER_SIDE; i++) {
		// hide div
		hideElementAtLeftAndRight(i);
	}

}

function getGridDivLeft(grid_id) {
	return "gridDiv-0-" + grid_id;
}

function getGridDivRight(grid_id) {
	return "gridDiv-1-" + grid_id;
}

function hideElementAtLeftAndRight(gridIndex) {
	document.getElementById(getGridDivLeft(gridIndex)).style.visibility = "hidden";
	document.getElementById(getGridDivRight(gridIndex)).style.visibility = "hidden";
}

function showElementAtLeftAndRight(gridIndex) {
	document.getElementById(getGridDivLeft(gridIndex)).style.visibility = "visible";
	document.getElementById(getGridDivRight(gridIndex)).style.visibility = "visible";
}

function placeElementAtGridIndexLeftAndRight(gridIndex, elementId) {
	// Get data for that syllable
	var element_data = CURRENT_COLUMN_DATA[elementId];

	// Make sure div is showing
	showElementAtLeftAndRight(gridIndex); //??? maybe move 
	
	if (isGameUsingJustPictures()) {
		setLeftAndRightImage(gridIndex, elementId);
		return;
	}

	if (isGameUsingJustWords()) {
		setLeftAndRightText(gridIndex, elementId);
		return;
	} 
	
	// Using both! Pick randomly between show image or text
	if(getRandomInt(0, 1) == 0) {
		setLeftAndRightImage(gridIndex, elementId);
	} else {
		 setLeftAndRightText(gridIndex, elementId);
	}
}

function setLeftAndRightText(grid_id, element_id) {
	var element_data = CURRENT_COLUMN_DATA[element_id];
	// Set text left
	var text_id_left = getLeftTextID(grid_id); // ID for text element in HTML
	document.getElementById(text_id_left).innerHTML = element_data[getText_DataIndex()];
	document.getElementById(text_id_left).classList.remove("hide");

	document.getElementById(getLeftImageID(grid_id)).classList.add("hide"); 

	// Set text right
	var text_id_right = getRightTextID(grid_id); // ID for text element in HTML
	document.getElementById(text_id_right).innerHTML = element_data[getText_DataIndex()];
	document.getElementById(text_id_right).classList.remove("hide");
	document.getElementById(getRightImageID(grid_id)).classList.add("hide"); 
}

function setLeftAndRightImage(grid_id, element_id) {
	var element_data = CURRENT_COLUMN_DATA[element_id];
 	// Set image left
	var image_id_left = getLeftImageID(grid_id);
	document.getElementById(image_id_left).src = getImagePath(element_data[getImageFile_DataIndex()]);
	document.getElementById(image_id_left).classList.remove("hide");
	// hide text
	document.getElementById(getLeftTextID(grid_id)).classList.add("hide"); 

	// Set image right
	var image_id_right = getRightImageID(grid_id);
	document.getElementById(image_id_right).src = getImagePath(element_data[getImageFile_DataIndex()]);
	document.getElementById(image_id_right).classList.remove("hide");
	// hide text
	document.getElementById(getRightTextID(grid_id)).classList.add("hide"); 
}

/* Called when the user changes the dropdown item */
function onDropdownChanged() {
	// update globals to new columns
	// Values are the column keys
	var selectedColumnKey = document.getElementById("column-title").value;
	CURRENT_COLUMN_KEY = selectedColumnKey;
	updateGlobalsWhenColumnKeyChanges();

	if (!CURRENT_COLUMN_DATA_WITH_METADATA["has_pictures"]) {
		// NO PICTURES for this set, don't show the option
		document.getElementById("radio-buttons").classList.add("hide");
		document.getElementById("radio-buttons-label").classList.add("hide");
	} else {
		document.getElementById("radio-buttons").classList.remove("hide");
		document.getElementById("radio-buttons-label").classList.remove("hide");
	}
}

function updateGlobalsWhenColumnKeyChanges() {
	CURRENT_COLUMN_DATA_WITH_METADATA = vocabulary_sets_in_dropdown_data[CURRENT_COLUMN_KEY]; 
	CURRENT_COLUMN_DATA = CURRENT_COLUMN_DATA_WITH_METADATA["data"];
	NUMBER_OF_ITEMS = CURRENT_COLUMN_DATA.length; // Number of syllables in the column, 18 for Ꭰ
	element_order_in_grid = [...Array(NUMBER_OF_ITEMS).keys()]; 
	PAGE_NUM = 0; // make sure to reset page number!
}

function restPageToBeginning() {
	PAGE_NUM = 0; // make sure to reset page number!
}

/* Adds column options to the dropdown menu from the column_data.js file */
function setUpDropdownMenu() {
	var dropdown = document.getElementById("column-title"); 
	var columnDataKeys = Object.keys(vocabulary_sets_in_dropdown_data);

	for (var i = 0; i < columnDataKeys.length; i++) {
		var columnKey = columnDataKeys[i];

		// Get column data from large column object
		var column_data = vocabulary_sets_in_dropdown_data[columnKey];

		// Create the option element for the dropdown
		var option = document.createElement('option');
		option.text = column_data["title"]; // set the text to be the title
		option.value = columnKey; 			// set the value to be the index
		dropdown.appendChild(option);
	}
}

function showAllText() {
	// Show each image in grid and hide text.
	for (var i = 0; i < PAGE_SIZE; i++) { 
		hideImageShowText(i);
	}
}

function showAllImages() {
	// Show each image in grid and hide text.
	for (var i = 0; i < PAGE_SIZE; i++) { 
		showImageHideText(i);
	}
}

/* Randomizes the syllabary shown and resets the text and images to match the new order. */
function onScrambleClick() {
	restPageToBeginning();
	updatePrevNextButtons();

	randomizeVocabList();
	setPicturesAndText();
	changeButtonToSayShowAllImages();
}

/* onClick function for each grid item. Plays sound of syllable at the grid location. */
function gridClicked(elementClicked) {
	var grid_element_id = elementClicked.target.id;

	// Gets last numbers from string, returns int
	var grid_id = parseInt(grid_element_id.match(/\d+$/)[0], 10);

	// Get the element at that grid index
	var elementClicked = element_order_in_grid[grid_id]; // make sure to get element from correct page

	// If text is clicked
	if (isTextShown(grid_id)) {
		// Play Text Audio
		var textAudioID = getTextAudioID(elementClicked);
		document.getElementById(textAudioID).onended = function(elem) {
			// this function then shows the image
			onTextAudioStoppedPlaying(elem);
		};
		playTextSound(textAudioID);
	}
	else { // Otherwise image was clicked
		var imageAudioID = getImageAudioID(elementClicked);
		document.getElementById(imageAudioID).onended = function(elem) {
			// this function then shows the text
			onImageAudioStoppedPlaying(elem);
		}
		playImageSound(imageAudioID);
	}
	
}

function isTextShown(grid_id) {
	return document.getElementById(getGridTextID(grid_id)).style.display != "none";
}

function onTextAudioStoppedPlaying(elem){
	var stoppedAudioID = elem.target.id;
	var grid_id = getGridIndexFromElement(getElementIdFromAudioID(stoppedAudioID));

	setTimeout( function() {
		showImageHideText(grid_id);
	}, 300); // wait quarter of a second before flipping picture.
}

function onImageAudioStoppedPlaying(elem){
	var stoppedAudioID = elem.target.id;
	var grid_id = getGridIndexFromElement(getElementIdFromAudioID(stoppedAudioID));

	setTimeout( function() {
		hideImageShowText(grid_id);
	}, 300); // wait quarter of a second before flipping picture.
}

function hideImageShowText(grid_id) {
	// Hide image.
	hideGridImage(grid_id);
	// Show text.
	showGridText(grid_id);
}

function showImageHideText(grid_id) {
	// Show image.
	showGridImage(grid_id);
	// Hide text.
	hideGridText(grid_id);
}

function showGridImage(grid_id) {
	document.getElementById(getGridImageID(grid_id)).style.visibility = "visible";
}

function hideGridImage(grid_id) {
	document.getElementById(getGridImageID(grid_id)).style.visibility = "hidden";
}

function showGridText(grid_id) {
	// document.getElementById(getGridTextID(grid_id)).style.visibility = "visible";
	document.getElementById(getGridTextID(grid_id)).style.display = "flex";
}

function hideGridText(grid_id) {
	// document.getElementById(getGridTextID(grid_id)).style.visibility = "hidden";
	document.getElementById(getGridTextID(grid_id)).style.display = "none";
}


/* Play audio element for particular syllable. If the audio could not be found, print to console. */
function playTextSound(textAudioID){
   if (!document.getElementById(textAudioID)){
      console.log("could not find audio ID: " + textAudioID);
   } else {
   		document.getElementById(textAudioID).play();
    }
}

/* Play audio element for particular image. If the audio could not be found, print to console. */
function playImageSound(imageAudioID){
   if (!document.getElementById(imageAudioID)){
      console.log("could not find audio ID: " + imageAudioID);
   } else {
   		document.getElementById(imageAudioID).play();
    }
}

/* --- Set up functions --- */

function loadColumnAudio(){
	for (var i=0; i < NUMBER_OF_ITEMS; i++) {
		// Get which element is at this grid index:
		var element_index = element_order_in_grid[i];

		// Get data for that syllable
		// var element_data = a_column_data[element];
		var element_data = CURRENT_COLUMN_DATA[element_index];

		var textAudioID = getTextAudioID(element_index);
		// Audio has not been loaded yet
		if (document.getElementById(textAudioID) == null){

		// have to find in the subdirectory

		// Create syllable audio
		// This is nested in directory: audio/[subdirectory]
		var textAudioElem = createAudioElement(textAudioID,
                 getTextAudioPath(element_data[getTextAudio_DataIndex()]),
                 "audio/" + element_data[getTextAudioFileType_DataIndex()]);
		document.getElementById('audio-elements').appendChild(textAudioElem);

		// Create image audio
		// NOTE: file directory for image audio is audio/image_audio/[subdirectory]
		var imageAudioElem = createAudioElement(getImageAudioID(element_index),
             getImageAudioPath(element_data[getImageAudio_DataIndex()]),
             "audio/" + element_data[getImageAudioFileType_DataIndex()]);
		document.getElementById('audio-elements').appendChild(imageAudioElem);
	}
	}
}

function setFontLayout() {
	// Get the kind of text from the metadata
	if(CURRENT_COLUMN_DATA_WITH_METADATA["huge_font"]){
		// We're working with syllabary
		// Loop through all the div's
		for (var grid_id = 0; grid_id < PAGE_SIZE; grid_id++) { 
				// change classes for div surrounding text
				var divWrappingText = document.getElementById(getGridTextDivID(grid_id));
				divWrappingText.classList.remove('text-label');
				divWrappingText.classList.add('syllable-label');

				// change classes for text itself
				var textElement = document.getElementById(getGridTextID(grid_id));			
				textElement.classList.remove('text-label-heading');	
				textElement.classList.add('syllable-label-heading');
		}
	} else {
		for (var grid_id = 0; grid_id < PAGE_SIZE; grid_id++) { 
			// change classes for div surrounding text
			var divWrappingText = document.getElementById(getGridTextDivID(grid_id));
			divWrappingText.classList.add('text-label');
			divWrappingText.classList.remove('syllable-label');

			// change classes for text itself
			var textElement = document.getElementById(getGridTextID(grid_id));			
			textElement.classList.add('text-label-heading');	
			textElement.classList.remove('syllable-label-heading');
		}
	}

}

/* Sets the text for each item in the grid. Will be called to change the ordering of the syllables. */
function setPicturesAndText() {
	var endingIndex = PAGE_SIZE;

	// Hides grid items not being used 
	if (NUMBER_OF_ITEMS < (PAGE_SIZE * (PAGE_NUM +1))) {
		var startingGridId = getGridIndexFromElementIndex(NUMBER_OF_ITEMS);
		// this is the last page and it doesn't fill all the way
		for (var i = startingGridId; i < PAGE_SIZE; i++) {
			var gridDiv = document.getElementById(getGridDivID(i));
			gridDiv.style.display = "none";
		}
		endingIndex = startingGridId;
	}

	// Load picture and text for each grid item
	for (var i = 0; i < endingIndex; i++) { 
		// Get data for that syllable
		var element_data = getElementDataFromGridID(i);

		// Show div
		var gridDiv = document.getElementById(getGridDivID(i));
		gridDiv.style.display = "inline";

  	// Set image 
  	var image_id = getGridImageID(i);
  	document.getElementById(image_id).src = getImagePath(element_data[getImageFile_DataIndex()]);
  	// Hide image
  	document.getElementById(image_id).style.visibility = "hidden";

  	// Set text
  	var text_id = getGridTextID(i); // ID for text element in HTML
  	document.getElementById(text_id).innerHTML = element_data[getText_DataIndex()];
  	// Show text
  	document.getElementById(text_id).style.display = "flex";
	}


}

// ---- HELPER FUNCTIONS ----
function getElementDataFromGridID(grid_num) {
		var element_index = element_order_in_grid[grid_num];
		return CURRENT_COLUMN_DATA[element_index];
}

function getTextAudioPath(audio_filename){
	return "audio/text_audio/" + CURRENT_COLUMN_DATA_WITH_METADATA["subdirectory"] + "/" + audio_filename;
}

function getImageAudioPath(audio_filename){
	return "audio/image_audio/" + CURRENT_COLUMN_DATA_WITH_METADATA["subdirectory"] + "/" + audio_filename;
}

function getImagePath(image_filename){
	return "images/" + CURRENT_COLUMN_DATA_WITH_METADATA["subdirectory"] + "/" + image_filename;
}

function setOnGameGridClicks() {
	for (var grid_id=0; grid_id < MAX_NUM_PER_SIDE; grid_id++) {
		var gridDiv_left = getGridDivLeft(grid_id);
		document.getElementById(gridDiv_left).onclick = onGameGridClicked;

		var gridDiv_right = getGridDivRight(grid_id);
		document.getElementById(gridDiv_right).onclick = onGameGridClicked;
	}
}

function setGridOnClicks() {
	// Only set those that are in the grid!!

	// NOTE: Setting onClick to be on the actual text so that it is not
	// 		 triggered when the image is clicked.
	for (var grid_id=0; grid_id < PAGE_SIZE; grid_id++) {
		// Set Text onClick functions
		var gridDiv_id = getGridTextID(grid_id);
		var gridDiv = document.getElementById(gridDiv_id);
		gridDiv.onclick = gridClicked;

		var gridImg_id = getGridImageID(grid_id);
		var gridImg = document.getElementById(gridImg_id);
		gridImg.onclick = gridClicked;
	}
}

function onLeftColorChanged() {
	// the value is the name of the css class it was changed to
	var selectedColorValue = document.getElementById("left-color-dropdown").value;
	var colorTextElement = document.getElementById("left-color-text");

	colorTextElement.className = ""; // clears all classes 
	colorTextElement.classList.add(selectedColorValue); // add selected color
	colorTextElement.classList.add("custom-font"); // add back the other classes 
	colorTextElement.classList.add("settings-text");
}

function onRightColorChanged() {
	// the value is the name of the css class it was changed to
	var selectedColorValue = document.getElementById("right-color-dropdown").value;
	var colorTextElement = document.getElementById("right-color-text");

	colorTextElement.className = ""; // clears all classes 
	colorTextElement.classList.add(selectedColorValue); // add selected color
	colorTextElement.classList.add("custom-font"); // add back the other classes 
	colorTextElement.classList.add("settings-text");
}

/*
  Creates and returns audio element with ID, filename, and audio type specified
  audioType - something like "audio/wav"
*/
function createAudioElement(audioID, audioFileName, audioType){
  var audioElem = document.createElement("AUDIO");
  audioElem.id = audioID;

  var audioSource = document.createElement("SOURCE");
  audioSource.src =  audioFileName;
  audioSource.type = audioType;

  audioElem.appendChild(audioSource);
  return audioElem;
}


function hidePageNavButtons() {
	document.getElementById("pageNavDiv").style.visibility = "hidden";
}

function showPageNavButtons() {
	document.getElementById("pageNavDiv").style.visibility = "visible";
}

function stopAllSound() {
	$.each($('audio'), function () {
    this.pause();
    this.currentTime = 0.0; // resets to beginning. I guess there's no builtin stop.
	});
}

/* Returns grid id where the element clicked is */
function getGridIndexFromElement(element) {
	var element_index = element_order_in_grid.indexOf(element);
	return element_index % PAGE_SIZE;
}

function getGridIndexFromElementIndex(element_index) {
		return element_index % PAGE_SIZE;
}

function getElementIdFromAudioID(audio_id){
	// first element after dash is the CURRENT_COLUMN_KEY
 	return parseInt(audio_id.split('-')[2], 10);
}

function isGameUsingJustPictures() {
	return GAME_SETTINGS["show_type"] == "pictures";
}

function isGameUsingJustWords() {
	return GAME_SETTINGS["show_type"] == "words";
}

function isGameUsingBoth() {
		return GAME_SETTINGS["show_type"] == "words_and_pictures";
}

function getLeftOrRightGridDivID(isLeft, grid_id) {
	if (isLeft) {
		return "gridDiv-0-" + grid_id;
	} 
	return "gridDiv-1-" + grid_id;
}

function getRightTextID(grid_id) {
	return "element-1-" + grid_id;
}

function getLeftTextID(grid_id) {
	return "element-0-" + grid_id;
}

function getLeftImageID(grid_id) {
	return "img-0-" + grid_id;
}

function getRightImageID(grid_id) {
	return "img-1-" + grid_id;
}

function getGridTextDivID(grid_id) {
	return "textDiv" + grid_id;
}

function getGridImageContainerID(grid_id) {
	return "imgcontainer" + grid_id;
}

function getGridImageID(grid_id) {
	return "img" + grid_id;
}

function getGridTextID(grid_id) {
	return "element" + grid_id;
}

function getGridDivID(grid_id) {
	return "div" + grid_id;
}

function getTextAudioID(element_id) {
	// NOTE: Add column key to make the elements unique
	return "audio-" + CURRENT_COLUMN_KEY + "-" + element_id;
}

function getImageAudioID(element_id) {
	// NOTE: Add column key to make the elements unique
	return "imageAudio-" + CURRENT_COLUMN_KEY + "-" + element_id;
}

function randomizeVocabList() {
	element_order_in_grid.sort(function() { return 0.5 - Math.random() });
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}