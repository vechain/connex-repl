#!/usr/bin/env node --experimental-repl-await

import { Framework } from '@vechain/connex-framework'
import { DriverNodeJS } from '@vechain/connex.driver-nodejs'
import * as REPL from 'repl'
import { resolve } from 'path'

process.on('unhandledRejection', reason => {
    //console.error('unhandled promise rejection', reason)
})

const baseUrl = process.argv[2]
if (baseUrl) {
    const networks: { [index: string]: string } = {
        '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a': 'Mainnet',
        '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127': 'Testnet',
        '0x00000000973ceb7f343a58b08f0693d6701a5fd354ff73d7058af3fba222aea4': 'Solo'
    }

    console.log(`VeChain Connex Playground`);

    (async () => {
        try {
            const driver = await DriverNodeJS.connect(baseUrl)
            const connex = new Framework(driver)
            console.log(`connex v${connex.version}`)

            const network = networks[connex.thor.genesis.id] || 'Custom'
            const prompter = {
                get text() {
                    const progressStr = '' + Math.floor(connex.thor.status.progress * 1000) / 10
                    return `${network}(${progressStr}%)> `
                }
            }

            const txHistory = [] as object[]
            driver.txConfig.watcher = obj => {
                txHistory.push(obj)
            }

            const server = REPL.start(prompter.text)
            setupREPL(server, {
                connex,
                thor: connex.thor,
                vendor: connex.vendor,
                wallet: driver.wallet,
                txConfig: {
                    get expiration() { return driver.txConfig.expiration },
                    set expiration(v) { driver.txConfig.expiration = v },
                    get gasPriceCoef() { return driver.txConfig.gasPriceCoef },
                    set gasPriceCoef(v) { driver.txConfig.gasPriceCoef = v }
                },
                txHistory
            })

            const ticker = connex.thor.ticker()
            for (; ;) {
                server.setPrompt(prompter.text)
                await ticker.next()
            }
        } catch (err) {
            console.error(err)
            process.exit(1)
        }
    })()
} else {
    console.log('Usage: connex <base-url>')
}


function setupREPL(server: REPL.REPLServer, obj: object) {
    Object.assign(server.context, obj)
    if (server.terminal) {
        require('repl.history')(server, resolve(process.env.HOME!, '.connex-repl_history'))
    }
    server.once('exit', () => {
        server.close()
        process.exit(0)
    })

    // override completer
    const originalCompleter = server.completer;
    (server as any).completer = (line: string, callback: Function) => {
        (originalCompleter as any).call(server, line, (err: any, out: [string[], string]) => {
            if (err) {
                return callback(err)
            }
            line = line.trim()
            if (line) {
                callback(null, out)
            } else {
                callback(null, [out[0].filter(i => obj.hasOwnProperty(i)), out[1]])
            }
        })
    }
}
