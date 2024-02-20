console.log("puzzles.js LOADED");

//functions//
let requestRef = database.ref(`dscChess/play/request/${player.name}`);
requestRef.on("child_added", function (snapshot) {
  if (snapshot.key === "puzzle") {
    recievePuzzle(snapshot.val());
    requestRef.set(null);
  }
});

//
// Request a puzzle based on the given ELO,
// if no ELO is given a rondom puzzle is returned by the server.
//
function requestPuzzle(ELO = null) {
  let request = {};
  request.player = player.name;
  request.ELO = ELO;
  request.id = null;
  request.total = 1;
  request.themes = null;

  requestRef.set(request);
}

//
// Recieve the requested puzzle.
//
let puzzleGame;
function recievePuzzle(puzzle) {
  console.log(puzzle);
  player.tournament_Id = `puzzles-${player.name}`;
  player.game_Id = puzzle.puzzleId;
  let ref = `dscChess/play/games/${player.tournament_Id}/games/${player.game_Id}`;
  activeGame = ref;

  games[ref] = new chessGame();
  games[ref].game.load(puzzle.fen);
  board.position(puzzle.fen);
  player.piece = games[ref].game.turn();
  if (player.piece === "b") {
    document.getElementById("rotateIcon").click();
  }

  startGameRef();

  //change mode PUZZLEMODE??
  // in puzzle mode mag je altijd een set doen
}
