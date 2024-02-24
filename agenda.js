console.log("agenda.js LOADED");

class Agenda {

  constructor() {
    this.test = "test"
  }

  shout(){
    console.log(this.test)
  }

}



/////////////
//functions//
////////////




//main function
//runs once on loading website
//
let agendaRef = database.ref("dscChess/play/agenda");
agendaRef.orderByKey().once("value",(snapshot) => {
    toernooiInfos = snapshot.val();
    
    //parse the toernooiInfo into a human friendly readeble info,
    //and populate the toernooiSelect
    let keys = Object.keys(toernooiInfos);
    for (let key of keys) {
      let toernooiInfo = toernooiInfos[key];
      parseInfo(toernooiInfo);
      makeToenooiSelect(toernooiInfo);
    }

    //find next tounament and check if prev tournament is still on
    let indexNextEvent = keys.findIndex((element) => element > Date.now());
    let indexPrevEvent = indexNextEvent - 1;

     //there is no next tournament, set next index to 0
    if (indexNextEvent < 0) {
      indexNextEvent = 0;
      indexPrevEvent = keys.length - 1;
    }

    prevToernooiInfo = toernooiInfos[keys[indexPrevEvent]];
    nextToernooiInfo = toernooiInfos[keys[indexNextEvent]];

    isEventStillOn(keys[indexNextEvent]);
    isEventStillOn(keys[indexPrevEvent]);

    showToernooiPopup();
    resetGame();
  },
  errData
);


//
//parse the toernooiInfo into a human friendly readeble info
//
function parseInfo(toernooiInfo){
  let toernooiT = parseDate(toernooiInfo.milis);
  let aanmeldT = parseDate(toernooiInfo.aanmeldMilis);

  if (toernooiInfo.milis === 0 || toernooiInfo.milis == 00000000) {
    toernooiInfo.datum = "-";
    toernooiInfo.tijd = "-";
  } else {
    toernooiInfo.datum = toernooiT.datum;
    toernooiInfo.tijd = toernooiT.tijd;
  }

  if (toernooiInfo.aanmeldMilis === 0) {
    toernooiInfo.aanmeldtijd = "-";
  } else {
    toernooiInfo.aanmeldtijd = aanmeldT.tijd;
  }

  let tempoSec = Math.floor((toernooiInfo.tempo / 1000) % 60).toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false,});

  let tempoMin = Math.floor((toernooiInfo.tempo / 1000 / 60) % 60)
  .toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false,});

  let tempoUur = Math.floor(toernooiInfo.tempo / 1000 / 60 / 60).toLocaleString("en-US",{ minimumIntegerDigits: 2, useGrouping: false,});

  if (toernooiInfo.tempo === 0) {
    toernooiInfo.tempoText = "-";
  } else {
    toernooiInfo.tempoText = `${tempoUur}<sup>u</sup> : ${tempoMin}<sup>m</sup> : ${tempoSec}<sup>s</sup>`;
  }

  if (toernooiInfo.totalRounds === 0) {
    toernooiInfo.totalRounds = "-";
  }
}


//
//parse a date into a human friendly readeble info,
//udes by pareInfo()
//
function parseDate(date_){
  let days = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];
  let months = ["januari", "fubruari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
  
  let date = new Date(date_);
  let dayName = days[date.getDay() -1];
  let dayNumber = date.getDate();
  let month = months[date.getMonth()];
  let tijd = date.toLocaleTimeString().split(":");
  
  
  return{
  datum : `${dayName} ${dayNumber} ${month}`,
  tijd : `${tijd[0]}:${tijd[1]}`,
  milis : Date.parse(date)
  }
}


//
//populate the toernooiSelect
//
function makeToenooiSelect(toernooiInfo){
  if (toernooiInfo.milis < Date.now()) {
    let option = document.createElement("option");
    option.text = `${toernooiInfo.datum} (${toernooiInfo.naam})`;
    option.value = toernooiInfo.milis;
    document.getElementById("tounooiSelect").add(option);
  }

}


//
//returns true is the event is still on,
//if not the function return false
//
//TO DO: this function should only return true or fale not setting varibles when true!! 
//
function isEventStillOn(id){
  if(!toernooiInfos[id]){
    return;
  }
 
  let playTime = toernooiInfos[id].totalRounds * toernooiInfos[id].tempo *2;
  let pauseTime = (toernooiInfos[id].totalRounds -1) * 300000;
  let extraTime = 1800000;
  let endTime = toernooiInfos[id].milis + playTime + pauseTime + extraTime;
  
  if(Date.now() > toernooiInfos[id].aanmeldMilis && Date.now() < endTime){
    newToernooiId = id;
    player.tournament_Id = id.toString();
    return true;
  }

  return false;
}
