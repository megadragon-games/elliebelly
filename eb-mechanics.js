// Constants
var ELENA_LOWER_LIMIT = 160;

// Resource Inventory
var pounds = ELENA_LOWER_LIMIT;
var gainRate = 0;
var charrs = 0,
	cows = 0,
	adders = 0,
	barrels = 0,
	expndrs = 0,
	planars = 0;

var upgradeTypes = ["charr","cow","adder","barrel","expndr","planar"];

// Upgrade Costs
var defaultScale = 1.1;
var charrBase = 15,
	//charrScale = 1.1,
	charrIncome = 0.2;
var cowBase = 100,
	cowIncome = 1;
var adderBase = 400,
	adderIncome = 5;
var barrelBase = 1200,
	barrelIncome = 24.8;
var expndrBase = 1800,
	expndrIncome = 32;
var planarBase = 3000,
	planarIncome = 60;

// Utility Variables
var upgradeCost = 0;
var tickerNumber = 0;
var tickerAge = 0;
var tickerExpires = 0;

var speechAge = 0;
var speechExpires = 0;

// Text Strings
var charrMouseover = "These eager charrs will wait on Elena hand and foot, even when they can't reach either.";
var cowMouseover = "Milk does a belly good, and a personal creamery of cows keeps the milk flowing."
var adderMouseover = "A little nip from a puff adder will give Elena a dose of fattening venom, puffing her up and adding pounds.";
var barrelMouseover = "This thirty-one-gallon cola barrel will magically fill itself back up when emptied.";
var expndrMouseover = "This high-tech device expands Elena's gut by expanding her constituent molecules.";
var planarMouseover = "This powerful spell from the Morphonomicon pulls fat directly from the astral planes.";

var elenaFeed = ["Urp!","Mmph!"];
var elenaBuy = ["My belly\'s shrinking! What are you doing?",
	"My weight isn\'t currency! Stop that!"];

// HELPER FUNCTIONS
// UPDATE modifies a given element's HTML. Due to the frequency of innerHTML changes, this function
// was written to shorten the initial function call.
function update(id,value){
	document.getElementById(id).innerHTML = value;
}

