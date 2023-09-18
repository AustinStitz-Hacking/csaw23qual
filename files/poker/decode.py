from math import gcd
import sys
from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes


enc_card = int(sys.argv[1])
computer_d = int(sys.argv[2])
N = int(sys.argv[3])
player_d = 1

print(long_to_bytes(pow(pow(enc_card,computer_d,N),player_d,N)).decode())
sys.stdout.flush()
