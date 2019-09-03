
var CURRENT_COLUMN_KEY = Object.keys(vocabulary_sets_in_dropdown_data)[0]; // Number of syllables in the column, 18 for Ꭰ
var CURRENT_COLUMN_DATA_WITH_METADATA = vocabulary_sets_in_dropdown_data[CURRENT_COLUMN_KEY]; 
var CURRENT_COLUMN_DATA = CURRENT_COLUMN_DATA_WITH_METADATA["data"];
var NUMBER_OF_ITEMS = CURRENT_COLUMN_DATA.length; // Number of syllables in the column, 18 for Ꭰ
var PAGE_SIZE = 18;
var PAGE_NUM = 0; // Which page in the vocabulary is displayed. 0 is the first page.
var BUTTON_STATUS = {};
var USE_BINGO_IMAGES = true;

// Constants
var WAIT_TIME_BEFORE_FLIP_CARD = 800; // in miliseconds.

// Creates an array with numbers 0 to NUMBER_OF_ITEMS. 
// element_order_in_grid will contain a list of element id's. They are ordered by their placement
// in the grid. 
// For example, if element_order_in_grid = [1, 0, 2]
// 			then the 0th element in the grid is actually element 1 in a_column_data. 
// In this way, we can shuffle the indexes to randomize what text/pictures appear. 
var element_order_in_grid = [...Array(NUMBER_OF_ITEMS).keys()]; 

console.log("Version 10:52am");

// Call once when the page is loaded to initialize audio and grid onClick functions.
function onPageLoaded(){

	// NOTE: Load all elements before dropdown so that it cannot be switched while still loading

	randomizeSyllabaryList();

	// // Set onClicks
	document.getElementById("scrambleButton").onclick = function() { onScrambleClick(); };
	document.getElementById("column-title").onchange = onDropdownChanged;
	document.getElementById("previousButton").onclick = onPreviousButtonClicked;
	document.getElementById("nextButton").onclick = onNextButtonClicked;	
	setBingoOnClicks();

	// Set up the dropdown menu
	setUpDropdownMenu();

	// Call onDropdownChange to set up this page.
	onDropdownChanged();
}

/* Called when the user changes the dropdown item */
function onDropdownChanged() {
	stopAllSound();

	// update globals to new columns
	// Values are the column keys
	var selectedColumnKey = document.getElementById("column-title").value;
	CURRENT_COLUMN_KEY = selectedColumnKey;
	updateGlobalsWhenColumnKeyChanges();

	// Need to create a new "revealed" data object
	resetButtonStatusToFalse();

	// Call when globals change.
	updatePrevNextButtons();

	// Set font size, huge_font for syllable
	setFontLayout();

	// refresh page
	randomizeSyllabaryList();
	// load audio if do not have these loaded yet
	loadColumnAudio();

	// set pictures or text
	setBingoCards();
}

/* Enables and disables the page navigation buttons. Call whenever page changes. */
function updatePrevNextButtons() {
	// Hide both if there's just one page
	var numberPages = Math.ceil(NUMBER_OF_ITEMS/PAGE_SIZE);

	if (numberPages == 1) {
		// Hide both buttons!
		hidePageNavButtons();
		return;
	}	
		
	// make sure buttons are shown
	showPageNavButtons();
	
	if (PAGE_NUM == 0) {
		// Disable previous bc can't go back
		document.getElementById("previousButton").disabled = true;
		// Enable next button. Will be another page b/c at least 2 pages.
		document.getElementById("nextButton").disabled = false;
	} else if (PAGE_NUM == numberPages - 1) {
		// On last page, disable next button
		document.getElementById("nextButton").disabled = true;
		// Enable previous button. Will be another page b/c at least 2 pages.
		document.getElementById("previousButton").disabled = false;
	} else {
		// Enable both buttons
		document.getElementById("nextButton").disabled = false;
		document.getElementById("previousButton").disabled = false;
	}
}

function onNextButtonClicked() {
	var numberPages = Math.ceil(NUMBER_OF_ITEMS/PAGE_SIZE);
	if (PAGE_NUM == numberPages - 1) {
		return;
	}

	// Increase the page number
	PAGE_NUM = PAGE_NUM + 1;
	refreshWhenPageChanged();	
}

function onPreviousButtonClicked() {
	// if it's 0, do nothing bc shouldnt have been clicked anyway
	if (PAGE_NUM == 0) {
		return;
	}
	
	// Decrease the page number
	PAGE_NUM = PAGE_NUM - 1;
	refreshWhenPageChanged();
}

