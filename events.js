console.log("events.js LOADED");

//helper functions + varibles//
let fullDrag = false;
let edgeDown = false;
let gameIcons = document.querySelectorAll(".gameIcon");

function statusChange() {
  if (playerStatusRef && player.status !== "guest") {
    if (document.visibilityState === "visible") {
      playerStatusRef.set("aanwezig");
    } else {
      playerStatusRef.set("afwezig");
    }
  }
}

function signoffPlayer(url = "https://schaakclubdrachten.nl") {
  if (playerStatusRef) {
    playerStatusRef.onDisconnect().cancel();
    playerStatusRef.set("signedOff");
    playerStatusRef = stopFirebaseRef(playerStatusRef);
  }

  location.href = url;
}

function setDragPiece(event) {
  if (
    fullDrag &&
    games[activeGame]?.dragPiece &&
    document.fullscreenElement !== null
  ) {
    if (
      !document
        .getElementById("dragPiece")
        .innerHTML.includes(games[activeGame].dragPiece)
    ) {
      document.getElementById(
        "dragPiece"
      ).innerHTML = `<img src="/bestanden/chessboardjs/img/chesspieces/wikipedia/${games[activeGame].dragPiece}.png" alt="" class="piece-417db" data-piece="${pieceSize}" style=" z-index:100; width:${pieceSize}px;height:${pieceSize}px;">`;
    }

    document.getElementById("dragPiece").style.display = "block";
    document.getElementById(
      "dragPiece"
    ).style.top = `calc(${event.pageY}px - (${pieceSize}px /2))`;
    document.getElementById(
      "dragPiece"
    ).style.left = `calc(${event.pageX}px - (${pieceSize}px /2))`;
  }
}

function reverseColumns() {
  if (
    document.getElementById("gameRow").childNodes[0].style.flexDirection !==
    "column-reverse"
  ) {
    document
      .getElementById("gameRow")
      .childNodes[0].setAttribute("style", "flex-direction: column-reverse");
  } else {
    document
      .getElementById("gameRow")
      .childNodes[0].removeAttribute("style", "flex-direction: column-reverse");
  }
}

function changeControlHeader(text) {
  document.getElementsByClassName("myTooltip2")[0].innerText = text;
  toolTip2LastText = text;
}

function changeControleContent(elementId) {
  document.getElementById("toernooiInfoDiv").style.display = "none";
  document.getElementById("toernooiChat").style.display = "none";
  document.getElementById("pgndiv").style.display = "none";
  document.getElementById("gameChat").style.display = "none";
  document.getElementById("chatInput").style.display = "none";
  document.getElementById("changelog").style.display = "none";
  showEmojiPicker(false);

  document.getElementById(elementId).style.display = "block";
  if (elementId.includes("Chat")) {
    document.getElementById("chatInput").style.display = "block";
    document.getElementById("isTyping").style.visibility = "hidden";
    document.getElementById("lobbyDot").style.display = "none";
    setScroll();
  }

  if (elementId.includes("pgndiv")) {
    document.getElementById(elementId).style.display = "contents";
  }
}

//visibilitychange//

//change the player status when the browser is not visible
document.addEventListener("visibilitychange", () => {
  statusChange();
});

//ondrag//

// On firefox the eventListener "drag" is nog giving the mouse position,
// so we make our own drag function.
window.addEventListener("mousedown", (event) => {
  fullDrag = true;
  statusChange();

  if (typeof setDragPiece === "function") {
    setDragPiece(event);
  }
});

window.addEventListener("mouseup", () => {
  fullDrag = false;
  edgeDown = false;
});

window.addEventListener("mousemove", (event) => {
  if (typeof setDragPiece === "function") {
    setDragPiece(event);
  }

  document.getElementById("gameBar").style.cursor = "default";
  let b = document.getElementById("gameBar").getBoundingClientRect();
  let x = event.clientX - b.left;

  if (edgeDown) {
    document.getElementById("gameBar").style.width = `${x}px`;
    board.resize();
    koth();
    ct();
    fog();
  }

  onRightEdge = x > b.width - 5 && x < b.width + 5;
  if (onRightEdge) {
    document.getElementById("gameBar").style.cursor = "ew-resize";
    if (fullDrag) {
      edgeDown = true;
    }
  }
});

//onclick//
//close a modal when the outer ring is clicked
let modalContentOuter = document.getElementsByClassName("x-modal-bg");
for (let content of modalContentOuter) {
  content.addEventListener("click", (event) => {
    if (content.parentNode.id.includes("name")) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.stopPropagation();
      closeModal(`#${content.parentNode.id}`);
    }
  });
}

