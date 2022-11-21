# Solana Programs de novo

## CLI set up
solana config set --url https://api.devnet.solana.com
solana config get
solana balance
or solana airdrop <num>

## Building the Rust file
`cargo build-bpf` didn't work until I had both [package] and [lib] in the toml file. then it generated the .so file.

`solana program deploy ./target/deploy/hello_world.so`

Program Id: CP6ET2sewmoBvmhPwFcUDbiAGRMjQ1jeVE3xd2KMHCNR

https://explorer.solana.com/address/CP6ET2sewmoBvmhPwFcUDbiAGRMjQ1jeVE3xd2KMHCNR?cluster=devnet

https://explorer.solana.com/tx/3a4x5gz3YWJGQgXUC6M8PgmCHz1yHZbGjtzJt5uLTzzm3kLpJjj8etrUxvBHzcsA9yNnAJLPWBR4ZYf4x1u8EgPY?cluster=devnet

## The Client
I used my prior art from the simple-client script folder to call the program.

https://explorer.solana.com/tx/2tYih9QxXuUTFdqLnxTy81HSkXxp3Ver95C2Byd2V4DuKtf86g9HAM51DnRhsVfTNdjEQbrcbEMqfw4ToVh1rVsX?cluster=devnet


## Next
4Urzd4Y2of3jjCDo9uGCqZxYSwP7WHhXtwgbxQrpYNKx
https://explorer.solana.com/address/4Urzd4Y2of3jjCDo9uGCqZxYSwP7WHhXtwgbxQrpYNKx?cluster=devnet

## Gotchas
Quite a painful experience. My Rust enum had an id, u64. On the client side, at first Borsh would not serialize a siple number, finally I converted it with new BN. But then the instruction still failed when sent to the Solana program/smart contract.

I just removed the ID, re-deployed under a new name (otherwise I am not sure it updates the program), and finally tried again. Success!

## Program from scratch
HXvmw6ZPPw2BnGzaGdUErRwUtfocnvAqiuEpbSBBRThZ
https://explorer.solana.com/address/HXvmw6ZPPw2BnGzaGdUErRwUtfocnvAqiuEpbSBBRThZ?cluster=devnet
