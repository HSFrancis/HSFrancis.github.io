
var CURRENT_DICT_KEY = Object.keys(dictionaries_in_dropdown_data)[0]; 
var	DICT_DATA_WITH_METADATA = dictionaries_in_dropdown_data[CURRENT_DICT_KEY];
var ALL_PAGES_DATA_WITH_METADATA = DICT_DATA_WITH_METADATA["pages_data"];

var CURRENT_PAGE_KEY = 0;
var PAGE_DATA_WITH_METADATA = ALL_PAGES_DATA_WITH_METADATA[CURRENT_PAGE_KEY];
var CURRENT_PAGE_DATA = PAGE_DATA_WITH_METADATA[getData_MetadataIndex()];

var NUMBER_OF_PAGES = ALL_PAGES_DATA_WITH_METADATA.length; // Number of pages in dictionary
var NUMBER_OF_ITEMS_PAGE = CURRENT_PAGE_DATA.length; // Number of items on the page

var WRONG_SOUND_ID = "wrong-sound";

var clickedElementId = undefined;

var matchedElements = new Set();

var s = Snap("#interactive-area");
document.getElementById("dictionary-title").onchange = onDropdownChanged;

setUpDropdownMenu();
loadThumbnails();
loadWrongSound();


function goToPage(page_num) {
	// Switch current page number
	CURRENT_PAGE_KEY = page_num;

	PAGE_DATA_WITH_METADATA = ALL_PAGES_DATA_WITH_METADATA[CURRENT_PAGE_KEY];
	CURRENT_PAGE_DATA = PAGE_DATA_WITH_METADATA[getData_MetadataIndex()];
	NUMBER_OF_ITEMS_PAGE = CURRENT_PAGE_DATA.length; // Number of items on the page
	loadNewPageContent();
	showOrHidePageNav(page_num);
}


/* ---- FUNCTIONS ---- */

/* -- event handlers -- */

function onLeftArrowClicked() {
	// go back a page
	if (CURRENT_PAGE_KEY == 0) {
		// TODO: Could let this go back to the main page.
		return;
	}

	stopAllSound();
	CURRENT_PAGE_KEY = CURRENT_PAGE_KEY - 1;
	goToPage(CURRENT_PAGE_KEY);
}

function onRightArrowClicked() {
	// go back a page
	if (CURRENT_PAGE_KEY == NUMBER_OF_PAGES - 1) {
		// TODO: Could let this go back to the main page.
		return;
	}

	stopAllSound();
	CURRENT_PAGE_KEY = CURRENT_PAGE_KEY + 1;
	goToPage(CURRENT_PAGE_KEY);
}

function onSVGLoaded( f ){ 
	// console.log("onSVGLoaded for page: " + CURRENT_PAGE_KEY); 
	var fragmentID = getSvgPageFragmentID(CURRENT_PAGE_KEY);

	// add whole fragment to the SVG
	f.node.id = fragmentID; // set id
	s.append( f );

	if (isDragAndDrop()) {
   setUpBubbles();
	} else {
		// Set on clicks
		setOnSvgClicks();
	}	
}

function onBubbleClicked(event) {
	stopAllSound();
	// Highlight element
		// gets actual group element
	if (event.path.length >= 2) {
		var groupElem = event.path[1];

		// don't do anything if not different
		if (groupElem.id != clickedElementId){
			console.log("svgElementId: " + groupElem.id + "  clickedElementId: " + clickedElementId);

			highlightElement(groupElem);
			if (clickedElementId != undefined) {
				unHighlightElement(document.getElementById(clickedElementId));
			}

			// set the global
			clickedElementId = groupElem.id;
			highlightDropzones();
			playSound(getTextAudioIdFromSVGId(groupElem.id));
		}
		else {
			playSound(getTextAudioIdFromSVGId(clickedElementId));
		}
	}
}

function wrongDropZoneClicked() {
	console.log("wrong dropzone clicked");
	playWrongSound();
}

