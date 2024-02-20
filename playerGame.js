console.log("playerGame.js LOADED");

//varibles//
let playerColor = "w";
let playerTime = 20 * 60;
let playerMode = "n";
let clicked = false;

//functions//
//set playerGame params
function setPlayergame(buttonId) {
  let value = buttonId.split("-")[2];

  if (buttonId.includes("color")) {
    document.getElementById("player-color-w").style.background = "none";
    document.getElementById("player-color-b").style.background = "none";

    playerColor = value;
  }

  if (buttonId.includes("time")) {
    document.getElementById("player-time-5").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-time-10").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-time-20").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-time-90").style.background = "hsl( 197, 50%, 13% )";

    playerTime = Number(value) * 60;
  }

  if (buttonId.includes("mode")) {
    document.getElementById("player-mode-normal").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-mode-koth").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-mode-rk").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-mode-atoom").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-mode-fog").style.background = "hsl( 197, 50%, 13% )";
    document.getElementById("player-mode-ct").style.background = "hsl( 197, 50%, 13% )";

    playerMode = value;
  }

  document.getElementById(buttonId).style.background = "rgb(60, 144, 177)";
}

//make a new game en put the info in the Queu
function startNewPlayerGame() {
  let playerToInviteRef = database.ref(`dscChess/play/games/${player.tournament_Id}/players/${playerToInvite}/invitedBy`);

  let game = {
    startTime: playerTime,
    witTime: playerTime,
    zwartTime: playerTime,
    mode: playerMode,
    tournatementId: `${player.tournament_Id}`,
    invitedBy: player.name
  }

  if (playerColor === "w") {
    game.gameId = `FreePlay-${player.name}-${playerToInvite}-${Date.now()}`;
    game.wit = player.name;
    game.zwart = playerToInvite;
  } else {
    game.gameId = `FreePlay-${playerToInvite}-${player.name}-${Date.now()}`;
    game.wit = playerToInvite;
    game.zwart = player.name;
  }

  playerToInviteRef.set(game);
}


//If the startGame button is pressed but i am the invited player start a animation on the buttton
function playerToInveteIsMe() {
  if (clicked) {
    return;
  }

  clicked = true;
  document.getElementById("playerPlayButton").innerText = "De stukken worden gezocht...";

  timer1 = setTimeout(function () {
    let text = ["Een paart verspringt zich 🐴",
      "Een toren word gerenoveerd 🏗️",
      "Waar is de loper heen? 🤷",
      "Nu eerst tijd voor koffie ☕️"
    ];
    let nr = Math.floor(Math.random() * text.length);
    document.getElementById("playerPlayButton").innerText = text[nr];
  }, 2000);

  timer2 = setTimeout(function () {
    document.getElementById("playerPlayButton").innerText = "Partij aan het analyseren...";
  }, 5000);

  timer3 = setTimeout(function () {
    let text = ["De uitslag is 1-0 😂",
      "De uitslag is 0-1 😂",
      "De uitslag is ½-½ 😂"
    ];
    let nr = Math.floor(Math.random() * text.length);
    document.getElementById("playerPlayButton").innerText = text[nr];
    clicked = false;
  }, 7000);
}