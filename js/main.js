'use strict'

const WALL      = 'WALL';
const STORAGE   = 'STORAGE';
const GAMER     = 'GAMER';
const BOX       = 'BOX';
const FLOOR     = 'FLOOR';

const CLOCK     = 'clock'; 
const MAGNET    = 'magnet';
const GOLD      = 'gold';

var BONUSES = [
    {name: CLOCK,     image: '<img src="img/clock.jpg">'},
    {name: MAGNET,    image: '<img src="img/magnet.jpg">'},
    {name: GOLD,      image: '<img src="img/gold.jpg">'},
]

// == Key Codes ==
const LEFT  = 37;
const UP    = 38;
const RIGHT = 39;
const DOWN  = 40;

var gState = {
    userSteps:  0,
	clockBonus: 0, 
	gluedSec:   0,
    holdMagnet: false,
}

var gGamerPos;
var gBoard = [];
var gStorageLocations = [];
var gRandomNumbers = [];
var gLevel = { SIZE: 7, BOXES: 4 };

function initGame() {
    console.log('initGame');
    initgRandomNumbers(gRandomNumbers);
    gBoard = buildBoard();
    placeBonuses();
    renderBoard( gBoard, '.gameBoard');
}

function initgRandomNumbers(randomNumbers){
    var actualSize = gLevel.SIZE - 2;
    for (var i = 0; i < actualSize*actualSize; i++) {
        randomNumbers[i] = i;      
    }
}

function buildBoard() {
    // build the floor
    var board = [];
    for (var i = 0; i < gLevel.SIZE + 2; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE + 2; j++) {
            board[i][j] = {type: FLOOR, gameElement: null};
        }
    }

    // build the walls
    for (i = 0; i < gLevel.SIZE + 2; i++) {
        for (j = 0; j < gLevel.SIZE + 2; j++) {
			var cell = {type: WALL, gameElement: null};
			// if at edge?
			if (i === 0 || i === gLevel.SIZE + 1 || j === 0 || j === gLevel.SIZE + 1) {
				board[i][j]= {type: WALL, gameElement: null};
			}
		}
    }

    // put the storage locations randomly on the board
    for (var i = 0; i < gLevel.BOXES; i++) {
        coord = getUniqueRandom(true);
        gStorageLocations[i] = coord;         
        board[coord.i][coord.j] = {type: STORAGE, gameElement: null};
    }
//    console.log('locations',gLocations);
    
    // put the boxes randomly on the board
    for (var i = 0; i < gLevel.BOXES; i++) {
        var coord = getUniqueRandom(true);
        board[coord.i][coord.j] = {type: FLOOR, gameElement: BOX};
    }

    // put the player
    coord = getUniqueRandom(true);
    board[coord.i][coord.j] = {type: FLOOR, gameElement: GAMER};
    gGamerPos = coord;

    return board;
}

// setTimeout()
function placeBonuses(){
	setInterval(function() {
		var bonusLoc =  getUniqueRandom(false);
        var bonus = getRandomBonus();
		gBoard[bonusLoc.i][bonusLoc.j].gameElement = bonus.name;
        var selector = getSelector(bonusLoc);
		var elTd = document.querySelector(selector);
		elTd.innerHTML = bonus.image;

		setTimeout(function(){
			gBoard[bonusLoc.i][bonusLoc.j].gameElement = null;
			elTd.innerHTML='';
		}, 3500);

	}, 7000);
}

function getRandomBonus(){
    var idx = getRandomInt(0,BONUSES.length-1);
    return BONUSES[idx];
}

function getUniqueRandom(isUnique) {
    var idx = getRandomInt( 0, gRandomNumbers.length-1 );
    var num = gRandomNumbers[idx];
    if (isUnique)   gRandomNumbers.splice(idx,1);
    if (gRandomNumbers === [])  return null;

    var res = {i:0,j:0};
    var actualSize = gLevel.SIZE - 2 ;
    
    res.i = 1 + Math.floor(num / actualSize);
    res.j = 1 + num % actualSize;
 
    return res;
}

