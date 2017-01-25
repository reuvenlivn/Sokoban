'use strict'

var WALL_SYMBOL     = '&#9619';
var LOCATION_SYMBOL = '&#9711;';
var PLAYER_SYMBOL   = '&#127773';
var BOX_SYMBOL      = '&#8864;';
var FLOOR_SYMBOL    = '&#9617;';
//  var FLOOR_SYMBOL    = ' ';

var gGamerPos;
var gBoard = [];
var gLocations = [];
var gRandomNumbers = [];
var gUserSteps = 0;
var gLevel = { SIZE: 8, BOXES: 4 };

function initGame() {
    console.log('initGame');

    initgRandomNumbers(gRandomNumbers);
    gBoard = buildBoard();
    renderBoard( gBoard, '.gameBoard');

}

function initgRandomNumbers(randomNumbers){
    var actualSize = gLevel.SIZE -2;
    for (var i = 0; i < actualSize*actualSize; i++) {
        randomNumbers[i] = i;      
    }
}

function buildBoard() {
    // add location to move the boxes.
    // add BOXES

    // build the floor
    var board = [];
    for (var i = 0; i < gLevel.SIZE + 2; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE + 2; j++) {
            board[i][j] = FLOOR_SYMBOL;
        }
    }
    // build the outer walls. left and right sides.
    for (i = 0; i < gLevel.SIZE + 2; i++) {
        board[i][0] = WALL_SYMBOL;
        board[i][gLevel.SIZE + 1] = WALL_SYMBOL;
    }
    // build the outer walls. up and down sides.
    for (j = 0; j < gLevel.SIZE + 2; j++) {
        board[0][j] = WALL_SYMBOL;
        board[gLevel.SIZE + 1][j] = WALL_SYMBOL;
    }

    // put the locations randomly on the board
    for (var i = 0; i < gLevel.BOXES; i++) {
        coord = getUniqueRandom();
        gLocations[i] = coord;         
        board[coord.i][coord.j] = LOCATION_SYMBOL;
    }
//    console.log('locations',gLocations);
    
    // put the boxes randomly on the board
    for (var i = 0; i < gLevel.BOXES; i++) {
        var coord = getUniqueRandom();
        board[coord.i][coord.j] = BOX_SYMBOL;
    }

    // put the player
    coord = getUniqueRandom();
    board[coord.i][coord.j] = PLAYER_SYMBOL;
    gGamerPos = coord;

    return board;
}

function getUniqueRandom() {
    var idx = getRandomInt( 0, gRandomNumbers.length-1 );
    var num = gRandomNumbers[idx];
    gRandomNumbers.splice(idx,1);
    if (gRandomNumbers === [])  return null;

    var res = {i:0,j:0};
    var actualSize = gLevel.SIZE - 2 ;
    
    res.i = 2 + Math.floor(num / actualSize);
    res.j = 2 + num % actualSize;
 
    return res;
}

function renderBoard(board, elSelector) {
    var strHtml = '';

    var boxCount = restoreLocations(gLocations);
    updateBoxesCount(boxCount) ;
    checkGameOver(boxCount); 

    board.forEach(function(cells, i){
        strHtml += '<tr>\n';

        cells.forEach(function(cell, j){
            // var classNames = 'tdcell ';
            
            var tdId = 'cell-' + i + '-' +j;
            // strHtml +=  ' <td id="'+ tdId + '" class="' + classNames + '">' + 
            strHtml +=  ' <td id="'+ tdId + '">' + cell + '</td>\n';
        });
        strHtml += '</tr>\n';
    });
    // console.log(strHtml);
    
    var elMat = document.querySelector(elSelector);
    elMat.innerHTML = strHtml;

    markLocations(gLocations);

    updateUserSteps(gUserSteps);

}    


function restoreLocations(locations){
    var value = 0;
    var boxCount = 0;
    locations.forEach(function(loc) {    
        value = gBoard[loc.i][loc.j];
        if (value === FLOOR_SYMBOL){
            gBoard[loc.i][loc.j] = LOCATION_SYMBOL;
        }else if (value === BOX_SYMBOL){
            boxCount++;
        }
    });
//    console.log('boxCount ',boxCount);
   
    return boxCount;
}

function markLocations(coords) {
    coords.forEach(function(coord){
        var selector = getSelector(coord);
        // console.log('selector',selector);    
        var elCell = document.querySelector(selector);
        elCell.classList.add('location');
    });
}

function getSelector(coord) {
    return '#cell-'+coord.i + '-' + coord.j
}