//nameModal
document.querySelector("#nameButton").addEventListener("click", () => {
  checkName(document.getElementById("naam").value);
});

document.querySelector("#closeNameButton").addEventListener("click", () => {
  location.href = "https://schaakclubdrachten.nl";
});

//stockfishModal
document.querySelector("#stockfishPlayButton").addEventListener("click", () => {
  player.tournament_Id = `Stockfish-${player.name}`;
  resetToernooi();
  startNewStockfishGame();
  closeModal("#stockfishPopup-modal");
});

//playerGameModal
document
  .querySelector("#startPlayergameButton")
  .addEventListener("click", () => {
    startNewPlayerGame();
    closeModal("#playerPopup-modal");
  });

//warningbars
document.querySelector("#stockfishPlayMode").addEventListener("click", () => {
  stopStockfishPlayMode();
});

//endscreen
document.querySelector("#stockfishFinish").addEventListener("click", () => {
  hideEndscreen();
  startStockfishPlayMode();
});

document.querySelector("#stockfishPlayAgain").addEventListener("click", () => {
  hideEndscreen();
  openStockfishPopup();
});

document.querySelector("#sluitButton").addEventListener("click", () => {
  hideEndscreen();
});

//gameIcons
document.querySelector("#pushIcon").addEventListener("click", () => {
  if (document.getElementById("infoBar").style.display !== "none") {
    document.getElementById("infoBar").style.display = "none";
    document.getElementById("gameBar").classList.remove("big");
    document.getElementById("gameBar").classList.add("fullScreen");
    document.getElementById("pushIcon").style.transform = "rotate(180deg)";
  } else {
    document.getElementById("pushIcon").style.transform = "rotate(0deg)";
    document.getElementById("gameBar").classList.remove("fullScreen");
    document.getElementById("gameBar").classList.add("big");
    document.getElementById("infoBar").style.display = "block";
  }
});

document.querySelector("#fullwindowIcon").addEventListener("click", () => {
  document.getElementById("gameRow").requestFullscreen();
  document.addEventListener("fullscreenchange", fullscreenMode, false);
});

document.querySelector("#windowIcon").addEventListener("click", () => {
  document.exitFullscreen();
});

document.querySelector("#windowIcon").addEventListener("click", () => {
  document.exitFullscreen();
});

document.querySelector("#rotateIcon").addEventListener("click", () => {
  rotateBoard();
});

document.querySelector("#resignIcon").addEventListener("click", () => {
  if (document.getElementById("resignIcon").style.color === "red") {
    return;
  }

  if (window.confirm("Weet je zeker dat je deze partij wil opgeven?")) {
    player.piece === "w" ? setWinner("zwart") : setWinner("wit");
  }
});

document.querySelector("#remiseIcon").addEventListener("click", () => {
  if (
    document.getElementById("remiseIcon").style.color !==
    "hsla(222,12%,28%,0.77)"
  ) {
    return;
  }

  if (gameinfo.remise) {
    if (gameinfo.remise === player.piece) {
      return;
    }

    if (
      gameinfo.remise.includes("!") &&
      !gameinfo.remise.includes(player.piece)
    ) {
      return;
    }
  }

  if (window.confirm("Weet je zeker dat je deze remise wil aanbieden?")) {
    gameRef.child("remise").set(player.piece);
  }
});

document.querySelector("#pauseIcon").addEventListener("click", () => {
  if (document.getElementById("pauseIcon").style.color === "red") {
    return;
  }

  document.getElementById("pauseIcon").style.color !== "green"
    ? playerStatusRef.set("guest")
    : playerStatusRef.set("aanwezig");
});

document.querySelector("#stockfishIcon").addEventListener("click", () => {
  openStockfishPopup();
});

document.querySelector("#calendarIcon").addEventListener("click", () => {
  openModal("#toernooiPopup-modal");
});

document.querySelector("#toernooiIcon").addEventListener("click", () => {
  player.tournament_Id = newToernooiId.toString();
  showToernooiPopup();
});

document.querySelector("#leaveIcon").addEventListener("click", () => {
  if (gameinfo.result || player.piece === "") {
    if (window.confirm("Weet je zeker dat je dit toernooi wil verlaten?")) {
      signoffPlayer();
    }

    return;
  }

  if (
    window.confirm(
      "Weet je zeker dat je dit toernooi wil verlaten en het spel wil opgeven?"
    )
  ) {
    player.piece === "w" ? setWinner("zwart") : setWinner("wit");

    signoffPlayer();
  }
});

