console.log("chessGame.js LOADED");

class chessGame {
  constructor(mode = "normal") {
    this.mode = mode;
    this.ref = `dscChess/play/games/${player.tournament_Id}/games/${player.game_Id}`;
    this.game = new Chess();
    this.fens = [];
    this.fens.push(this.game.fen());

    this.capturedPieces = [];
    this.dragPiece;

    this.winFlag = "";

    this.startGameRef();
  }

  // !!!! moeten nog gestopt worden !!!!
  startGameRef() {
    consoleThis("this.startGameRef()", 2);

    //start the gameRef
    this.gameRef = database.ref(this.ref);
    this.gameRef.on("child_added", (snapshot) =>
      this.newGameinfo(snapshot.key, snapshot.val())
    );
    this.gameRef.on(
      "child_changed",
      (snapshot) => (this[snapshot.key] = snapshot.val())
    );

    //start the movesRef
    this.movesRef = database.ref(`${this.ref}/moves`);
    this.movesRef.on("child_added", (snapshot) => this.newMove(snapshot.val()));
  }

  newGameinfo(key, val) {
    this[key] = val;

    //if there is a draggedPuece check if its matching the player and set this.dragpiece
    if (key === "draggedPiece" && val.split("-")[0] === player.name) {
      this.dragPiece = val.split("-")[1];
    }

    // if activeGame is not this game stop here!
    if (this.ref !== activeGame) {
      return;
    }

    //if mode is comming in set the nessecery mode
    if (key === "mode" && val === "koth") {
      koth();
    }

    if (key === "mode" && val === "rk") {
      rk();
    }

    if (key === "mode" && val === "fog") {
      setTimeout(function () {
        fog();
      }, 500);
    }

    //if there is a draggedPuece check if its matching the player end set highlights
    if (this.dragPiece) {
      setHighlightsDoSet();
    }

    //if there is a gameresult set the endscreen
    if (key === "result") {
      setEndScreen();
    }
  }

  newMove(inputMove, boarNr) {
    //do the move!
    let move = this.game.move({
      from: inputMove.from,
      to: inputMove.to,
      promotion: inputMove.promotion,
    });

    // if move is not allowed, stop!
    if (move === null) {
      return null;
    }

    //push new fen to fens
    this.fens.push(this.game.fen());

    //do this stuff only if the game is active!
    if (this.ref === activeGame) {
      this.updateMoveToBoard(move);
    }

    //set the winflag is last row is reached in Racing Kings!
    if (this.mode === "rk" && move.piece === "k" && move.to.includes("8")) {
      this.setWinFlag(move);
    }

    if (this.winFlag === "w") {
      this.setWinFlag(move, "w");
    }

    //if a piece is captured, go to pieceCaptured()
    if (move.flags.includes("e") || move.flags.includes("c")) {
      this.pieceCaptured(move);
    }
  }

  updateMoveToBoard(move) {
    //Puts the set on the board
    if (
      fenIndex === undefined &&
      kingLose === false &&
      move.color !== player.piece
    ) {
      if (this.mode === "fog") {
        board.position(this.game.fen(), false);
      } else {
        board.position(this.game.fen());
      }
    }

    //set the highligths
    setHighlights();

    //update the status
    updateStatus();

    //Opens and cloces the pub
    if (this.mode === "ct") {
      ct();
    }

    //Blur and Unblur the fields
    if (this.mode === "fog") {
      fog();
    }

    //plays a game sound
    let randomNR = Math.floor(Math.random() * 7);
    playSound(audio[randomNR]);
  }

  setWinFlag(move, winner) {
    if (winner) {
      this.winFlag += winner;
    } else {
      this.winFlag += move.color;
    }

    if (this.winFlag === "ww") {
      setGameWinner("w", this);
    }

    if (this.winFlag === "b") {
      setGameWinner("b", this);
    }

    if (this.winFlag === "wb") {
      setGameWinner("wb", this);
    }
  }

  pieceCaptured(move) {
    let piece = move.captured.toUpperCase();

    let pieceColor = "w";
    if (move.color === "w") {
      pieceColor = "b";
    }
    this.capturedPieces.push(`${pieceColor}${piece}`);

    if (this.ref === activeGame) {
      this.updatePieceCaptured(move);
    }
  }

  updatePieceCaptured(move) {
    let piece = move.captured.toUpperCase();

    //if gamemode is atoom, go to atoomschaak()
    if (this.mode === "atoom") {
      atoomSchaak(move.to);
    }

    if (this.mode === "fog" && piece === "K") {
      fog(move.color);
    }

    //if player is not in wacthmode, place the captured piece nex to the board
    if (fenIndex === undefined) {
      if (move.color === "w") {
        //Het is een zwartstuk
        let img = `<img class="image${piece.toLowerCase()}" src="/bestanden/chessboardjs/img/chesspieces/wikipedia/b${piece}.png" alt="" width:82px;height:82px;">`;

        if (board.orientation() === "white") {
          document.getElementById("whitePieces").innerHTML += img;
        } else {
          document.getElementById("blackPieces").innerHTML += img;
        }
      }

      if (move.color === "b") {
        //Het is een witstuk
        let img = `<img class="image${piece}" src="/bestanden/chessboardjs/img/chesspieces/wikipedia/w${piece}.png" alt="" width:82px;height:82px;">`;

        if (board.orientation() === "white") {
          document.getElementById("blackPieces").innerHTML += img;
        } else {
          document.getElementById("whitePieces").innerHTML += img;
        }
      }
    }
  }

  displayCapturedPieces() {
    for (let piece of this.capturedPieces) {
      let img = `<img class="image${piece}" src="/bestanden/chessboardjs/img/chesspieces/wikipedia/${piece}.png" alt="" width:82px;height:82px;">`;

      if (piece[0] === "w") {
        document.getElementById("blackPieces").innerHTML += img;
      } else {
        document.getElementById("whitePieces").innerHTML += img;
      }
    }
  }

  setRemise(remiseVal) {
    if (remiseVal === player.piece) {
      document.getElementById("remiseIcon").style.color = "orange";
      document.getElementById("remiseTip").innerText = "Remise aangeboden!";
    } else if (remiseVal.includes("!")) {
      if (remiseVal !== `${player.piece}!`) {
        document.getElementById("remiseIcon").style.color = "red";
        document.getElementById("remiseTip").innerText = "Remise afgeslagen!";
      }
    } else if (remiseVal === "wz") {
      document.getElementById("remiseIcon").style.color = "green";
      document.getElementById("remiseTip").innerText =
        "Remise is overeengekomen";
      document.getElementById("statusdiv").innerText =
        "Game over, remise is overeengekomen.";
    } else {
      // Check if player is watching
      if (player.name !== gameinfo.wit && player.name !== gameinfo.zwart) {
        return;
      }

      if (window.confirm("Je tegenstander biedt remise aan, ga je akkoord?")) {
        gameRef.child("remise").set("wz");
        gameRef.child("result").set("1/2-1/2");
      } else {
        gameRef.child("remise").set(`${player.piece}!`);
      }
    }
    //gameRef.child("remise").remove();
  }
}
