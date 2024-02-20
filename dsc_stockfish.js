console.log("dsc_stockfish.js LOADED");

//varibles//
//let stockfish;
let stockfishOnline = true;
let stockfishGameId;
let stockfishColor = "w";
let stockfishTime = "20";
let stockfishStrenght = 1200;
let lastResult;


if (!stockfishOnline) {
  document.getElementById('stockfishIcon').style.color = "red";
}

//functions//
//set Stockfish params
function setStockfish(buttonId) {
  //console.log(buttonId);

  let value = buttonId.split("-")[2];

  if (buttonId.includes("color")) {
    document.getElementById("stockfish-color-w").style.background = "none";
    document.getElementById("stockfish-color-b").style.background = "none";

    stockfishColor = value;
  }

  if (buttonId.includes("time")) {
    document.getElementById("stockfish-time-5").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("stockfish-time-10").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("stockfish-time-20").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("stockfish-time-90").style.background = "hsl( 197, 50%, 13% )";

    stockfishTime = value;
  }

  if (buttonId.includes("level")) {
    stockfishStrenght = document.getElementById(buttonId).value;

    if (stockfishStrenght < 0) {
      stockfishStrenght = 0;
    } else if (stockfishStrenght > 3000) {
      stockfishStrenght = 3000;
    }

    document.getElementById(buttonId).value = stockfishStrenght;


    /*
      if(gameinfo.wit.includes("Stockfish")){
        document.getElementById('whiteName').innerHTML = `Stockfish
        <input type="number" id="stockfish-level-2" class="stockfishELO" min="0" max="3000" value="${stockfishStrenght}" onchange="setStockfish(this.id)">`;
        }else{
          document.getElementById('blackName').innerHTML = `Stockfish
          <input type="number" id="stockfish-level-2" class="stockfishELO" min="0" max="3000" value="${stockfishStrenght}" onchange="setStockfish(this.id)">`;        
        }
*/

  }

  if (!buttonId.includes("level")) {
    document.getElementById(buttonId).style.background = "rgb(60, 144, 177)";
  }
}

//make a new game en put the info in the Queu
async function startNewStockfishGame() {
  let queueRef = database.ref('dscChess/play/queue');

  let newGame = {
    gameId: stockfishGameId,
    mode: "Stockfish",
    moves: null,
    tournatementId: player.tournament_Id,
    stockfishElo: stockfishStrenght
  };


  stockfishPlayerRef = database.ref(`dscChess/play/games/${player.tournament_Id}/players/Stockfish`);
  let stockfishPlayerInfo = {
    tournament_Id: player.tournament_Id,
    game_Id: "",
    name: "Stockfish",
    elo: stockfishStrenght,
    piece: "",
    score: 0,
    scoreWP: 0,
    WP: 0,
    WPcut1: 0,
    SB: 0,
    PS: 0,
    colorCode: 0,
    colorString: "",
    hasBye: false,
    status: "aanwezig",
    avatar: Math.floor(Math.random() * avatars.length)
  };

  let stockfishPlayerRefSnapshot = await stockfishPlayerRef.once('value');
  let stockfishPlayerRefInfo = stockfishPlayerRefSnapshot.val();
  if (stockfishPlayerRefInfo) {
    let keys = Object.keys(stockfishPlayerRefInfo);
    for (let key of keys) {
      stockfishPlayerInfo[key] = stockfishPlayerRefInfo[key];
    }
  }

  if (stockfishColor === "w") {
    newGame.wit = player.name
    newGame.zwart = stockfishPlayerInfo.name;
    stockfishPlayerInfo.piece = "b";
  } else {
    newGame.zwart = player.name
    newGame.wit = stockfishPlayerInfo.name;
    stockfishPlayerInfo.piece = "w";
  }

  stockfishPlayerRef.set(stockfishPlayerInfo);

  newGame.startTime = stockfishTime * 60;
  newGame.witTime = stockfishTime * 60;
  newGame.zwartTime = stockfishTime * 60;

  queueRef.push(newGame);
}

//starts Stockfish playing the end of the game  
function startStockfishPlayMode() {
  document.getElementById("stockfishPlayMode").style.display = "block";

  let path = `dscChess/play/games/${player.tournament_Id}/games/${player.game_Id}/stockfishMove${player.name}`;
  stockfishMoveRef = database.ref(path);
  let queueRef = database.ref('dscChess/play/queue');

  gameinfo.movePath = path;
  gameinfo.lastFen = games[activeGame].game.fen();

  if (!gameinfo.stockfishId) {
    gameinfo.stockfishId = Date.now();
  }

  lastResult = gameinfo.result;
  delete gameinfo.result;

  stockfishMoveRef.on('value', (snapshot) => {
    let move = doSet(snapshot.val(), false, true);

    if (move === null) {
      return 'snapback';
    }

    if (!games[activeGame].game.game_over()) {
      gameinfo.lastFen = games[activeGame].game.fen();
      queueRef.push(gameinfo);
    } else {
      gameinfo.result = result;
    }
  }, errData);

  queueRef.push(gameinfo);
}


//stops Stockfish of playing the game and restores the result of the game 
function stopStockfishPlayMode() {
  document.getElementById("stockfishPlayMode").style.display = "none";
  stockfishMoveRef = stopFirebaseRef(stockfishMoveRef);
  gameinfo.result = lastResult;
}