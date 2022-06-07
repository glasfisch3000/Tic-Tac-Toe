var randomUsernames = require(__dirname + "/random-usernames.js");

var GAME_ID = 1;

class Game {
  constructor(width, height, minLength, fallThrough) {
    this.width = width || 3;
    this.height = height || 3;
    this.minLength = minLength || 3;
    this.fallThrough = fallThrough || false;

    this.id = GAME_ID;
    GAME_ID++;

    this.player1 = null;
    this.player2 = null;

    this.game = [];
    for(var x = 0; x<this.width; x++) {
      this.game[x] = [];
      for(var y = 0; y<this.height; y++) {
        this.game[x][y] = 0;
      }
    }

    this.turn = 1;
    this.winner = 0;
  }

  end() {
    if(this.player1) {
      var player = getPlayer(this.player1);
      if(player) {
        player.currentGame = null;
      }
      this.player1 = null;
    }
    if(this.player2) {
      var player = getPlayer(this.player2);
      if(player) {
        player.currentGame = null;
      }
      this.player2 = null;
    }
    this.winner = 0;
    this.turn = 1;

    this.game = [];
    for(var x = 0; x<this.width; x++) {
      this.game[x] = [];
      for(var y = 0; y<this.height; y++) {
        this.game[x][y] = 0;
      }
    }

    for(var i = 0; i<games.length; i++) {
      if(games[i] && games[i].id===this.id) {
        games.splice(i, 1);
        break;
      }
    }
  }

  checkWinner() {
    var winner = this.getWinner();
    if(!winner) return null;

    this.winner = winner;
  }

  getWinner() {
    if(this.checkWin(1)) return 1;
    if(this.checkWin(2)) return 2;
    if(this.checkFull()) return 3;
    return 0;
  }

  checkWin(player) {
    if(!this.game) return false;

    for(var x = 0; x<this.width; x++) for(var y = 0; y<=this.height-this.minLength; y++) if(this.checkCol(player, x, y)) return true;
    for(var y = 0; y<this.height; y++) for(var x = 0; x<=this.width-this.minLength; x++) if(this.checkRow(player, x, y)) return true;

    for(var x = 0; x<=this.width-this.minLength; x++) for(var y = 0; y<=this.height-this.minLength; y++) if(this.checkDiagonal1(player, x, y)) return true;
    for(var x = this.width-1; x>=this.minLength-1; x--) for(var y = 0; y<=this.height-this.minLength; y++) if(this.checkDiagonal2(player, x, y)) return true;

    return false;
  }

  checkCol(player, x, startY) {
    x = parseInt(x) || 0;
    startY = parseInt(startY) || 0;

    if(this.game && this.game[x]) {
      for(var y = startY; y<this.height; y++) {
        if(this.game[x][y]!==player) break;

        if(y >= startY + this.minLength - 1) return true;
      }
    }

    return false;
  }

  checkRow(player, startX, y) {
    startX = parseInt(startX) || 0;
    y = parseInt(y) || 0;

    for(var x = startX; x<this.width; x++) {
      if(!this.game || !this.game[x] || this.game[x][y]!==player) break;

      if(x >= startX + this.minLength - 1) return true;
    }

    return false;
  }

  checkDiagonal1(player, x, y) {
    x = parseInt(x) || 0;
    y = parseInt(y) || 0;

    var max = Math.min(this.width-x, this.height-y);

    for(var r = 0; r<max; r++) {
      if(!this.game[r+x] || this.game[r+x][r+y]!==player) break;

      if(r>=this.minLength-1) return true;
    }

    return false;
  }

  checkDiagonal2(player, x, y) {
    x = parseInt(x) || 0;
    y = parseInt(y) || 0;

    var max = Math.min(x+1, this.height-y);

    for(var r = 0; r<max; r++) {
      if(!this.game[x-r] || this.game[x-r][y+r]!==player) break;

      if(r>=this.minLength-1) return true;
    }

    return false;
  }

  checkFull() {
    if(!this.game) return false;
    for(var x = 0; x<this.width; x++) {
      if(!this.game[x]) return false;
      for(var y = 0; y<this.height; y++) {
        if(!this.game[x][y]) return false;
      }
    }

    return true;
  }
}

