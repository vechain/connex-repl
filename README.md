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
VeChain Connex Playground
connex v1.2.3
Mainnet(100%)>
```

## Play with it

* Check VeChain status
    ```bash
    > thor.status
    ```

* Import private key
    ```bash
    > wallet.add('<private key>')
    ```

* TODO