function correctDropZoneClicked() {

	playSound(getTextAudioIdFromSVGId(clickedElementId));

	moveClickedElementToTarget();

	// add matched to set
	matchedElements.add(clickedElementId);

	// remove click bubble 
	var clickedElem = s.select("#" + clickedElementId);
	clickedElem.unclick(onBubbleClicked);

	// add different click to just play sound
	clickedElem.click(onDroppedBubbleClicked);

	// make it not clicked anymore
	clickedElementId = undefined;
	unHighlightDropzones();
}

function moveClickedElementToTarget() {
	var targetIdForClickedElem = getSvgTargetIdFromSvgElemId(clickedElementId);

	var outerbb = s.select('#' + targetIdForClickedElem).getBBox();

	var clickedElem = s.select('#' + clickedElementId);

	var bb = clickedElem.getBBox();
	var diffX = outerbb.cx - bb.cx;
	var diffY = outerbb.cy - bb.cy; 

	clickedElem.animate({
                transform: 'T' + diffX + ',' + diffY
             }, 750, mina.easeout);

}

function onDropPlaceClicked(event) {
	if (clickedElementId != undefined) {
		// only pay attention if something is clicked
		var clickedId = event.target.id;

		var targetIdForClickedElem = getSvgTargetIdFromSvgElemId(clickedElementId);

		if (clickedId == targetIdForClickedElem) {
			// CORRECT DROPZONE CLICKED
			correctDropZoneClicked();
		} else {
			// NOT CORRECT DROPZONE CLICKED
			wrongDropZoneClicked();
		}
	}
}

function unHighlightDropzones() {
	for (var element_id=0; element_id < NUMBER_OF_ITEMS_PAGE; element_id ++) {
		var dropTargetId = getSvgTargetIdFromElementId(element_id);
		unHighlightDropElement(document.getElementById(dropTargetId));

		var dropTargetElem = s.select("#" + dropTargetId);
		dropTargetElem.unclick(onDropPlaceClicked);
	}
}

function highlightDropzones() {
	// matchedElements
	for (var element_id=0; element_id < NUMBER_OF_ITEMS_PAGE; element_id ++) {
		if (!matchedElements.has(getSvgIdFromElementId(element_id))) {

			var dropTargetId = getSvgTargetIdFromElementId(element_id);

			// not been matched yet, highlight!
			highlightDropElement(document.getElementById(dropTargetId));

			var dropTargetElem = s.select("#" + dropTargetId);

			dropTargetElem.click(onDropPlaceClicked);
		
		}
	}
}

function highlightDropElement(dropElement) {
  dropElement.style.strokeOpacity = 1;		
  dropElement.style.stroke = "blue";		
  dropElement.style.strokeWidth = 3;		
}

function unHighlightDropElement(dropElement) {
  dropElement.style.strokeOpacity = 0;		
}


function setUpBubbles() {
	for (var element_id=0; element_id < NUMBER_OF_ITEMS_PAGE; element_id ++) {
		// set onclick
	  var svgId = getSvgIdFromElementId(element_id);
	  var svgElement = s.select("#" + svgId);
	  svgElement.click(onBubbleClicked);
	}
}

function unHighlightElement(element) {
  var ellipseOfBubble = element.firstElementChild;
  ellipseOfBubble.style.strokeOpacity = 0;
}

function highlightElement(element) {
	var colorFromMetadata = DICT_DATA_WITH_METADATA["drag_bubble_outline_color"];
  var ellipseOfBubble = element.firstElementChild;

	if (colorFromMetadata != null) {
		 // Style bubble
	  ellipseOfBubble.style.stroke = colorFromMetadata;
	} else {
	  ellipseOfBubble.style.stroke = "yellow";		
	}
	// otherwise just change stroke width
	ellipseOfBubble.style.strokeWidth = 4;
  ellipseOfBubble.style.strokeOpacity = 1;
}

function onDroppedBubbleClicked(event) {
	if (event.path.length >= 2) {
		var groupElem = event.path[1];
		playSound(getTextAudioIdFromSVGId(groupElem.id));
	}
}

function isDragAndDrop() {
	return DICT_DATA_WITH_METADATA["drag_and_drop_text"];
}