function renderBoard(board, elSelector) {
    var strHTML = '';

    board.forEach(function(cells, i){
        strHTML += '<tr>\n';
        cells.forEach(function(cell, j){
          
            var cellId = 'cell-' + i + '-' +j;
			var cellClass = 'floor';
			switch (cell.type) {
				case WALL: 
					cellClass = "wall";
					break;
				case STORAGE: 
					cellClass = "storage";
					break;
				default:
					break;
			}
			// Build a <TD>:
			strHTML +=  '<td id="' + cellId + '" class="' + cellClass + 
                        '"  onclick="cellClicked('+i+','+j+')" >';
			if (cell.gameElement === GAMER) {
				strHTML += "<img src='img/gamer.png'>";
			} 
			else if (cell.gameElement === BOX) {
					strHTML += "<img src='img/box.jpg'>";
			}
			
			strHTML += "</td>";            
        });
        strHTML += '</tr>\n';
    });
    // console.log(strHtml);
    
    var elMat = document.querySelector(elSelector);
    elMat.innerHTML = strHTML;

    updateUserSteps(gState.userSteps);

}    

function getSelector(coord) {
    return '#cell-'+coord.i + '-' + coord.j
}

// left mouse key click or called from keyClicked.
// i,j : coordinates of user request.
function cellClicked(i, j){

    // calculate differences from the player position.
	var iDiff = i - gGamerPos.i;
	var jDiff = j - gGamerPos.j;
	var iAbsDiff = Math.abs(iDiff);
	var jAbsDiff = Math.abs(jDiff);

	// If the clicked Cell is not allowed,return!
//	!((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) -->
//	(!(iAbsDiff === 1 && jAbsDiff === 0) && !(jAbsDiff === 1 && iAbsDiff === 0)) -->
//	((iAbsDiff !== 1 || jAbsDiff !== 0) && (jAbsDiff !== 1 || iAbsDiff !== 0))

	if ((iAbsDiff !== 1 || jAbsDiff !== 0) &&
        (jAbsDiff !== 1 || iAbsDiff !== 0))        return;

    var targetCell = gBoard[i][j];
    // if we are going into a wall, return;    
    if (targetCell.type === WALL)  return;

    var canMove = true;
	// is there a box ahead?		
    if (targetCell.gameElement === BOX) {

        var cell = gBoard[i+iDiff][j+jDiff];
        // In the next pos, if there is no WALL, and also no game element
        if (cell.type != WALL && cell.gameElement == null) {
            // MOVE THE BOX
            targetCell.gameElement = null;
            cell.gameElement = BOX;

        } else {
            // Cant move - there is a WALL/GAME-ELEMENT behind BOX!
            console.log("SOMETHING Behind BOX");
            canMove = false;
        }
    }

    if (canMove) {
        switch (targetCell.gameElement ){
            case CLOCK:  
                console.log('clock!');
                gState.clockBonus = 5;
                break;
            case MAGNET:  
                console.log('Magent!');
                gState.holdMagnet = true;
                break; 
            case GOLD:  
                console.log('gold!');
                gState.userScore +=100;
                break;
            default:
        }
        // if (gBoard[i][j].gameElement === CLOCK) {
        //     console.log('CLOCK!');
        //     gState.clockBonus = 5;
        // }

        // move the gamer.
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

        // TODO: update the DOM
        if (gState.clockBonus === 0) {
            // Update steps count
            // var spnStepsCount = document.getElementById('spnStepsCount');
            // spnStepsCount.innerHTML++;
            gState.userSteps++;
        } else {
            gState.clockBonus--;
        }

        // TODO: try improve printing the entire board
 //       gState.userSteps++;
        renderBoard( gBoard, '.gameBoard');
        checkGameOver(gStorageLocations); 
    } 
}


function keyClicked(event) {
	//console.log(event.keyCode, event.keyIdentifier	 );
	var i = gGamerPos.i;
	var j = gGamerPos.j;	 
	
	switch (event.keyCode) {
	case 37:
		cellClicked(i, j-1);
		break;
	case 39:
		cellClicked(i, j+1);
		break;
	case 38:
		cellClicked(i-1, j);
		break;
	case 40:
		cellClicked(i+1, j);
		break;
	}
}

function checkGameOver(gStorageLocations) {
    var cell = 0;
    var boxCount = 0;
    gStorageLocations.forEach(function(loc) {    
        cell = gBoard[loc.i][loc.j];
        if ((cell.type === STORAGE)&&(cell.gameElement===BOX))
            boxCount++;
    });
//    console.log('boxCount ',boxCount);
    updateBoxesCount(boxCount);
    if (boxCount === gLevel.BOXES){
        // This is a Victory!
        document.querySelector('.userMsg').innerText =
                'GREAT!! mission completed !';
    }
}

function updateUserSteps(userSteps) {
    var elStepsCount = document.querySelector('#spanStepsCount');
    elStepsCount.innerText = userSteps;
}

function updateBoxesCount(boxesCount) {
    var elBoxCount = document.querySelector('#spanBoxsCount');
    elBoxCount.innerText = boxesCount;
}


