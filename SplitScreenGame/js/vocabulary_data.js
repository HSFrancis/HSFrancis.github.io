/* Constants */
const USE_IMAGE_AUDIO = 0;
const USE_TEXT_AUDIO = 1;
const USE_IMAGE_AND_TEXT_AUDIO = 2;


var a_column_data = [
	/* element -> [text, text_audio, text_audio_filetype, image, image_audio, image_audio_filetype] */
	 ['Ꭰ', "a.wav", "wav", "GirlJumpRope.PNG", "0391GLGirlAgehyutsa080619.mp3", "mp3"],
	 ['Ꭶ', "ga.wav", "wav", "Cucumber.PNG", "0391GLCucumberGagama080619.mp3", "mp3"],
	 ['Ꭷ', "ka.wav", "wav", "Duck02.PNG", "0391GLDuckKawonu080619.mp3", "mp3"],
	 ['Ꭽ', "ha.wav", "wav", "Bell.PNG", "0391GLBellHalvna080619.mp3", "mp3"],
	 ['Ꮃ', "la.wav", "wav", "Aligator.PNG", "0391GLAlligatorTsulasgi080619.mp3", "mp3"],
	 ['Ꮉ', "ma.wav", "wav", "Butterfly.PNG", "0391GLButterflyKamama080619.mp3", "mp3"],
	 ['Ꮎ', "na.wav", "wav", "Bear.PNG", "0391GLBearYona080619.mp3", "mp3"],
	 ['Ꮏ', "hna.wav", "wav", "Shirt.PNG", "0391GLShirtAhnawo080619.mp3", "mp3"],
	 ['Ꮖ', "gwa.wav", "wav", "Peach.PNG", "0391GLPeachKwana080619.mp3", "mp3"], 
	 ['Ꮝ', "s.wav", "wav", "Bug.PNG", "0391GLBugSgoyi080619.mp3", "mp3"],
	 ['Ꮜ', "sa.wav", "wav", "Squirrel02.PNG", "0391GLSquirellSaloli080619.mp3", "mp3"],
	 ['Ꮣ', "da.wav", "wav", "Whale.png", "0391GLWhaleDakwa080619.mp3", "mp3"],
	 ['Ꮤ', "ta.wav", "wav", "Cricket.PNG", "0391GLCricketTaladu080619.mp3", "mp3"],
	 ['Ꮬ', "dla.wav", "wav", "Bluejay03.PNG", "0391GLBluejayDlayga080619.mp3", "mp3"],
	 ['Ꮭ', "tla.wav", "wav", "Moth.PNG", "0391GLMothWasotla080619.mp3", "mp3"],
	 ['Ꮳ', "tsa.wav", "wav", "Fish04.PNG", "0391GLFishAtsadi080619.mp3", "mp3"],
	 ['Ꮹ', "wa.wav", "wav", "Ramps.PNG", "0391GLRampsWasdi080619.mp3", "mp3"], 
	 ['Ꮿ', "ya.wav", "wav", "Wolf.PNG", "0391GLWolfWahya080619.mp3", "mp3"], 
];

var e_column_data = [
	/* element -> [text, text_audio, text_audio_filetype, image, image_audio, image_audio_filetype] */
	 ['Ꭱ', "e.wav", "wav", "Earth.png", "0392CBEarthElohi080719.mp3", "mp3"],
	 ['Ꭸ', "ge.wav", "wav", "Pie.PNG", "0392CBPieGelisgi080719.mp3", "mp3"],
	 ['Ꭾ', "he.wav", "wav", "Bobcat02.PNG", "0392CBBobcatKvhe080719.mp3", "mp3"],
	 ['Ꮄ', "le.wav", "wav", "Jacket.PNG", "0392CBJacketGasaleni080719.mp3", "mp3"],
	 ['Ꮊ', "me.wav", "wav", "Bat03.PNG", "0392CBBatTsameha080719.mp3", "mp3"],
	 ['Ꮑ', "ne.wav", "wav", "Box.PNG", "0392CBBoxKanesa080719.mp3", "mp3"],
	 ['Ꮗ', "gwe.wav", "wav", "RibbonBow.PNG", "0392CBRibbonAgwehlusdi080719.mp3", "mp3"],
	 ['Ꮞ', "se.wav", "wav", "corn.PNG", "0392CBCornSelu080719.mp3", "mp3"],
	 ['Ꮥ', "de.wav", "wav", "Money02.PNG", "0392CBMoneyAdela080719.mp3", "mp3"],
	 ['Ꮦ', "te.wav", "wav", "Plate.png", "0392CBPlateAtelido080719.mp3", "mp3"],
	 ['Ꮮ', "tle.wav", "wav", "Sitting.PNG", "0392CBSitTsolesdi080719.mp3", "mp3"],
	 ['Ꮴ', "tse.wav", "wav", "Apron.PNG", "0392CBApronAtsesado080719.mp3", "mp3"],
	 ['Ꮺ', "we.wav", "wav", "Cat02.PNG", "0392CBCatWesa080719.mp3", "mp3"],
	 ['Ᏸ', "ye.wav", "wav", "Knife02.PNG", "0392CBKnifeAhyelsdi080719.mp3", "mp3"],
];