function refreshWhenPageChanged() {
	// once page number is updated, call refresh page numbers.
	updatePrevNextButtons();

	// set pictures or text
	setBingoCards();
}

function updateGlobalsWhenColumnKeyChanges() {
	CURRENT_COLUMN_DATA_WITH_METADATA = vocabulary_sets_in_dropdown_data[CURRENT_COLUMN_KEY]; 
	CURRENT_COLUMN_DATA = CURRENT_COLUMN_DATA_WITH_METADATA["data"];
	NUMBER_OF_ITEMS = CURRENT_COLUMN_DATA.length; // Number of syllables in the column, 18 for Ꭰ
	element_order_in_grid = [...Array(NUMBER_OF_ITEMS).keys()]; 
	PAGE_NUM = 0; // make sure to reset page number!
	USE_BINGO_IMAGES = CURRENT_COLUMN_DATA_WITH_METADATA["use_images"]

	// Update delay time if changed in metadata
	if (CURRENT_COLUMN_DATA_WITH_METADATA["time_delay_before_flip"] != null ){
		WAIT_TIME_BEFORE_FLIP_CARD = CURRENT_COLUMN_DATA_WITH_METADATA["time_delay_before_flip"] * 1000;
	}
}

function resetPageToBeginning() {
	PAGE_NUM = 0; // make sure to reset page number!
}

/* Adds column options to the dropdown menu from the column_data.js file */
function setUpDropdownMenu() {
	var dropdown = document.getElementById("column-title");

	for (var columnKey in Object.keys(vocabulary_sets_in_dropdown_data)) {
		// Get column data from large column object
		var column_data = vocabulary_sets_in_dropdown_data[columnKey];

		// Create the option element for the dropdown
		var option = document.createElement('option');
		option.text = column_data["title"]; // set the text to be the title
		option.value = columnKey; 			// set the value to be the index
		dropdown.appendChild(option);
	}
}
 

/* Randomizes the syllabary shown and resets the text and images to match the new order. */
function onScrambleClick() {
	resetPageToBeginning();
	updatePrevNextButtons();

	// Reset data to false.
	resetButtonStatusToFalse();

	randomizeSyllabaryList();
	// set pictures or text
	setBingoCards();
}

function onButtonAudioStoppedPlaying(elem) {
	var stoppedAudioID = elem.target.id;
	var grid_id = getGridIndexFromElement(getElementIdFromAudioID(stoppedAudioID));

	setTimeout( function() {
		if (USE_BINGO_IMAGES){
			showImageHideButton(grid_id);
		} else {
			showTextHideButton(grid_id);
		}
	}, WAIT_TIME_BEFORE_FLIP_CARD); // wait time
}

/* Called when a bingo button is clicked*/
function buttonClicked(htmlElementClicked) {
	// Gets last numbers from string, returns int
	var grid_id = getGridIdFromHTMLElement(htmlElementClicked.target.id);

	// Mark revealed
	markButtonRevealed(grid_id);

	// Get the element at that grid index
	var elementClicked = element_order_in_grid[getElementIndexFromGridNum(grid_id)]; // make sure to get element from correct page

	// Play text audio
	var textAudioID = getTextAudioID(elementClicked);

	document.getElementById(textAudioID).onended = function(elem) {
		// this function then shows the image
		onButtonAudioStoppedPlaying(elem);
	};
	playTextSound(textAudioID);
}

/* Called when an image is clicked*/
function imageClicked(htmlElementClicked) {
	// Gets last numbers from string, returns int
	var grid_id = getGridIdFromHTMLElement(htmlElementClicked.target.id);

	// Get the element at that grid index
	var elementClicked = element_order_in_grid[getElementIndexFromGridNum(grid_id)]; 
	var imageAudioID = getImageAudioID(elementClicked);

	// Just play sound. Doesn't matter when it stops bc not flipping back.
	playImageSound(imageAudioID);
}

/* Called when an image is clicked*/
function textClicked(htmlElementClicked) {
	// Gets last numbers from string, returns int
	var grid_id = getGridIdFromHTMLElement(htmlElementClicked.target.id);

	// Get the element at that grid index
	var elementClicked = element_order_in_grid[getElementIndexFromGridNum(grid_id)]; 
	var imageAudioID = getImageAudioID(elementClicked);

	// Just play sound. Doesn't matter when it stops bc not flipping back.
	playImageSound(imageAudioID);
}

