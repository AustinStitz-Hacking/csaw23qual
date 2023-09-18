const spawn = require("child_process").spawn;

const winningList = [
  'King of Diamonds',  'One of Diamonds',   'One of Spades',
  'Queen of Diamonds', 'Six of Hearts',     'Nine of Hearts',
  'Ace of Spades',     'Jack of Clubs',     'Nine of Spades',
  'Jack of Hearts',    'Joker of Hearts',   'Five of Hearts',
  'Ace of Hearts',     'Zero of Clubs',     'Ace of Diamonds',
  'Ace of Clubs',      'Queen of Spades',   'King of Clubs',
  'Three of Hearts',   'Five of Clubs',     'Six of Diamonds',
  'One of Hearts',     'Zero of Hearts',    'Four of Spades',
  'Zero of Spades',    'Zero of Diamonds',  'Two of Clubs',
  'Eight of Clubs',    'Jack of Diamonds',  'Two of Diamonds',
  'Six of Clubs',      'Four of Hearts',    'King of Hearts',
  'Two of Spades',     'Joker of Diamonds', 'Seven of Hearts',
  'Queen of Clubs',    'Eight of Hearts',   'Two of Hearts',
  'Six of Spades',     'One of Clubs',      'Nine of Clubs',
  'King of Spades',    'Joker of Clubs',    'Jack of Spades',
  'Five of Diamonds',  'Eight of Diamonds', 'Seven of Clubs',
  'Five of Spades',    'Ten of Spades',     'Three of Diamonds',
  'Three of Clubs',    'Nine of Diamonds',  'Seven of Spades',
  'Queen of Hearts',   'Three of Spades',   'Joker of Spades',
  'Four of Clubs',     'Ten of Diamonds',   'Ten of Clubs',
  'Seven of Diamonds', 'Four of Diamonds',  'Ten of Hearts',
  'Eight of Spades'
];

async function decodeData(enc, computer_d, N) {
  const pythonProcess = spawn('python',["decode.py", BigInt(enc).toString(), computer_d.toString(), N.toString()]);
pythonProcess.stderr.on("data", n=>console.log(''+n));
let result = await new Promise((resolve,reject) => {pythonProcess.stdout.once("data", resolve);});
console.log(result.toString());
return result;
}


async function impersonate(rngseedstuff, prime1, prime2) {
  const pythonProcess = spawn('python',["impersonate.py", rngseedstuff.toString(), prime1.toString(), prime2.toString()]);
pythonProcess.stderr.on("data", n=>console.log(''+n));
let result = await new Promise((resolve,reject) => {pythonProcess.stdout.once("data", resolve);});
console.log(result.toString());
return result;
}

/* Testing system to predict RNG */

card_value_dict = {0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten", 11: "Jack", 12: "Queen", 13: "King", 14: "Ace", 15: "Joker"}
card_rank_dict = {"Zero": 0, "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5, "Six": 6, "Seven": 7, "Eight": 8, "Nine": 9, "Ten": 10, "Jack": 11, "Queen": 12, "King": 13, "Ace": 14, "Joker": 15}


class PRNG {
  constructor(seed = 149926132869534543) {
    this.seed = seed;
    this.state = [this.seed]
    this.index = 64
    for(let i = 0; i < 63; i++) {
      this.state.push((3 * (this.state[i] ^ (this.state[(i-1)%this.state.length] >> 4)) + i+1)%64);
    }
  }

  toString() {
    return self.state.toString();
  }

  getnum() {
    if(this.index >= 64) {
      for(let i = 0; i < 64; i++) {
        let y = (this.state[i] & 0x20) + (this.state[(i+1)%64] & 0x1f);
        let val = y >> 1;
        val = val ^ this.state[(i+42)%64]
        if(y & 1) {
          val = val ^ 37
        }
        this.state[i] = val
      }
      this.index = 0;
    }
    let seed = this.state[this.index]
    this.index += 1;
    return (seed*15 + 17)%(2**6)
  }
}

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.value = card_value_dict[rank];
    this.rank = rank;
  }

  toString() {
    return `${this.value} of ${this.suit}`;
  }
}