var i_column_data = [
	/* element -> [text, text_audio, text_audio_filetype, image, image_audio, image_audio_filetype] */
	 ['Ꭲ', "i.wav", "wav", "Pumpkin03.PNG", "0394JCWPumpkinIya080819.mp3", "mp3"],
	 ['Ꭹ', "gi.wav", "wav", "98_quarter_obverse.png", "0394JCWQuarterGinudi080819.mp3", "mp3"],
	 ['Ꮘ', "gwi.wav", "wav", "Horse02.PNG", "0394JCWHorseSogwili080819.mp3", "mp3"],
	 ['Ꭿ', "hi.wav", "wav", "Moon.PNG", "0394JCWNvdaMoon080819.mp3", "mp3"],
	 ['Ꮅ', "li.wav", "wav", "Ant.PNG", "0394JCWAntDosvdali080819.mp3", "mp3"],
	 ['Ꮨ', "ti.wav", "wav", "Chestnut02.PNG", "0394JCWChestnutTili080819.mp3", "mp3"],
	 ['Ꮵ', "tsi.wav", "wav", "Chicken.PNG", "0394JCWChickenTsitaga080819.mp3", "mp3"],
	 ['Ꮯ', "tli.wav", "wav", "Dog02.PNG", "0394JCWDogGihli080819.mp3", "mp3"], /* gihli but has tli */
	 ['Ꮻ', "wi.wav", "wav", "Meat.PNG", "0394JCWMeatHawiya080819.mp3", "mp3"], 
	 ['Ꮋ', "mi.wav", "wav", "Camel.PNG", "0394JCWCamelKemili080819.mp3", "mp3"],
	 ['Ꮒ', "ni.wav", "wav", "Children.PNG", "0394JCWChildrenDiniyohli080819.mp3", "mp3"],
	 ['Ꮟ', "si.wav", "wav", "Pig02.PNG", "0394JCWPigSikwa080819.mp3", "mp3"],
	 ['Ꮧ', "di.wav", "wav", "Skunk02.PNG", "0394JCWSkunkDili080819.mp3", "mp3"],
	 ['Ᏹ', "yi.wav", "wav", "Rope02.PNG", "0394JCWRopeSdeyida080819.mp3", "mp3"],
];

var local_animals_data = [
	 ["ᏲᎾ", "0397BearYona081419.mp3", "mp3", "yona.png", "0397BearYona081419.mp3", "mp3"],
	 ["ᏩᏯ", "0397WolfWahya081419.mp3", "mp3", "waya.png", "0397WolfWahya081419.mp3", "mp3"],
	 ["ᎤᏤᏥᏍᏗ", "0397PossumUtsedsdi081419.mp3", "mp3", "utsesdi.png", "0397PossumUtsedsdi081419.mp3", "mp3"],
	 ["ᏨᏓᏥ", "0397MountainLionTsvdatsi081419.mp3", "mp3", "tsvdatsi.png", "0397MountainLionTsvdatsi081419.mp3", "mp3"],
	 ["ᏧᎳ", "0397FoxTsuhla081419.mp3", "mp3", "tsuhla.png", "0397FoxTsuhla081419.mp3", "mp3"],
	 ["ᏥᏯ", "0397OtterTsiya081419.mp3", "mp3", "tsiya.png", "0397OtterTsiya081419.mp3", "mp3"],
	 ["ᏥᏍᏚ", "0397RabbitTsisdu081419.mp3", "mp3", "tsisdu.png", "0397RabbitTsisdu081419.mp3", "mp3"],
	 ["ᏥᏍᏕᏥ", "0397MouseTsisdetsi081419.mp3", "mp3", "tsisdetsi.png", "0397MouseTsisdetsi081419.mp3", "mp3"],
	 ["ᏣᎺᎭ", "0397BatTsameha081419.mp3", "mp3", "tsameha.png", "0397BatTsameha081419.mp3", "mp3"],
	 ["ᏔᏁᏆ", "0397MoleTanegwa081419.mp3", "mp3", "tanegwa.png", "0397MoleTanegwa081419.mp3", "mp3"],
	 ["ᏌᎶᎵ", "0397SquirrelSaloli081419.mp3", "mp3", "saloli.png", "0397SquirrelSaloli081419.mp3", "mp3"],
	 ["ᎣᎦᎾ", "0397GroundhogOgana081419.mp3", "mp3", "ogana.png", "0397GroundhogOgana081419.mp3", "mp3"],
	 ["ᎬᎾ", "0397TurkeyKvna081419.mp3", "mp3", "kvna.png", "0397TurkeyKvna081419.mp3", "mp3"],
	 ["ᎬᎵ", "0397RaccoonKvhli081419.mp3", "mp3", "kvhli.png", "0397RaccoonKvhli081419.mp3", "mp3"],
	 ["ᎩᎵ", "0397DogGihli081419.mp3", "mp3", "gihli.png", "0397DogGihli081419.mp3", "mp3"],
	 ["ᏙᏯ", "0397BeaverDoya081419.mp3", "mp3", "doya.png", "0397BeaverDoya081419.mp3", "mp3"],
	 ["ᏕᏫ", "0397FlyingSquirrelDewi081419.mp3", "mp3", "dewa.png", "0397FlyingSquirrelDewi081419.mp3", "mp3"],
	 ["ᏓᎦᏏ", "0397TurtleDagsi081419.mp3", "mp3", "dagsi.png", "0397TurtleDagsi081419.mp3", "mp3"],
	 ["ᎠᏫ", "0397DeerAhwi081419.mp3", "mp3", "ahwi.png", "0397DeerAhwi081419.mp3", "mp3"],
	 ["ᎢᎾᏓ", "0397SnakeInada081419.mp3", "mp3", "utsonati.png", "0397SnakeInada081419.mp3", "mp3"], 
];