/* Play audio element for particular syllable. If the audio could not be found, print to console. */
function playTextSound(textAudioID){
   if (!document.getElementById(textAudioID)){
      console.log("could not find audio ID: " + textAudioID);
   } else {
   		// make sure only sound playing
   		stopAllSound();
   		var promise = document.getElementById(textAudioID).play();

   		if (promise) {
			    //Older browsers may not return a promise, according to the MDN website
			    promise.catch(function(error) { console.log(error); });
			}
    }
}

/* Play audio element for particular image. If the audio could not be found, print to console. */
function playImageSound(imageAudioID){
   if (!document.getElementById(imageAudioID)){
      console.log("could not find audio ID: " + imageAudioID);
   } else {
			// stop other sounds playing
	   	stopAllSound();
   		var promise = document.getElementById(imageAudioID).play();
   		if (promise) {
		    //Older browsers may not return a promise, according to the MDN website
		    promise.catch(function(error) { console.log(error); });
			}
    }
}

/* --- Set up functions --- */

function resetButtonStatusToFalse() {
	// each page should have an array that is page size in length, initalized with false.
	var numberPages = Math.ceil(NUMBER_OF_ITEMS/PAGE_SIZE);

	for (var pageNum = 0; pageNum < numberPages; pageNum++) {
		BUTTON_STATUS[pageNum] = Array(PAGE_SIZE).fill(false);
	}
}