class Player {
  constructor(ip, username) {
    this.ip = ip;
    this.username = username;
    this.currentGame = -1;
    this.updateConnection();
  }

  getCurrentGame() {
    if(this.currentGame === -1) return null;

    var game = getGame(this.currentGame);
    if(!game) return undefined;

    return game;
  }

  updateConnection() {
    this.lastConnection = new Date().getTime();
  }

  getConnectionOffset() {
    return new Date().getTime() - this.lastConnection;
  }

  kickFromGame() {
    var game = this.getCurrentGame();
    if(game) {
      if(game.player1 && game.player1===this.ip) {
        game.player1 = null;
      }
      else if(game.player2 && game.player2===this.ip) {
        game.player2 = null;
      }
      this.currentGame = -1;
    }
  }
}

var games = [];
var players = [];

function connect(ip) {
  if(!ip) return;
  if(getPlayer(ip)) return;

  var username = getRandomUsername();
  var player = new Player(ip, username);
  players.push(player);
}

function rename(ip, newName) {
  if(!ip) return false;
  if(!getPlayer(ip)) return false;

  newName = validateUsername(newName);
  if(getPlayer(ip).username === newName) return true;

  getPlayer(ip).username = newName;
  return true;
}

function getUsername(ip) {
  var player = getPlayer(ip);
  if(player) return player.username;
  else return undefined;
}

function createGame(width, height, minLength, fallThrough) {
  var game = new Game(width, height, minLength, fallThrough);
  games.push(game);
  return game.id;
}

function joinGame(ip, gameID) {
  var player = getPlayer(ip);
  if(!player) return false;
  if(player.getCurrentGame()) return false;

  var game = getGame(gameID);
  if(!game) return false;
  if(game.player1) {
    if(game.player2) {
      return false;
    }
    else {
      game.player2 = ip;
      player.currentGame = gameID;
    }
  }
  else {
    game.player1 = ip;
    player.currentGame = gameID;
  }
}

function distributePlayer(ip) {
  for(var game of games) {
    if(joinGame(ip, game.id)) return true;
  }

  return false;
}

function distributeAllPlayers() {
  for(var player of players) {
    distributePlayer(player.ip);
  }
}

function openPlayers() {
  var p = [];
  for(var player of players) {
    if(player && !player.getCurrentGame()) p.push(player);
  }

  return p;
}

function getPlayer(ip) {
  if(!ip) return null;
  for(var player of players) {
    if(player && player.ip===ip) return player;
  }

  return undefined;
}

function getGame(id) {
  for(var g of games) {
    if(g && g.id===id) {
      return g;
    }
  }
}

function usernameExists(name) {
  for(var p of players) {
    if(p && p.username===name) {
      return true;
    }
  }

  return false;
}

function validateUsername(name) {
  if(!usernameExists(name)) return name;

  var pattern = /[^]*-[0-9]*/g;

  if(pattern.test(name)) {
    var pieces = name.split(/_/g);
    var newName = "";

    for(var i = 0; i<pieces.length-1; i++) {
      newName += pieces[i];
      newName += "_";
    }
    newUser += (parseInt(pieces[i])+1);

    return newName;
  }
  else {
    var newName = name + "_1";
    return newName;
  }
}

function getRandomUsername() {
  var name = getValidRandomUsername();
  if(name) return name;

  return validateUsername("Unbenannt");
}

function getValidRandomUsername() {
  var usernames = getAvailableRandomUsernames();
  return usernames[(Math.random()*usernames.length).toFixed(0)];
}

function getAvailableRandomUsernames() {
  var usernames = [];
  for(var i = 0; i<randomUsernames.length; i++) {
    var name = randomUsernames[i];
    if(!usernameExists(name)) usernames.push(name);
  }

  return usernames;
}

module.exports.connect = connect;
module.exports.rename = rename;
module.exports.getUsername = getUsername;
module.exports.getPlayer = getPlayer;
module.exports.createGame = createGame;
module.exports.getGame = getGame;
module.exports.players = players;
module.exports.games = games;
module.exports.joinGame = joinGame;
module.exports.distributePlayer = distributePlayer;
module.exports.distributeAllPlayers = distributeAllPlayers;
module.exports.openPlayers = openPlayers;
