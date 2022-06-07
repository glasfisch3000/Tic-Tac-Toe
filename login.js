class Account {
  constructor(ip, username) {
    this.ip = ip;
    this.username = username;
  }
}

var accounts = [null];

function usernameExists(user) {
  for(var acc of accounts) {
    if(acc && acc.username===user) {
      return true;
    }
  }

  return false;
}

function indexOfIP(ip) {
  for(var i = 0; i<accounts.length; i++) {
    if(accounts[i] && accounts[i].ip===ip) {
      return i;
    }
  }

  return -1;
}

function getUsername(ip) {
  var index = indexOfIP(ip);
  if(index === -1) return undefined;
  else {
    if(accounts[index]) return accounts[index].username;
    else return null;
  }
}

function connect(ip, user, overrideUsername) {
  var index = indexOfIP(ip);

  if(usernameExists(user)) {
    if(index === -1) return false;
    else if(accounts[index].username===user) return true;
    else return false;
  }

  if(index === -1) accounts.push(new Account(ip, user));
  else if(overrideUsername) accounts[index].username = user;
  else return true;

  return true;
}

var randomUsernames = ["Moin Meister", "Deine Mutter", "Rüdiger", "Carsten", "Rofl", "Beff Jezoz", "Holger Spastenberger", 
                        "DJ Blyatman", "Tronald Dumb", "Glassfisch", "Marcel d'Avis", "Torsten", "Sussus Amogus",
                        "Super Mario", "Der Besserscheißer", "Sebastian Kackmann", "Cyka Blyat", "Roflkopter", "Detlev Soost",
                        "Mangela Erkel", "Angelo Merte", "Badman", "Charles Darwyn", "Ananas", "Nürnberg", "Torben",
                        "Das Wyldschweyn", "Andreas", "Toastbrot", "Longschlong", "Ulrike Bethmann", "Förderschüler",
                        "Melon Usk", "Gernhard Reinholzen", "Fixi Hartmann", "Boe Jyden", "Künstler", "Schwanzus Longus"];

function getRandomUsername() {
  return randomUsernames[(Math.random()*randomUsernames.length-0.5).toFixed(0)];
}

module.exports.getUsername = getUsername;
module.exports.connect = connect;
module.exports.getRandomUsername = getRandomUsername;
