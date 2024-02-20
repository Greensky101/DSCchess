console.log("chessVariants.js LOADED");
//varibles//
const gameModes = {
  normal: {
    pièceTouchée: false,
    legal: true,
    in_stalemate: true,
    insufficient_material: true,
    in_threefold_repetition: true,
    victorySound: false
  },
  Stockfish: {
    pièceTouchée: true,
    legal: true,
    in_stalemate: true,
    insufficient_material: true,
    in_threefold_repetition: true,
    victorySound: false
  },
  koth: {
    pièceTouchée: false,
    legal: true,
    in_stalemate: true,
    insufficient_material: false,
    in_threefold_repetition: true,
    victorySound: true
  },
  rk: {
    pièceTouchée: false,
    legal: true,
    in_stalemate: true,
    insufficient_material: false,
    in_threefold_repetition: true,
    victorySound: true
  },
  atoom: {
    pièceTouchée: false,
    legal: true,
    in_stalemate: true,
    insufficient_material: true,
    in_threefold_repetition: true,
    victorySound: false
  },
  ct: {
    pièceTouchée: false,
    legal: true,
    in_stalemate: true,
    insufficient_material: true,
    in_threefold_repetition: true,
    victorySound: false
  },
  gChange: {
    pièceTouchée: false,
    legal: true,
    in_stalemate: true,
    insufficient_material: true,
    in_threefold_repetition: true,
    victorySound: false
  },
  fog: {
    pièceTouchée: false,
    legal: false,
    in_stalemate: true,
    insufficient_material: true,
    in_threefold_repetition: true,
    victorySound: false
  }
}



//functions//

//king of the hill
function koth() {
  if (games[activeGame].mode !== "koth") {
    return;
  }

  document.getElementsByClassName(`square-d4`)[0].classList.add(`kothb`);
  document.getElementsByClassName(`square-d5`)[0].classList.add(`kothw`);
  document.getElementsByClassName(`square-e4`)[0].classList.add(`kothw`);
  document.getElementsByClassName(`square-e5`)[0].classList.add(`kothb`);
}

//racing kings
function rk() {
  if (games[activeGame].mode !== "rk") {
    return;
  }

  games[activeGame].fens = ["8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1"];
  board.position(games[activeGame].fens[0], false);
  games[activeGame].game.load(games[activeGame].fens[0]);

  if (board.orientation() === "black") {
    rotateBoard();
  }
}

//closing time
function ct() {
  if (games[activeGame].mode !== "ct") {
    return;
  }

  let setNr = Math.ceil(
    games[activeGame].games[activeGame].fens.length / 2
  ).toString();
  if (
    setNr[setNr.length - 1] === "8" ||
    setNr[setNr.length - 1] === "9" ||
    setNr[setNr.length - 1] === "0"
  ) {
    closingTime = true;
    closePub();
  } else {
    closingTime = false;
    openPub();
  }
}

function closePub() {
  document.getElementsByClassName(`square-c4`)[0].classList.add(`ctw`);
  document.getElementsByClassName(`square-c5`)[0].classList.add(`ctb`);
  document.getElementsByClassName(`square-d4`)[0].classList.add(`ctb`);
  document.getElementsByClassName(`square-d5`)[0].classList.add(`ctw`);
  document.getElementsByClassName(`square-e4`)[0].classList.add(`ctw`);
  document.getElementsByClassName(`square-e5`)[0].classList.add(`ctb`);
  document.getElementsByClassName(`square-f4`)[0].classList.add(`ctb`);
  document.getElementsByClassName(`square-f5`)[0].classList.add(`ctw`);
}

function openPub() {
  document.getElementsByClassName(`square-c4`)[0].classList.remove(`ctw`);
  document.getElementsByClassName(`square-c5`)[0].classList.remove(`ctb`);
  document.getElementsByClassName(`square-d4`)[0].classList.remove(`ctb`);
  document.getElementsByClassName(`square-d5`)[0].classList.remove(`ctw`);
  document.getElementsByClassName(`square-e4`)[0].classList.remove(`ctw`);
  document.getElementsByClassName(`square-e5`)[0].classList.remove(`ctb`);
  document.getElementsByClassName(`square-f4`)[0].classList.remove(`ctb`);
  document.getElementsByClassName(`square-f5`)[0].classList.remove(`ctw`);
}

//atoom
function atoomSchaak(target) {
  playSound(impactSound);

  let colArr = ["a", "b", "c", "d", "e", "f", "g", "h"];
  let c = colArr.indexOf(target.charAt(0));
  let r = 8 - parseInt(target.charAt(1));

  let board2d = games[activeGame].game.board();

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let fieldName = `${colArr[c + j]}${8 - r - i}`;
      let field = document.getElementsByClassName(`square-${fieldName}`)[0];

      if (field && fieldName !== target) {
        let fieldCol = "w";
        let classlist = field.classList;
        for (let classname of classlist) {
          if (classname.includes("black")) {
            fieldCol = "b";
          }
        }

        field.classList.add(`atoom${fieldCol}`);
        setTimeout(function () {
          field.classList.remove(`atoom${fieldCol}`);
        }, 1000);
      }

      if (board2d[r + i]) {
        if (board2d[r + i][c + j]) {
          if (
            (fieldName !== target && board2d[r + i][c + j].type !== "p") ||
            fieldName === target
          ) {
            games[activeGame].game.remove(fieldName);
            games[activeGame].fens[games[activeGame].fens.length - 1] =
              games[activeGame].game.fen();

            if (board2d[r + i][c + j].type === "k") {
              kingLose = true;
              let color = "wit";

              if (board2d[r + i][c + j].color === "w") {
                setWinner("zwart");
                color = "zwart";
              } else {
                setWinner("wit");
              }
            }

            setTimeout(function () {
              board.position(
                games[activeGame].fens[games[activeGame].fens.length - 1]
              );
            }, 500);
          }
        }
      }
    }
  }

  if (kingLose === false) {
    updateStatus();
  }
}

//fog of warr
function fog(winner) {
  if (games[activeGame].mode !== "fog") {
    return;
  }

  if (winner === "w") {
    setWinner("wit");
  } else if (winner === "b") {
    setWinner("zwart");
  }

  let allSquares = document.getElementsByClassName("square-55d63");
  for (let square of allSquares) {
    square.style.filter = "blur(80px)";

    for (let child of square.childNodes) {
      if (child.dataset.piece) {
        if (child.dataset.piece.includes(player.piece)) {
          square.style.filter = "blur(0px)";
        }
      }
    }
  }

  let allMoves = [];

  if (games[activeGame].game.turn() === player.piece) {
    allMoves = games[activeGame].game.moves();
  } else {
    allMoves = games[activeGame].game.moves({
      swap: true,
    });
  }

  for (let move of allMoves) {
    document.getElementsByClassName(`square-${move.to}`)[0].style.filter =
      "blur(0px)";
  }
}