function onThumbnailClicked(elem) {
	var page_num = getThumbnailNumFromId(elem.target.id);

	// Hide main page
	document.getElementById("main-page-content").classList.add("hide");

	// Open page viewing layout
	document.getElementById("page-content-div").classList.remove("hide");

	document.getElementById("left-arrow").onclick = onLeftArrowClicked;
	document.getElementById("right-arrow").onclick = onRightArrowClicked;

	document.getElementById("home-button").onclick = onHomeButtonClicked;

	goToPage(page_num);
}

function onHomeButtonClicked() {
	stopAllSound();

	// hide page viewing
	document.getElementById("page-content-div").classList.add("hide");

	// open main page
	document.getElementById("main-page-content").classList.remove("hide");
}


function onSvgElementClicked(elem) {
	var svgElementId = elem.target.id;
	// stop other sounds
	stopAllSound();

	// play sound
	playSound(getTextAudioIdFromSVGId(svgElementId));
}

/* Called when the user changes the dropdown item */
function onDropdownChanged() {
	// update globals to new columns
	// Values are the column keys
	var selectedDictKey = document.getElementById("dictionary-title").value;
	CURRENT_DICT_KEY = selectedDictKey;
	DICT_DATA_WITH_METADATA = dictionaries_in_dropdown_data[CURRENT_DICT_KEY];
	ALL_PAGES_DATA_WITH_METADATA = DICT_DATA_WITH_METADATA["pages_data"];
	CURRENT_PAGE_KEY = 0;
	PAGE_DATA_WITH_METADATA = ALL_PAGES_DATA_WITH_METADATA[CURRENT_PAGE_KEY];
	CURRENT_PAGE_DATA = PAGE_DATA_WITH_METADATA[getData_MetadataIndex()];
	NUMBER_OF_ITEMS_PAGE = CURRENT_PAGE_DATA.length; // Number of items on the page
	NUMBER_OF_PAGES = ALL_PAGES_DATA_WITH_METADATA.length; // Number of pages

	// Clear old thumbnails
	document.getElementById("page-thumbnail-container").innerHTML = "";
	// Load new thumbnails
	loadThumbnails();
}

/* --- HELPER FUNCTIONS --- */

function loadNewPageContent() {
	setImageToFitWholeScreen();

	// clear matched elements
	matchedElements = new Set();

	var gs = s.selectAll('svg');
	for (var i = 0; i < gs.length; i++) {
		// remove 
		console.log(gs[i].node.id);
		gs[i].remove();
	}

	 		var image_filepath = "image_pages/" + DICT_DATA_WITH_METADATA["subdirectory"] 
																			+ "/" 
																			+ PAGE_DATA_WITH_METADATA[getImageFilename_MetadataIndex()];
 		// Load the new page
 		Snap.load(image_filepath, onSVGLoaded) ; 
		loadPageAudio();
}

function setOnSvgClicks() {
	for (var element_index=0; element_index < NUMBER_OF_ITEMS_PAGE; element_index++) {

	  var svgId = getSvgIdFromElementId(element_index);
	  var svgElement = s.select("#" + svgId);
	  svgElement.click(onSvgElementClicked);
	}
}

function setImageToFitWholeScreen() {
	var fullPageHeight = document.documentElement.clientHeight;
	var fullPageWidth = document.documentElement.clientWidth;
	s.attr({ viewBox: "0 0 " + fullPageWidth + " " + fullPageHeight });
}

/* Play audio element for particular Svg element */
function playSound(textAudioID){
   if (!document.getElementById(textAudioID)){
      console.log("could not find audio ID: " + textAudioID);
   } else {
   		document.getElementById(textAudioID).play();
    }
}

function stopAllSound() {
	$.each($('audio'), function () {
    this.pause();
    this.currentTime = 0.0; // resets to beginning. I guess there's no builtin stop.
	});
}

function playWrongSound() {
 if (!document.getElementById(WRONG_SOUND_ID)){
    console.log("could not find audio ID: " + WRONG_SOUND_ID);
 } else {
 		document.getElementById(WRONG_SOUND_ID).play();
  }
}

function loadWrongSound() {
	// Create syllable audio
	var audioElem = createAudioElement(WRONG_SOUND_ID,
               "audio/incorrect.mp3",
               "audio/mp3");
	document.getElementById('audio-elements').appendChild(audioElem);
}