/* Copy and paste this example to create your own data object. */
var YOUR_DATA_OBJECT_NAME_HERE_ending_with_data = [
	 ["vocab_text", "text_audio_filename", "text_audio_filetype(wav/mp3)", "image_filename", "image_audio_filename", "image_audio_filetype(wav/mp3)"],
	 ["vocab_text", "text_audio_filename", "text_audio_filetype(wav/mp3)", "image_filename", "image_audio_filename", "image_audio_filetype(wav/mp3)"],
	 ["vocab_text", "text_audio_filename", "text_audio_filetype(wav/mp3)", "image_filename", "image_audio_filename", "image_audio_filetype(wav/mp3)"],
	 ["vocab_text", "text_audio_filename", "text_audio_filetype(wav/mp3)", "image_filename", "image_audio_filename", "image_audio_filetype(wav/mp3)"],
];


/* PASE DATA OBJECTS DIRECTLY ABOVE THIS LINE */

/* Copy this:

	3: { 					// the number here should be one more than the last one. 
		"title": "Vocabulary Title", 			// Title of vocabulary set, shown in dropdown
		"subdirectory": "your_named_folder",	// Name of the folder that the images/audio are under.
		"data": your_named_folder_data, 	// Name of the variable above.
		"huge_font": true, 								// true if syllabary-sized font, false if word-sized font.
	}, 			// make sure there is a comma here

	and paste where it says "PASTE NEW VOCAB SET DIRECTLY ABOVE THIS LINE!! "
*/
var vocabulary_sets_in_dropdown_data = {
		0 : {
		"title": "ᎢᎾᎨ ᎠᏁᎯ", 
		"subdirectory": "local_animals",
		"data": local_animals_data,
		"huge_font": false, /* huge_font should be true for single-character text */
		"audio_data": USE_TEXT_AUDIO, // or USE_IMAGE_AUDIO, for which audio files to play in the game
		"has_pictures": true,
	},
	1 : {
			"title": "Ꭰ ᏚᎾᏓᏓᏍᎬ",
			"subdirectory": "a_column",
			"data": a_column_data,
			"huge_font": true, /* huge_font should be true for single-character text */
			"audio_data": USE_TEXT_AUDIO, // or USE_IMAGE_AUDIO, for which audio files to play in the game
			"has_pictures": false,
	},
	2 : {
		"title": "Ꭱ ᏚᎾᏓᏓᏍᎬ",
		"subdirectory": "e_column",
		"data": e_column_data,
		"huge_font": true,
		"audio_data": USE_TEXT_AUDIO, // or USE_IMAGE_AUDIO, for which audio files to play in the game
		"has_pictures": false,
	},
	3 : {
		"title": "Ꭲ ᏚᎾᏓᏓᏍᎬ",
		"subdirectory": "i_column",
		"data": i_column_data,
		"huge_font": true,
		"audio_data": USE_TEXT_AUDIO, // or USE_IMAGE_AUDIO, for which audio files to play in the game
		"has_pictures": false,
	},
	/* ->->-> PASTE NEW VOCAB SET DIRECTLY ABOVE THIS LINE!! <-<-<-<-<-<-<-<-<-<- */
};

// ---- Helper functions for accessing data ---- // 
	/* element -> [text, text_audio, text_audio_filetype, image, image_audio, image_audio_filetype] */

function getText_DataIndex() {
	return 0;
}

function getTextAudio_DataIndex() {
	return 1;
}

function getTextAudioFileType_DataIndex() {
	return 2;
}

function getImageFile_DataIndex() {
	return 3;
}

// Returns index for image audio in data array
function getImageAudio_DataIndex() {
	return 4; 
}

// Returns index for image audio in data array
function getImageAudioFileType_DataIndex() {
	return 5; 
}