document.querySelector("#meerIcon").addEventListener("click", () => {
  reverseColumns();
});

document.querySelector("#meerIcon2").addEventListener("click", () => {
  reverseColumns();
});

//infobarIcons
document.querySelector("#t-infoIcon").addEventListener("click", () => {
  changeControlHeader("Toernooi info");
  changeControleContent("toernooiInfoDiv");
});

document.querySelector("#lobbyIcon").addEventListener("click", () => {
  changeControlHeader("Lobby");
  changeControleContent("toernooiChat");

  if (playerRef) {
    playerRef.child("lastToernooiChat").set(Date.now());
  }
});

document.querySelector("#g-infoIcon").addEventListener("click", () => {
  changeControlHeader("Game info");
  changeControleContent("pgndiv");
});

document.querySelector("#chatIcon").addEventListener("click", () => {
  if (document.getElementById("chatIcon").style.color === "red") {
    return;
  }

  changeControlHeader("Prive chat");
  changeControleContent("gameChat");

  if (playerRef) {
    playerRef.child("lastGameChat").set(Date.now());
  }
});

document.querySelector("#changelogIcon").addEventListener("click", () => {
  changeControlHeader("Changelog");
  changeControleContent("changelog");
});

//playerStats
document.querySelector("#playerPlayButton").addEventListener("click", () => {
  if (playerToInvite === player.name) {
    playerToInveteIsMe();
  } else {
    openModal("#playerPopup-modal");
  }
});

document.querySelector("#changeName").addEventListener("click", () => {
  //openModal("#namePopup-modal");
  if (
    window.confirm(
      `Weet je zeker dat je je naam wil wijzigen?\nDe naam ${player.name} wordt voor de rest van de dag geblokeerd en is niet meer te gebruiken!`
    )
  ) {
    localStorage.removeItem("DSCplayer");
    signoffPlayer("https://schaakclubdrachten.nl/dscchess/play");
  }
});

//chat
document.querySelector("#chatBericht").addEventListener("click", (event) => {
  event.preventDefault();
  showEmojiPicker(false);
});

document.querySelector("#emoticonLabel").addEventListener("click", () => {
  setEmoijPicker();
  showEmojiPicker();
});

document
  .querySelector("emoji-picker")
  .addEventListener("emoji-click", (event) => {
    let emoji = event.detail.unicode;
    document.getElementById("chatBericht").value += emoji;
  });

document.querySelector("#chatBerichtButton").addEventListener("click", () => {
  showEmojiPicker(false);
  sendBericht();
});

//keyup//
//document
document.addEventListener("keyup", function (event) {
  if (event.key === "Escape") {
    event.preventDefault();
    stopStockfishPlayMode();
  }
});

//nameModal
document.querySelector("#naam").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    event.preventDefault();
    document.getElementById("nameButton").click();
  }
});

//chat
document.querySelector("#chatBericht").addEventListener("keyup", (event) => {
  if (
    event.key.length === 1 &&
    document.getElementById("toernooiChat").style.display === "block"
  ) {
    isTypingRef.child("isTyping").set(Date.now());
  }
  if (
    event.key.length === 1 &&
    document.getElementById("gameChat").style.display === "block"
  ) {
    gameRef.child("isTyping").set(Date.now());
  }

  if (event.key === "Enter") {
    event.preventDefault();
    sendBericht();
  }
});

//mouseover / mouseout//
//gameIcons
for (let icon of gameIcons) {
  icon.addEventListener("mouseover", () => {
    showTip(icon);
  });
  icon.addEventListener("mouseout", () => {
    hideTip(icon);
  });
}

//contextmenu//
//board
document.querySelector("#board1").addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

//touchstart / touchend//
//body
document.body.addEventListener("touchstart", (event) => {}, {
  passive: false,
});

//board
document.querySelector("#board1").addEventListener(
  "touchstart",
  (event) => {
    if (event.target.tagName === "IMG") {
      event.preventDefault();

      if (audiosWeWantToUnlock) {
        for (let mp3 of audio) {
          unlockSound(mp3);
        }

        unlockSound(impactSound);
        unlockSound(victorySound);
        unlockSound(messageAudio);

        audiosWeWantToUnlock = false;
      }
    }
  },
  {
    passive: false,
  }
);
