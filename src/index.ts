#!/usr/bin/env node --experimental-repl-await

import { Framework } from '@vechain/connex-framework'
import { DriverNodeJS } from '@vechain/connex.driver-nodejs'
import * as REPL from 'repl'
import { resolve } from 'path'

process.on('unhandledRejection', reason => {
    console.log(reason)
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
                    const progressPercentage = connex.thor.status.progress * 100
                    const progressStr = Number.isInteger(progressPercentage) ? progressPercentage.toString() : progressPercentage.toFixed(1)
                    return `${network}(${progressStr}%)> `
                }
            }

            const server = REPL.start(prompter.text)
            setupREPL(server, {
                connex,
                thor: connex.thor,
                vendor: connex.vendor,
                wallet: driver.wallet
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
    if (server.terminal) {
        require('repl.history')(server, resolve(process.env.HOME!, '.connex-repl_history'))
    }
    server.once('exit', () => {
        server.close()
        process.exit(0)
    })

    const globalNames = [
        ...Object.getOwnPropertyNames(server.context),
        ...Object.getOwnPropertyNames(global),
        ...Object.getOwnPropertyNames(Object.prototype)
    ]

    const shouldSkipAutoCompletion = (s: string) => {
        if (s.indexOf('.') < 0) {
            return globalNames.indexOf(s) >= 0
        }
        return false
    }

    // override completer
    const originalCompleter = server.completer;
    (server as any).completer = (line: string, callback: Function) => {
        (originalCompleter as any).call(server, line, (err: any, out: [string[], string]) => {
            if (err) {
                return callback(err)
            }
            callback(null, [out[0].filter(i => !shouldSkipAutoCompletion(i)), out[1]])
        })
    }

    Object.assign(server.context, obj)
}

