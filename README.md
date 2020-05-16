# A simple web-based tool for interacting with the FIO Protocol.

It currently supports signing transactions through either Anchor or Scatter wallets.

Features include:

 * Registering a FIO Domain
 * Renewing a FIO Domain
 * Registering a FIO Address
 * Renewing a FIO Address
 * Adding a FIO Address Association to a native blockchain address
 * Make a domain public or private

This tool never asks for your private keys or interacts with them in any way. All transactions are approved and signed within your secure wallet.

## Dependencies:

  - FIO Signing Wallet: [Anchor](https://github.com/greymass/anchor/releases) or [Scatter](https://get-scatter.com/)
  - git: [install](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - node / npm: [install](https://nodejs.org/en/download/) or [use a package manager](https://nodejs.org/en/download/package-manager/)

### To get started:

```
git clone https://github.com/greymass/fio-register.git
cd fio-register
npm install
npm run build
npm run start
```