function parseCard(card) {
let carddata = card.split(" ");
let suit = carddata[2];
let rank = card_rank_dict[carddata[0]];
return new Card(suit, rank);
}

let rng = new PRNG(289);
console.log(rng.state);

function shuffle(deck, prng = rng) {
  let new_deck = [];
  for(let i = 0; i < deck.length; i++) {
    let x = prng.getnum();
    if(!new_deck.includes(deck[x])) new_deck.push(deck[x]);
    else if (!new_deck.includes(deck[i])) new_deck.push(deck[i])
    else {
       for(let card of deck) {
        if(!new_deck.includes(card)) {
         new_deck.push(card);
         break;
        }
       }
    }
  }
  return new_deck;
}

console.log(rng.seed);
deck = [];
deck_str = [];
for(suit of ["Spades", "Hearts", "Diamonds", "Clubs"]) {
  for(let i = 0; i < 16; i++) {
    deck.push(new Card(suit, i)); deck_str.push(deck[deck.length - 1].toString());
  }
}

new_deck = shuffle(deck);

function getNum(card, tdeck=new_deck) {
  return tdeck[card].rank + ["Spades", "Hearts", "Diamonds", "Clubs"].indexOf(tdeck[card].suit) * 16;
} 
function getSeed(received_deck) {
console.log(getNum(0,received_deck));
for(let seed = 0; seed < 256**8;seed++) {
   let trng = new PRNG(seed);
   let pdeck = shuffle(deck, trng);
   let broken = false;
   for(let i = 0; i < 5; i++) {
     if(!received_deck.slice(0,5).map(n=>n.toString()).includes(pdeck[i].toString())){//(getNum(i, pdeck) != getNum(i,received_deck)) {
       broken = true;
       break;
     }
   }
   if(!broken) {
     console.log(seed,pdeck.map(n=>n.toString()),received_deck.map(n=>n.toString()));
     return seed;
     break;
   }
}
   throw new Error("Seed not found");

}
console.log(getSeed(new_deck));
/*console.log(getSeed(['Eight of Hearts', 'Queen of Diamonds', 'Four of Hearts', 'Zero of Diamonds', 'Eight of Spades', 'Two of Clubs', 'Zero of Spades', 'Six of Spades', 'Queen of Hearts', 'Ten of Spades', 'King of Hearts', 'Five of Diamonds', 'Six of Clubs', 'Two of Diamonds', 'Jack of Diamonds', 'Queen of Spades', 'Zero of Hearts', 'Zero of Clubs', 'Three of Clubs', 'Seven of Spades', 'One of Spades', 'Four of Spades', 'Ace of Clubs', 'Seven of Hearts', 'Joker of Clubs', 'Nine of Hearts', 'Ten of Hearts', 'Jack of Hearts', 'King of Clubs', 'Two of Spades', 'Joker of Diamonds', 'Joker of Spades', 'Three of Spades', 'One of Hearts', 'Five of Spades', 'Three of Diamonds', 'Seven of Diamonds', 'Nine of Spades', 'Six of Diamonds', 'Ace of Hearts', 'Eight of Diamonds', 'Nine of Diamonds'
].map(parseCard)));*/


//rng = undefined;





const net = require('node:net');
const client = net.createConnection({ host: "crypto.csaw.io", port: 5001 }, () => {
  // 'connect' listener.
  console.log('connected to server!');
});