function loadColumnAudio(){
	for (var i=0; i < NUMBER_OF_ITEMS; i++) {
		// Get which element is at this grid index:
		var element_index = element_order_in_grid[getElementIndexFromGridNum(i)];

		// Get data for that syllable
		var element_data = getElementDataFromGridID(i);

		var textAudioID = getTextAudioID(element_index);
		// Audio has not been loaded yet
		if (document.getElementById(textAudioID) == null){

			// Create syllable audio
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

function setBingoCards() {
	// if images
		setBingoPicturesOrText();
}

/* Sets the text for each item in the grid. Will be called to change the ordering of the syllables. */
function setBingoPicturesOrText() {
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

	// Load picture or text for each grid item
	for (var grid_id = 0; grid_id < endingIndex; grid_id++) { 
		// Get data for that syllable
		var element_data = getElementDataFromGridID(grid_id);

		// Show div
		var gridDiv = document.getElementById(getGridDivID(grid_id));
		gridDiv.style.display = "inline";

  	// Set image or text
  	if (USE_BINGO_IMAGES){
  		document.getElementById(getGridImageID(grid_id)).src = getImagePath(element_data[getImageFile_DataIndex()]);
  	} else {
  		// Set text
  		document.getElementById(getGridTextID(grid_id)).innerHTML = element_data[getText_DataIndex()];
  }

		// Show div or hide depending on reveal data
		if (isButtonRevealed(grid_id)) {
			if(USE_BINGO_IMAGES){
				showGridImage(grid_id);
			} else {
				showGridText(grid_id);
			}
			hideButton(grid_id);
		} else {
			// Not revealed!
  		hideGridImage(grid_id);
  		hideGridText(grid_id); // might as well hide both
			showButton(grid_id);
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

				if (!CURRENT_COLUMN_DATA_WITH_METADATA["use_images"]){
					// need to add margin to the bottom of text div's
					divWrappingText.classList.add('bottom-margin-for-text');
				} else {
					divWrappingText.classList.remove('bottom-margin-for-text');
				}

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

			if (!CURRENT_COLUMN_DATA_WITH_METADATA["use_images"]){
				// need to add margin to the bottom of text div's
				divWrappingText.classList.add('bottom-margin-for-text');
			} else {
				divWrappingText.classList.remove('bottom-margin-for-text');
			}

			// change classes for text itself
			var textElement = document.getElementById(getGridTextID(grid_id));			
			textElement.classList.add('text-label-heading');	
			textElement.classList.remove('syllable-label-heading');
		}
	}
}

function stopAllSound() {
	$.each($('audio'), function () {
    this.pause();
    this.currentTime = 0.0; // resets to beginning. I guess there's no builtin stop.
	});
}

// ---- HELPER FUNCTIONS ----

function getElementDataFromGridID(grid_num) {
		var element_index = element_order_in_grid[getElementIndexFromGridNum(grid_num)];
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

function setBingoOnClicks() {
	// Only set those that are in the grid!!

	// NOTE: Setting onClick to be on the actual text so that it is not
	// 		 triggered when the image is clicked.
	for (var grid_id=0; grid_id < PAGE_SIZE; grid_id++) {
		var gridBingoButton_id = getBingoImgButtonID(grid_id);
		var gridBingoButton = document.getElementById(gridBingoButton_id);
		gridBingoButton.onclick = buttonClicked;

		var gridImg_id = getGridImageID(grid_id);
		var gridImg = document.getElementById(gridImg_id);
		gridImg.onclick = imageClicked;

		// TODO: set text onclicks
		var gridDiv_id = getGridTextID(grid_id); //TODO: see if clicking text or div is better
		var gridDiv = document.getElementById(gridDiv_id);
		gridDiv.onclick = textClicked;
	}
}

/*
  Creates and returns audio element with ID, filename, and audio type specified
  audioType - something like "audio/wav"
*/
function createAudioElement(audioID, audioFileName, audioType){
  var audioElem = document.createElement("AUDIO");
  audioElem.id = audioID;
  audioElem.preload = "auto";

  var audioSource = document.createElement("SOURCE");
  audioSource.src =  audioFileName;
  audioSource.type = audioType;

  audioElem.appendChild(audioSource);
  return audioElem;
}

function getGridIdFromHTMLElement(htmlElementID) {
	return parseInt(htmlElementID.match(/\d+$/)[0], 10);
}

function markButtonRevealed(grid_id) {
	BUTTON_STATUS[PAGE_NUM][grid_id] = true;
}

function isButtonRevealed(grid_id) {
	return BUTTON_STATUS[PAGE_NUM][grid_id];
}

function isButtonShown(grid_id) {
	return document.getElementById(getBingoImgButtonID(grid_id)).style.display != "none";
}

function isTextShown(grid_id) {
	return document.getElementById(getGridTextID(grid_id)).style.display != "none";
}

function hideImageShowText(grid_id) {
	// Hide image.
	hideGridImage(grid_id);
	// Show text.
	showGridText(grid_id);
}

function hideImageShowButton(grid_id) {
	// Hide image.
	hideGridImage(grid_id);
	// Show text.
	showButton(grid_id);
}

function showTextHideButton(grid_id) {
	// Show text.
	showGridText(grid_id);
	// Hide text.
	hideButton(grid_id);
}

function showImageHideButton(grid_id) {
	// Show image.
	showGridImage(grid_id);
	// Hide text.
	hideButton(grid_id);
}

function showImageHideText(grid_id) {
	// Show image.
	showGridImage(grid_id);
	// Hide text.
	hideGridText(grid_id);
}

function showGridImage(grid_id) {
	document.getElementById(getGridImageID(grid_id)).style.display = "flex";
}

function hideGridImage(grid_id) {
	document.getElementById(getGridImageID(grid_id)).style.display = "none";
}

function showButton(grid_id) {
	document.getElementById(getBingoImgButtonID(grid_id)).style.display = "flex";
}

function hideButton(grid_id) {
	document.getElementById(getBingoImgButtonID(grid_id)).style.display = "none";
}

function showGridText(grid_id) {
	document.getElementById(getGridTextDivID(grid_id)).classList.remove("hide-element");
	document.getElementById(getGridTextID(grid_id)).style.display = "flex";
}

function hideGridText(grid_id) {
	document.getElementById(getGridTextDivID(grid_id)).classList.add("hide-element");
	document.getElementById(getGridTextID(grid_id)).style.display = "none";
}

function hidePageNavButtons() {
	document.getElementById("pageNavDiv").style.visibility = "hidden";
}

function showPageNavButtons() {
	document.getElementById("pageNavDiv").style.visibility = "visible";
}

/* Returns grid id where the element clicked is */
function getGridIndexFromElement(element) {
	var element_index = element_order_in_grid.indexOf(element);
	return element_index % PAGE_SIZE;
}

function getGridIndexFromElementIndex(element_index) {
		return element_index % PAGE_SIZE;
}

function getElementIndexFromGridNum(grid_num){
	// PAGE_NUM * NUM_IN_PAGE + grid_num
	return PAGE_NUM * PAGE_SIZE + grid_num;
}

function getElementIdFromAudioID(audio_id){
	// first element after dash is the CURRENT_COLUMN_KEY
 	return parseInt(audio_id.split('-')[2], 10);
}

function getBingoImgButtonID(grid_id) {
	return "button" + grid_id;
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

function randomizeSyllabaryList() {
	element_order_in_grid.sort(function() { return 0.5 - Math.random() });
}