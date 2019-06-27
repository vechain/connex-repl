# Connex REPL

Connex REPL is the playground to interact with VeChain using Connex interface.


## Installation

NodeJS version >= 10 is required.

```bash
$ npm i -g @vechain/connex-repl
```

Startup to connect local thor API by default (http://localhost:8669/)
```bash
$ connex 
```

or specify remote one
```bash
$ connex http://remote-thor-api-base-url
```

Then you get a NodeJS REPL interface. e.g.

```bash
VeChain Connex Playground @ http://localhost:8669/
connex v1.3.1
Testnet(100%)> 
```

## Play with it

* Check VeChain status
    ```bash
    Testnet(100%)> thor.status
    ```

* Get newest block
    ```bash
    Testnet(100%)> await thor.block().get()
    ```
* Import private key
    ```bash
    Testnet(100%)> wallet.add('<private key>')
    ```

TODO