function leftArrowClicked() {
//    console.log('leftArrowClicked');

    // out of the board?
    if (gGamerPos.j-1 < 0)     return;
    // near a wall?
    if ( gBoard[gGamerPos.i][gGamerPos.j-1] === WALL_SYMBOL )   return;
    // no box in this direction
    if ( gBoard[gGamerPos.i][gGamerPos.j-1] !== BOX_SYMBOL){
        // move !!
        gBoard[gGamerPos.i][gGamerPos.j-1] = PLAYER_SYMBOL;
        gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
        gGamerPos.j--;
        gUserSteps++;
    } 
    // there is a box in this direction. 
    else {
        // can we move with the box?
        if (gGamerPos.j-2 < 0)    return;
        // the box is near a wall?
        if ( gBoard[gGamerPos.i][gGamerPos.j-2] === WALL_SYMBOL )   return;
        // the box is near enother box?
        if ( gBoard[gGamerPos.i][gGamerPos.j-2] !== BOX_SYMBOL){
            // move
            gBoard[gGamerPos.i][gGamerPos.j-2] = BOX_SYMBOL;
            gBoard[gGamerPos.i][gGamerPos.j-1] = PLAYER_SYMBOL;
            gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
            gGamerPos.j--;
            gUserSteps++;
        }
    }
    renderBoard(gBoard, '.gameBoard');
}

function upArrowClicked() {
    //  console.log('upArrowClicked');
    if (gGamerPos.i-1 < 0)     return;
    // near a wall?
    if ( gBoard[gGamerPos.i-1][gGamerPos.j] === WALL_SYMBOL )   return;
    // no box in this direction
    if ( gBoard[gGamerPos.i-1][gGamerPos.j] !== BOX_SYMBOL){
        // move !!
        gBoard[gGamerPos.i-1][gGamerPos.j] = PLAYER_SYMBOL;
        gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
        gGamerPos.i--;
        gUserSteps++;
    } 
    // there is a box in this direction. 
    else {
        // can we move with the box?
        if (gGamerPos.i+2 < 0)    return;
        // the box is near a wall?
        if ( gBoard[gGamerPos.i-2][gGamerPos.j] === WALL_SYMBOL )   return;
        // the box is near enother box?
        if ( gBoard[gGamerPos.i-2][gGamerPos.j] !== BOX_SYMBOL){
            // move
            gBoard[gGamerPos.i-2][gGamerPos.j] = BOX_SYMBOL;
            gBoard[gGamerPos.i-1][gGamerPos.j] = PLAYER_SYMBOL;
            gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
            gGamerPos.i--;
            gUserSteps++;
        }
    }
    renderBoard(gBoard, '.gameBoard');     
}

function rightArrowClicked() {
    // console.log('rightArrowClicked');
    // out of the board?
    if (gGamerPos.j+1 >= gBoard[0].length)     return;
    // near a wall?
    if ( gBoard[gGamerPos.i][gGamerPos.j+1] === WALL_SYMBOL )   return;
    // no box in this direction
    if ( gBoard[gGamerPos.i][gGamerPos.j+1] !== BOX_SYMBOL){
        // move !!
        gBoard[gGamerPos.i][gGamerPos.j+1] = PLAYER_SYMBOL;
        gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
        gGamerPos.j++;
        gUserSteps++;
    } 
    // there is a box in this direction. 
    else {
        // can we move with the box?
        if (gGamerPos.j+2 >= gBoard[0].length)    return;
        // the box is near a wall?
        if ( gBoard[gGamerPos.i][gGamerPos.j+2] === WALL_SYMBOL )   return;
        // the box is near enother box?
        if ( gBoard[gGamerPos.i][gGamerPos.j+2] !== BOX_SYMBOL){
            // move
            gBoard[gGamerPos.i][gGamerPos.j+2] = BOX_SYMBOL;
            gBoard[gGamerPos.i][gGamerPos.j+1] = PLAYER_SYMBOL;
            gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
            gGamerPos.j++;
            gUserSteps++;
        }
    }
    renderBoard(gBoard, '.gameBoard');   
}

function downArrowClicked() {
    // console.log('downArrowClicked');
    // out of the board?
    if (gGamerPos.i+1 >= gBoard.length)     return;
    // near a wall?
    if ( gBoard[gGamerPos.i+1][gGamerPos.j] === WALL_SYMBOL )   return;
    // no box in this direction
    if ( gBoard[gGamerPos.i+1][gGamerPos.j] !== BOX_SYMBOL){
        // move !!
        gBoard[gGamerPos.i+1][gGamerPos.j] = PLAYER_SYMBOL;
        gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
        gGamerPos.i++;
        gUserSteps++;
        
    } 
    // there is a box in this direction. 
    else {
        // can we move with the box?
        if (gGamerPos.i+2 >= gBoard.length)    return;
        // the box is near a wall?
        if ( gBoard[gGamerPos.i+2][gGamerPos.j] === WALL_SYMBOL )   return;
        // the box is near enother box?
        if ( gBoard[gGamerPos.i+2][gGamerPos.j] !== BOX_SYMBOL){
            // move
            gBoard[gGamerPos.i+2][gGamerPos.j] = BOX_SYMBOL;
            gBoard[gGamerPos.i+1][gGamerPos.j] = PLAYER_SYMBOL;
            gBoard[gGamerPos.i][gGamerPos.j] = FLOOR_SYMBOL;
            gUserSteps++;
            gGamerPos.i++;
        }
    }
    renderBoard(gBoard, '.gameBoard'); 
}

// left mouse key click
function cellClicked(i, j){
 
}

function checkGameOver(boxCount) {
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