function loadPageAudio(){
	for (var element_index=0; element_index < NUMBER_OF_ITEMS_PAGE; element_index++) {
		// Get which element is at this grid index:

		var element_data = CURRENT_PAGE_DATA[element_index];

		var textAudioID = getTextAudioID(element_index);
		// Audio has not been loaded yet
		if (document.getElementById(textAudioID) == null){

			// Create syllable audio
			var textAudioElem = createAudioElement(textAudioID,
	                 getTextAudioPath(element_data[getTextAudio_DataIndex()]),
	                 "audio/" + element_data[getTextAudioFileType_DataIndex()]);
			document.getElementById('audio-elements').appendChild(textAudioElem);
		}
	}
}

// Create a thumbnail for a page
function createPageThumbnail(page_num) {
	var columnDiv = document.createElement("div"); 
	columnDiv.classList.add("col-3");

	var pageImage = document.createElement("IMG");
	pageImage.src = getThumbnailFilepath(page_num);
	pageImage.id = getThumbnailID(page_num);
	pageImage.onclick = onThumbnailClicked;

	columnDiv.appendChild(pageImage);
	return columnDiv;
}

function loadThumbnails() {
	var thumbnailRow = document.getElementById("page-thumbnail-container");
	
	for (var i=0; i < NUMBER_OF_PAGES; i ++) {
		var newColDiv = createPageThumbnail(i);
		thumbnailRow.appendChild(newColDiv);
	}
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

/* Adds column options to the dropdown menu from the load_image_vocab.js file */
function setUpDropdownMenu() {
	var dropdown = document.getElementById("dictionary-title");

	for (var columnKey in Object.keys(dictionaries_in_dropdown_data)) {
		// Get column data from large column object
		var column_data = dictionaries_in_dropdown_data[columnKey];

		// Create the option element for the dropdown
		var option = document.createElement('option');
		option.text = column_data["title"]; // set the text to be the title
		option.value = columnKey; 			// set the value to be the index
		dropdown.appendChild(option);
	}
}

function showOrHidePageNav(page_num) {
	if (page_num == 0) {
		// first page, can't go back
		document.getElementById("left-arrow").classList.add("hide");
	} else {
		document.getElementById("left-arrow").classList.remove("hide");
	}

	if (page_num == NUMBER_OF_PAGES - 1) {
		document.getElementById("right-arrow").classList.add("hide");
	} else if (page_num < NUMBER_OF_PAGES - 1) {
		document.getElementById("right-arrow").classList.remove("hide");
	}
}

function getSvgTargetIdFromSvgElemId(svg_elem_id) {
	return svg_elem_id + "_target";
}

/* -- HELPER FUNCTIONS getters -- */
function getSvgTargetIdFromElementId(element_id) {
	return getSvgIdFromElementId(element_id) + "_target";
}

function getThumbnailFilepath(page_num) {
	return getSvgImageFilepathFromCurrentDict(ALL_PAGES_DATA_WITH_METADATA[page_num][getImageFilename_MetadataIndex()]);
}

function getSvgImageFilepathFromCurrentDict(filename) {
	return "image_pages/" + DICT_DATA_WITH_METADATA["subdirectory"] + "/" + filename;
}

function getSvgPageFragmentID(page_num) {
	// put dictionary key in case loaded other dictionary pages
	return "fragment-" + CURRENT_DICT_KEY + "-" + page_num;
}

function getSvgIdFromElementId(element_id) {
	return CURRENT_PAGE_DATA[element_id][getSvgElementId_DataIndex()];
}

function getTextAudioPath(audio_filename){
	return "audio/" + DICT_DATA_WITH_METADATA["subdirectory"] + "/" + audio_filename;
}

function getTextAudioIdFromSVGId(svg_id) {
	return "audio-" + CURRENT_PAGE_KEY + "-" + svg_id;
}

function getTextAudioID(element_id) {
	// NOTE: Add page key to make the elements unique
	return getTextAudioIdFromSVGId(getSvgIdFromElementId(element_id));
}

function getThumbnailID(page_num) {
	return "thumbnail" + page_num;
}

function getThumbnailNumFromId(thumbnailID) {
	return parseInt(thumbnailID.match(/\d+$/)[0], 10);
}