// RANDOM RANGE returns a random integer between the given minimum and maximum values.
function randomRange(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// PICK FROM ARRAY will randomly return one value from the given array.
function pickFromArray(array){
	var watchword = Math.floor(Math.random() * array.length);
	return array[watchword];
}

// GAME LOGIC
// GAIN modifies the pounds variable by a given amount.
function gain(amount){
	pounds = pounds + amount;
	update("weightDisplay", format(Math.floor(pounds)) + " lb");
	updateButtons();
}

// GROW BUTTON handles the logic behind clicking the grow button.
function growButton(){
	gain(1);
	if(Math.random() > 0.5){
		talk(0);
	}
}

// CALCULATE COST calculates the cost of a given upgrade. All upgrades rise in
// resource price exponentially, using the following formula: base times scale to the inventory-th
// power. Base is the base cost of an item; scale is the numeric value describing how quickly a
// cost should rise, and inventory is the number of items currently owned by the player.
function calculateCost(base,scale,inventory){
	return Math.floor(base * Math.pow(scale, inventory));
}

// BUY purchases an upgrade.
function buy(item){
	// Only do anything here if the passed string explicitly matches an element in the upgrades array.
	if(upgradeTypes.indexOf(item) > -1){
			// This line uses the fact that all upgrade variable names follow the same structure.
			// This way, instead of adding redundant cases, we use one multi-purpose abstract case.
			upgradeCost = calculateCost(window[item + "Base"],defaultScale,window[item + "s"]);
			//upgradeCost = calculateCost(charrBase,charrScale,charrs);

			// The player can only purchase an upgrade if Elena has enough weight, AND if
			// the purchase will not place Elena below her starting weight.
			if(pounds >= upgradeCost && (pounds - upgradeCost) >= ELENA_LOWER_LIMIT){
				// The player can never buy more than one upgrade per click
				window[item + "s"]++;

				// The gain function is made to handle negative values as well as positive, and
				// automatically updates the weightDisplay span, so the other two function calls
				// are not necessary
				gain(-(upgradeCost));
				//pounds = pounds - upgradeCost;
				//update("weightDisplay",format(pounds));

				// Add the upgrade's income value to the player's total income
				gainRate = gainRate + window[item + "Income"];

				// Finally, we update the inventory number and display it to the player. Since the
				// inventory has changed, we re-calculate the cost of this upgrade
				update(item + "Display",format(window[item + "s"]));
				upgradeCost = calculateCost(window[item + "Base"],defaultScale,window[item + "s"]);

				// Additionally, there is a chance that buying an upgrade will prompt a special
				// reaction ticker message from Elena
				if(Math.random() > 0.5){
					talk(1);
				}
			}
			// This update is performed outside of the loop as it does not necessarily depend upon
			// a change in inventory value
			update(item + "Cost",format(upgradeCost));
		}
}

// TALK randomly picks from a list of Elena's reactions and updates her speech
// bubble element. It accepts an integer argument as a flag describing which
// group of reaction texts should be used.
function talk(flag){
	var speechText = "";

	if(document.getElementById("elenaSpeechBubble").innerHTML == ""){
		switch(flag){
			case 0: // grow button clicked
				update("elenaSpeechBubble", pickFromArray(elenaFeed));
				break;
			case 1: // upgrade purchased
				update("elenaSpeechBubble", pickFromArray(elenaBuy));
				break;
			default: // assume grow button clicked
				update("elenaSpeechBubble", pickFromArray(elenaFeed));
				break;
		}

		// Reset the speech bubble age. All speech messages last five seconds.
		speechAge = 0;
		speechExpires = 5;
	}
}

// HEADLINE randomly picks from a list of headlines and updates the ticker.
function headline(){
	var tickerText = "";
	var possibilities = [];

	if(tickerNumber % 2 == 0){
		possibilities.push(pickFromArray(["Burp I","Burp II"]));
	}
	else{
		possibilities.push(pickFromArray(["Belch I","Belch II"]));
	}

	// Reset the ticker message's age, increment the ticker number, and pick a string from the array
	// of possibilities to use for the next message.
	tickerAge = 0;
	tickerNumber++;
	tickerText = pickFromArray(possibilities);

	// Randomly pick a duration for the next ticker message. All messages will last between ten and
	// twenty seconds.
	tickerExpires = randomRange(10,20);
	update("headlineArea",tickerText);
}

// UPDATE BUTTONS
function updateButtons(){
	for(x = 0; x < upgradeTypes.length; x++){
		var item = upgradeTypes[x];
		var upgradeCost = calculateCost(window[item + "Base"],defaultScale,window[item + "s"]);
		if(pounds >= upgradeCost && (pounds - upgradeCost) >= ELENA_LOWER_LIMIT)
			$("#" + item + "Buy").removeClass("disabled");
		else
			$("#" + item + "Buy").addClass("disabled");
	}
}

// The GAME LOOP fires once every second, performing and resolving repeating actions.
function gameLoop(){
	gain(gainRate);

	if(document.getElementById("elenaSpeechBubble").innerHTML != ""){
		speechAge++;
		if(speechAge >= speechExpires)
			update("elenaSpeechBubble","");
	}

	tickerAge++;
	if(tickerAge >= tickerExpires)
		headline();
}

// The BATCH SPELL runs upon page load, filling in variable blanks and setting up loops.
function batchSpell(){
	gain(0);
	for(var i in upgradeTypes){
		name = upgradeTypes[i];
		update(name + "Display",format(window[name + "s"]));
		update(name + "Cost",
			format(calculateCost(window[name + "Base"],defaultScale,window[name + "s"])));
	}
}

function format(number){
	// Appending an empty string is faster than the toString() function. If the number has a
	// decimal, it will split at the period, creating two halves. (numberParts[0] is the
	// characteristic, numberParts[1] is the mantissa)
	number += "";
	numberParts = number.split(".");

	// The first half, in numberParts[0], is compared against a regular expression. It looks for
	// any point in the string that has a multiple of three digits in a row after it, and makes
	// sure that that point only has a multiple of three digits. The replacement expression places
	// that particular point with the given replacement token, such as a comma or space.
	// This method was adapted from an answer at http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
	numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	// Finally, the two halves of the string are joined together and returned.
	return numberParts.join(".");
}

// SAVE saves the game to HTML5 local storage.
function save(){
	var saveFile = {
		pounds: pounds,
		gainRate: gainRate,
		charrs: charrs,
		cows: cows,
		adders:	adders,
		barrels: barrels,
		expndrs: expndrs,
		planars: planars
	};
	localStorage.setItem("saveFile",JSON.stringify(saveFile));
}

// LOAD loads a previous save file from HTML5 local storage.
function load(){
	var source = JSON.parse(localStorage.getItem("saveFile"));
	if (typeof source.pounds !== "undefined") pounds = source.pounds;
	if (typeof source.gainRate !== "undefined") gainRate = source.gainRate;
	if (typeof source.charrs !== "undefined") charrs = source.charrs;
	if (typeof source.cows !== "undefined") cows = source.cows;
	if (typeof source.adders !== "undefined") adders = source.adders;
	if (typeof source.barrels !== "undefined") barrels = source.barrels;
	if (typeof source.planars !== "undefined") planars = source.planars;
	batchSpell();
}

// Game loop runs every second (1000 milliseconds)
window.setInterval(gameLoop,1000);

// Initialize tooltips
$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip();
});
