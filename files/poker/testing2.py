import os, sys
from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes
from math import gcd

bytenum = 8

card_value_dict = {0: "Zero", 1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten", 11: "Jack", 12: "Queen", 13: "King", 14: "Ace", 15: "Joker"}
card_rank_dict = {"Zero": 0, "One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5, "Six": 6, "Seven": 7, "Eight": 8, "Nine": 9, "Ten": 10, "Jack": 11, "Queen": 12, "King": 13, "Ace": 14, "Joker": 15}

class PRNG:
	def __init__(self, seed = int(os.urandom(bytenum).hex(),16)):
		self.seed = seed
		self.state = [self.seed]
		self.index = 64
		for i in range(63):
			self.state.append((3 * (self.state[i] ^ (self.state[i-1] >> 4)) + i+1)%64)
	
	def __str__(self):
		return f"{self.state}"
	
	def getnum(self):
		if self.index >= 64:
			for i in range(64):
				y = (self.state[i] & 0x20) + (self.state[(i+1)%64] & 0x1f)
				val = y >> 1
				val = val ^ self.state[(i+42)%64]
				if y & 1:
					val = val ^ 37
				self.state[i] = val
			self.index = 0
		seed = self.state[self.index]
		self.index += 1
		return (seed*15 + 17)%(2**6)

class Card:
	def __init__(self, suit, rank):
		self.suit = suit
		self.value = card_value_dict[rank]
		self.rank = rank
	
	def __str__(self):
		return f"{self.value} of {self.suit}"


rng = PRNG()
print(rng.state)

def shuffle(deck, prng = rng):
	new_deck = []
	for i in range(len(deck)):
		x = prng.getnum()
		if deck[x] not in new_deck:
			new_deck.append(deck[x])
		elif deck[i] not in new_deck:
			new_deck.append(deck[i])
		else:
			for card in deck:
				if card not in new_deck:
					new_deck.append(card)
					break
	return new_deck


print(rng.seed)
deck = []
deck_str = []
for suit in ["Spades", "Hearts", "Diamonds", "Clubs"]:
	for i in range(16):
		deck.append(Card(suit, i))
		deck_str.append(str(deck[-1]))


new_deck = shuffle(deck)

print(new_deck[0].rank + ["Spades", "Hearts", "Diamonds", "Clubs"].index(new_deck[0].suit) * 16)

def getNum(card, tdeck = new_deck):
	return tdeck[card].rank + ["Spades", "Hearts", "Diamonds", "Clubs"].index(tdeck[card].suit) * 16

print(getNum(0))

for seed in range(256**bytenum):
    trng = PRNG(seed)
    pdeck = shuffle(deck, trng)
    broken = False
    for i in range(5):
        if not getNum(i, pdeck) == getNum(i):
            broken = True
            break
    if not broken:
        print(seed)
        print(list(map(str,pdeck)))
        print(list(map(str,new_deck)))
        break
