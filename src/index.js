const fs = require('fs')
const path = require('path')
const os = require('os')

function getArgs() {
    const args = process.argv.slice(2)

    const parsedArgs = {}

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]

        if (arg.startsWith('--')) {
            const argName = arg.slice(2)
            const argValue = args[i + 1]

            parsedArgs[argName] = argValue
        }
    }

    return parsedArgs
}


async function getToken(account, payload) {
    const response = await fetch(`http://api.vtexcommercestable.com.br/api/vtexid/apptoken/login?an=${account}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        console.error(`Failed to get token: ${response.status} ${response.statusText}`)
        
        process.exit(1)
    }

    return response.json().then(res => res.token)
}

function createSession(account, appkey, token) {
    const tokens = {
        [account]: token,
    }

    const session = {
        account,
        token,
        login: appkey,
    }

    const workspace = {
        currentWorkspace: 'master',
        lastWorkspace: null,
    }

    const homedir = os.homedir()
    const sessionDirectory = path.join(homedir, '.vtex', 'session')

    if (!fs.existsSync(sessionDirectory)) {
        fs.mkdirSync(sessionDirectory, { recursive: true })
    }

    fs.writeFileSync(path.join(sessionDirectory, 'tokens.json'), JSON.stringify(tokens))
    fs.writeFileSync(path.join(sessionDirectory, 'session.json'), JSON.stringify(session))
    fs.writeFileSync(path.join(sessionDirectory, 'workspace.json'), JSON.stringify(workspace))
}

; (async () => {
    const args = getArgs()

    for (const arg of ['account', 'appkey', 'apptoken']) {
        if (!args[arg]) {

            console.error(`Missing argument: --${arg}`)

            process.exit(1)

        }
    }

    const { account, appkey, apptoken } = args

    const token = await getToken(account, { appkey, apptoken })

    if (!token) {
        console.error('Failed to get token')

        process.exit(1)
    }

    try {
        createSession(account, appkey, token)
    } catch (error) {
        console.error(`Failed to create session: ${error.message}`)

        process.exit(1)
    }

    console.info(`Session created for account ${account}, appkey ${appkey} and apptoken ${apptoken.slice(0, 4)}...`)
})()