let encodedCards = {};
let decodedCards = {};
function reorderCards(cardData, rsafound, d, n) {
  if(!rsafound)
    return cardData;
  
  if(Object.keys(encodedCards).includes(cardData[0])) {
    console.log("Decoded card list: ", cardData.map(n=>encodedCards[n]));

    return winningList.map(n=>decodedCards[n]);
  } else {
(async () => {
    for(let card of cardData) {
      let decoded = await decodeData(card, d, n);
      decoded = decoded.toString();
      encodedCards[card.trim()] = decoded.trim();
      decodedCards[decoded.trim()] = card.trim();
    }
  })();
    return cardData;
    
  }
}

(async ()=>{
let primes;
let i = 0;
let testCard;
let N;
let phi;
let cardData = "";
let going = false;
let firstHand = [];
let rngseed = 0;
let blockAll = false;
let rsafoundistrue = false;
let computer_e, computer_d;
client.on('data', (data) => {
  if(blockAll) return;
  console.log("Received: " + data.toString());
  if(data.toString().includes("My hand is")) {
    i = 0;
    cardData = "";
    firstHand = firstHand.concat(data.toString().split("My hand is ")[1].split("\t-->\t")[0].split(", "));
    if(firstHand.length == 5) {
      console.log("Parsing...", firstHand.map(parseCard));
      (async () => {console.log("Solving...");rngseed = getSeed(firstHand.map(parseCard));console.log("SEED FOUND!");
console.log(rngseed);
let rsadata = await impersonate(rngseed, primes[0], primes[1]);
[computer_e, computer_d, phi, N] = rsadata.toString().split(' ')
console.log({computer_e, computer_d, phi, N})
/*rng = new PRNG(rngseed);
//console.log(phi);
console.log(shuffle(deck, rng));
computer_e = -1
computer_d = 0
while(computer_e < 2 || computer_d < 1) {
let e_array = [];
for(let _i = 0; _i < 6; _i++) {
e_array.push(rng.getnum().toString());
}
computer_e = BigInt(e_array.join(''));
//blockAll = true;
//console.log(computer_e.toString(), phi.toString());
const pythonProcess = spawn('python',["invert.py", computer_e.toString(), phi.toString()]);
let result = await new Promise((resolve,reject) => {pythonProcess.stdout.once("data", resolve);});
console.log(result.toString());
computer_d = BigInt(result.toString());
//if(gcd(computer_e, phi) == 1) {computer_d = modInverse(computer_e, phi);}
}
console.log("RSA FOUND!", computer_e, computer_d, N);//process.exit();*/
let decodedstuff = await decodeData(testCard, computer_d, N);
console.log(decodedstuff, "decoded");

rsafoundistrue = true;
//blockAll = false;
return;
})();
    }
  }

  if(data.toString().includes("Here are the primes")) {
    let _primes = data.toString().split("--> ")[1].split("\n")[0];
    primes = _primes.split(", ");
    console.log(primes);
    N = BigInt(primes[0])*BigInt(primes[1]);
    phi = BigInt(primes[0] - 1)*BigInt(primes[1] - 1);
    client.write("1\n");
  }
  if(data.toString().includes("source code and know")) {
    console.log(primes);
    client.write("1\n");
  }
  if(data.toString().includes("Here is the shuffled encrypted deck --> [") || going) {
    let _primes = going?data.toString().split("]")[0]:data.toString().split("--> [")[1].split("]")[0];
    cardData += _primes;
    going = true;
    if(data.toString().includes("]")) {
      cardData = cardData.split(", ");
      console.log(cardData);
      testCard = cardData[0]
      going = false;
      cardData = reorderCards(cardData, rsafoundistrue, computer_d, N);
    }
  }
  if(data.toString().includes("That is an invalid card! Please try again")) i--;
  if(data.toString().includes("Card ")) {
    setTimeout(()=>{let value = cardData[i++]
    client.write(value+'\n');
    console.log(value, i, cardData.length);}, 10);
  }
  if(data.toString().includes("here's the encrypted flag")) {
    console.log("Decode with following: ", computer_d, N);
  }

  //client.end();
});
client.on('end', () => {
  console.log('disconnected from server');
}); })();