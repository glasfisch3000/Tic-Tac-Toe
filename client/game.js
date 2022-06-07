var socket = io();

var game = {
  gameID: null,
  player: 0,
  ip: null,
  available: false,
  winner: 0,
  fields: [],
  chat: []
}

initFields([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);

var defaultTitle = document.title;
var title = defaultTitle;
var lol = true;

setInterval(() => {
  document.title = title + (game.available&&lol ? " *" : "");
  lol = !lol;
}, 1000);

function initFields(fields, clear) {
  if(!fields || fields.length<1) return;

  var rows = [];
  for(var x = 0; x<fields.length; x++) {
    if(fields[x]) {
      for(var y = 0; y<fields[x].length; y++) {
        if(!rows[y]) {
          rows[y] = document.createElement("div");
          rows[y].setAttribute("class", "game-row");
        }

        var el = document.createElement("canvas");
        el.setAttribute("class", "game-field");
        el.setAttribute("x", x);
        el.setAttribute("y", y);
        if(game.fields[x] && game.fields[x][y]) drawItem(el, game.fields[x][y], game.fields[x][y]&&true);
        else {
          if(clear) clearCanvas(el);
          if(game.fields[x] && game.fields[x][y]) game.fields[x][y] = 0;
        }
        initListeners(el);
        rows[y].appendChild(el);
      }
    }
  }


  var gameFrame = document.getElementById("game-frame");
  gameFrame.innerHTML = "";
  for(var i = 0; i<rows.length; i++) {
    rows[i].style.width = (x*101) + "px";
    gameFrame.appendChild(rows[i]);
  }
  gameFrame.style.width = ((fields.length*101)+1) + "px";
}

function initListeners(field) {
  field.onclick = (event) => {
    var x = field.getAttribute("x");
    var y = field.getAttribute("y");

    if(game.available) {
      socket.emit("turn", {x: x, y: y});
      setTimeout(update, 100);
    }
  }
  field.onmouseover = (event) => {
    var x = field.getAttribute("x");
    var y = field.getAttribute("y");

    if(game.available && !game.fields[x][y]) drawItem(field, game.player, game.fields[x][y]);
  };
  field.onmouseout = (event) => {
    var x = field.getAttribute("x");
    var y = field.getAttribute("y");

    if(!game.fields[x][y]) clearCanvas(field);
  }
}

function drawItem(canvas, player, heavy) {
  canvas.width = 50;
  canvas.height = 50;
  var ctx = canvas.getContext("2d");
  ctx.beginPath();

  if(player===1) {
    ctx.moveTo(10, 10);
    ctx.lineTo(40, 40);
    ctx.moveTo(10, 40);
    ctx.lineTo(40, 10);
    ctx.strokeStyle = heavy ? "#55FF55" : "#009900";
  }
  else if(player===2) {
    ctx.arc(25, 25, 20, 0, 2*Math.PI);
    ctx.strokeStyle = heavy ? "#FF0000" : "#CC5555";
  }

  ctx.stroke();
  ctx.closePath();
}

function clearCanvas(canvas) {
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function getEndGameButtonsHTML() {
  var html = "";
  html += "<table class='end-game-buttons-table'>\n";
  html += "  <tbody>\n";
  html += "    <tr>\n";
  html += "      <td>\n";
  html += "        <button class='button' style='font-size: 20px' onclick='newRandomGame()'>Zufälliges Spiel</button>";
  html += "      </td>\n";
  html += "      <td>\n";
  html += "        <button class='button' style='font-size: 20px' onclick='newCustomGame()'>Neues Spiel erstellen</button>";
  html += "      </td>\n";
  html += "    </tr>\n";
  html += "  </tbody>\n";
  html += "</table>";

  return html;
}

function arraysEqual(a1, a2) {
  return JSON.stringify(a1)===JSON.stringify(a2);
}

var lastPlayer = game.player;
var lastFields = game.fields;
socket.on("game-data", (data) => {
  if(data) {
    if(data.game) {
      game.fields = [];
      for(var x = 0; x<data.game.length; x++) {
        if(data.game[x]) {
          game.fields[x] = [];
          for(var y = 0; y<data.game[x].length; y++) {
            if(!game.fields[x]) game.fields[x] = [];
            game.fields[x][y] = data.game[x][y];
          }
        }
      }
      if(!arraysEqual(game.fields, lastFields)) {
        initFields(game.fields);
      }
      lastFields = game.fields;
    }

    document.getElementById("player1").innerHTML = data.player1 || "?";
    document.getElementById("player2").innerHTML = data.player2 || "?";

    if(game.winner !== data.winner || lastPlayer !== game.player) {
      if(data.winner) console.log("player " + data.winner + " wins!");
      game.winner = data.winner;
      lastPlayer = game.player;
      initFields(game.fields, true);
      if(data.winner && game.player===data.winner) {
        document.getElementById("player-info").innerHTML = "Du hast gewonnen!";
        document.getElementById("player-info").style.color = "#55FF55";
        document.getElementById("available-info").innerHTML = getEndGameButtonsHTML();
      }
      else if(data.winner && data.winner===3) {
        document.getElementById("player-info").innerHTML = "Unentschieden!";
        document.getElementById("player-info").style.color = "#5555FF";
        document.getElementById("available-info").innerHTML = getEndGameButtonsHTML();
      }
      else if(data.winner) {
        document.getElementById("player-info").innerHTML = "Spieler " + (data.winner || 0) + " gewinnt!";
        document.getElementById("player-info").style.color = "#FF5555";
        if((game.player===1 && data.winner===2) || (game.player===2 && data.winner===1)) document.getElementById("available-info").innerHTML = getEndGameButtonsHTML();
        else document.getElementById("available-info").innerHTML = "";
      }
      else {
        document.getElementById("player-info").style.color = "inherit";
      }
    }

    title = defaultTitle + " - Spiel " + (data.id||0) + ": " + (data.width||0) + "x" + (data.height||0) + " (" + data.minLength + ")";
  }
})
socket.on("player-data", (id) => {
  game.player = id || 0;
  if(game.winner) return;
  document.getElementById("player-info").innerHTML = id ? "Spieler " + id : "Zuschauer";
})
socket.on("available", (available) => {
  game.available = available && true;
  if(game.winner) return;
  document.getElementById("available-info").innerHTML = available ? "Du bist am Zug" : (game.player ? "Warte auf Spieler " + (game.player===1 ? 2 : 1) + "..." : "");
})
socket.on("username", (user) => {
  if(user) {
    document.getElementById("username-frame").innerHTML = user;
  }
})
socket.on("client-data", (ip) => {
  if(ip) game.ip = ip;
})
socket.on("kick", (reason) => {
  alert("Du wurdest rausgeschmissen" + (reason ? " (" + reason + ")" : "") + ".");
})

function update() {
  socket.emit("game-data");
  socket.emit("available");
  socket.emit("player-data");
  socket.emit("username");
  socket.emit("client-data");
}
setInterval(update, 500);
update();

function newRandomGame() {
  socket.emit("end-game");
  setTimeout(() => {socket.emit("distribute")}, (Math.random()*3000).toFixed(0));
}

function newCustomGame() {
  showCustomGamePanel(true);
}

function showCustomGamePanel(show) {
  document.getElementById("custom-game-container").style.display = show ? "block" : "none";
}

function startCustomGame() {
  var width = parseInt(document.getElementById("custom-game-width").value) || 0;
  var height = parseInt(document.getElementById("custom-game-height").value) || 0;
  var minLength = parseInt(document.getElementById("custom-game-minLength").value) || 0;
  var fallThrough = document.getElementById("custom-game-fallThrough").checked || false;
  console.log(fallThrough);

  var err = false;
  if(!width) {
    customGameError({width: true});
    err = true;
  }
  if(!height) {
    customGameError({height: true});
    err = true;
  }
  if(!minLength) {
    customGameError({minLength: true});
    err = true;
  }

  if(!err) {
    socket.emit("end-game");
    setTimeout(() => {socket.emit("custom-game", {width: width, height: height, minLength: minLength, fallThrough: fallThrough})}, (Math.random()*3000).toFixed(0));
  }
}

function customGameError(args) {
  if(!args) return;

  if(args.width) {
    document.getElementById("custom-game-width").style.border = "1px solid #FF0000";
  }
  if(args.height) {
    document.getElementById("custom-game-height").style.border = "1px solid #FF0000";
  }
  if(args.minLength) {
    document.getElementById("custom-game-minLength").style.border = "1px solid #FF0000";
  }
}


//-------------------- chat --------------------


function sendChatMessage(msg) {
  if(msg) socket.emit("chat-message", msg);
}

function appendChatMessage(player, msg, time) {
  var msgFrame = document.getElementById("chat-messages");
  var date = new Date();
  date.setTime(time);

  var el = document.createElement("p");
  el.setAttribute("class", getChatMsgClass(player));
  el.innerHTML = msg + (time ? "<span class='chat-message-time'> - " + getStringRepresentation(date) + "</span>" : "");
  el.onmousedown = () => {
    el.setAttribute("clicked", "true");
    setTimeout(() => {el.setAttribute("clicked", "false")}, 2000);
  };
  el.onmouseup = () => {el.setAttribute("clicked", "false")};
  msgFrame.appendChild(el);
  msgFrame.scrollTop = msgFrame.scrollHeight - msgFrame.clientHeight;

  game.chat.push({player: player, msg: msg, time: time});
}

function getChatMsgClass(player) {
  var cssClass = "chat-message";
  if(!player) return cssClass;
  if(player.system) cssClass += " system-chat-message";
  if(player.error) cssClass += " error-chat-message";
  if(player.info) cssClass += " info-chat-message";
  if(player.ip && player.ip===game.ip) cssClass += " own-chat-message";

  return cssClass;
}

function chatError(msg) {
  appendChatMessage({error: true}, msg, new Date().getTime());
}

function chatInfo(msg) {
  appendChatMessage({info: true}, msg, new Date().getTime());
}

function getStringRepresentation(date) {
  if(!date) return "" + date;

  var day = "" + date.getDate();      if(day.length<2) day = "0" + day;
  var mth = "" + (date.getMonth()+1); if(mth.length<2) mth = "0" + mth;
  var year = "" + date.getFullYear();
  var hrs = "" + date.getHours();     if(hrs.length<2) hrs = "0" + hrs;
  var min = "" + date.getMinutes();   if(min.length<2) min = "0" + min;
  var sec = "" + date.getSeconds();   if(sec.length<2) sec = "0" + sec;

  var text = "";
  text += day + ".";
  text += mth + ".";
  text += year + " ";
  text += hrs + ":";
  text += min + ":";
  text += sec;
  return text;
}

function updateChat() {
  document.getElementById("chat-messages").innerHTML = "";
  socket.emit("chat-data");
}

document.getElementById("chat-input-button").addEventListener("click", (event) => {
  event.preventDefault();
  sendChatMessage(document.getElementById("chat-input").value);
  document.getElementById("chat-input").value = "";
})

socket.on("chat-message", (data) => {
  if(data && data.msg) {
    appendChatMessage(data.player, data.msg, data.time);
  }
})

socket.on("chat-data", (data) => {
  if(data) {
    for(var msg_data of data) {
      if(msg_data && msg_data.msg) appendChatMessage(msg_data.player, msg_data.msg, msg_data.time);
    }
  }
})


//-------------------- socket.io --------------------


reconnect = false;
reconnect_timeout = 1000;
next_reconnect = -1;

setInterval(() => {
  if(!reconnect) next_reconnect = -1;
  else if(next_reconnect<0) next_reconnect = new Date().getTime() + reconnect_timeout;

  if(next_reconnect>=0) {
    if(new Date().getTime()>=next_reconnect) {
      chatError("[socket.io] Verbindung wird hergestellt...");
      socket.connect();

      reconnect_timeout *= 1.3;
      reconnect = false;
    }
  }
}, 300);

socket.on("disconnect", (reason) => {
  if(reason === "io server disconnect") {
    setTimeout(() => {socket.connect()}, Math.random()*3000);
    document.getElementById("player-info").innerHTML = "Bitte warten...";
    document.getElementById("available-info").innerHTML = "";
  }
  else {
    var msg = "[socket.io] Verbindung getrennt (" + reason + ")";
    if(game.chat[game.chat.length-1].msg !== msg) chatError(msg);
    reconnect = true;
  }
})

socket.on("connect_error", (reason) => {
  var msg = "[socket.io] Verbindung fehlgeschlagen (" + reason + ")";
  if(game.chat[game.chat.length-1].msg !== msg) chatError(msg);
  reconnect = true;
})

socket.on("connect_failed", (reason) => {
  var msg = "[socket.io] Verbindung fehlgeschlagen (" + reason + ")";
  if(game.chat[game.chat.length-1].msg !== msg) chatError(msg);
  reconnect = true;
})

socket.on("connect", () => {
  reconnect_timeout = 1000;
  reconnect = false;
  updateChat();
  chatInfo("[socket.io] Verbindung wurde hergestellt");
})
