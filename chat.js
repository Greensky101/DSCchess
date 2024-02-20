console.log("chat.js LOADED");

//varibles//
let lastText = "";

//functions//
function checkBericht(text) {
  text = text.replace(/  +/g, " ");
  text = text.trim();

  if (text === " " || text === "") {
    return false;
  }

  return text;
}

function sendBericht() {
  let text = document.getElementById("chatBericht").value;
  document.getElementById("chatBericht").value = "";
  text = checkBericht(text);
  if (text === false) {
    return;
  }

  let bericht = {
    text: text,
    player: player.name,
    timeStamp: Date.now(),
  };

  if (document.getElementById("toernooiChat").style.display === "block") {
    toernooiBerichtenRef.push(bericht);
  } else if (document.getElementById("gameChat").style.display === "block") {
    gameBerichtenRef.push(bericht);
  }
}

function makeLocalBericht(text) {
  text = checkBericht(text);

  //check is text is already send
  if (text === lastText) {
    return;
  }

  lastText = text;

  let bericht = {
    player: "DSC",
    text: text,
    timeStamp: Date.now(),
  };

  setBerichtenbox(bericht, "toernooiChat");
}

function setBerichtenbox(nieuwBericht, chat) {
  let berichtKey = "~intern";

  if (document.getElementById(chat).style.display === "block") {
    document.getElementById("isTyping").style.visibility = "hidden";
  }

  if (typeof nieuwBericht.val === "function") {
    berichtKey = nieuwBericht.key;
    nieuwBericht = nieuwBericht.val();
  }

  let elementText = document.createElement("p");
  elementText.id = `text${berichtKey}`;
  elementText.innerText = nieuwBericht.text;

  if (nieuwBericht.player === player.name) {
    elementText.classList.add("mijnBericht");
    document.getElementById(chat).appendChild(elementText);
  } else {
    let elementName = document.createElement("p");
    elementName.innerText = nieuwBericht.player;
    elementName.id = `name${berichtKey}`;
    if (nieuwBericht.player === "DSC") {
      elementName.classList.add("berichtNameDSC");
      elementText.classList.add("berichtDSC");
    } else {
      elementName.classList.add("berichtName");
      elementText.classList.add("bericht");
    }

    document.getElementById(chat).appendChild(elementName);
    document.getElementById(chat).appendChild(elementText);

    if (document.getElementById(chat).style.display === "none") {
      if (
        chat === "toernooiChat" &&
        (!player.lastToernooiChat ||
          player.lastToernooiChat < nieuwBericht.timeStamp)
      ) {
        document.getElementById("lobbyDot").style.display = "block";
      } else if (
        chat === "gameChat" &&
        (!player.lastGameChat || player.lastGameChat < nieuwBericht.timeStamp)
      ) {
        document.getElementById("gameDot").style.display = "block";
        playSound(messageAudio);
      }
    } else if (document.getElementById(chat).style.display === "block") {
      if (chat === "toernooiChat") {
        playerRef.child("lastToernooiChat").set(Date.now());
      } else {
        playerRef.child("lastGameChat").set(Date.now());
      }
    }
  }

  setScroll();
}

function removeBerichtenbox(bericht) {
  if (document.getElementById(`text${bericht}`)) {
    document.getElementById(`text${bericht}`).remove();
  }

  if (document.getElementById(`name${bericht}`)) {
    document.getElementById(`name${bericht}`).remove();
  }
}

function changeBerichtenbox(nieuwBericht) {
  let berichtKey = nieuwBericht.key;
  let bericht = nieuwBericht.val();

  if (document.getElementById(`text${berichtKey}`)) {
    document.getElementById(`text${berichtKey}`).innerText = bericht.text;
  }

  if (document.getElementById(`name${berichtKey}`)) {
    document.getElementById(`name${berichtKey}`).innerText = bericht.player;
  }
}

function setEmoijPicker() {
  if (document.fullscreenElement) {
    emojiPicker.style.top = "21vh";
    emojiPicker.style.height = "66vh";
  } else {
    emojiPicker.style.height = "59vh";
    emojiPicker.style.top = "23vh";
  }
}

function showEmojiPicker(show) {
  if (show === false) {
    emojiPicker.style.display = "none";
  } else {
    if (emojiPicker.style.display === "block") {
      emojiPicker.style.display = "none";
    } else {
      emojiPicker.style.display = "block";
      let sheet = new CSSStyleSheet();
      sheet.replaceSync(`.nav-button { overflow-x: auto }`);
      emojiPicker.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }
}

let isTypingtimer;
function isTyping(chat) {
  if (document.getElementById(chat).style.display === "block") {
    clearTimeout(isTypingtimer);
    document.getElementById("isTyping").style.visibility = "visible";
    isTypingtimer = setTimeout(() => {
      document.getElementById("isTyping").style.visibility = "hidden";
    }, 3000);
  }
}
