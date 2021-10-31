const axios     =   require('axios').default
const ssh       =   require('simple-ssh')
const fs        =   require('fs')
const chalk     =   require('chalk')
const config    =   require('./config') // all of the configurations exist in this file

const expFile   =   config.io.path + config.io.expFile
const startTime =   new Date().getTime()
const todayDate =   new Date().toISOString().slice(0, 10).replaceAll('-', '') // reformatting date as YYYYMMDD - used by endpoint

fs.exists(expFile, exist => {
    if(!exist) fs.open(expFile, 'w', err => {
            if(err) {
                console.log(chalk.red(`[ERROR] IO / ${err}`))
                return
            }

            console.log(chalk.green(`[INFO] Export file (${expFile}) successfully created.`))
        })
})

console.log(chalk.blue(`[CONFIG] ENDPOINT ${config.endpoint.url}`))
console.log(chalk.magenta(`[INFO] Handshaking with endpoint...`))

axios.get(
    config.endpoint.url, {
        headers: {
            Cookie: `WHMCSlogin_auth_tk=${config.credentials.login_auth}; WHMCSNsYIxCBFPWXb=${config.credentials.random_token};`
        }
    }
).then(res => {
    console.log(chalk.bold.green('[INFO] Successfully connected to endpoint.'))
    console.log(chalk.magenta('[INFO] Parsing data from endpoint...'))
    const data  =   res.data
    const info  =   data.info

    const todayUsage = {
        in: info.bandwidth.in[todayDate],
        out: info.bandwidth.out[todayDate]
    }

    let neededOut = todayUsage.in * config.prefs.ratio
    let trafficToSync = neededOut - todayUsage.out

    console.log(chalk.green(`[INFO] Data parsed. Hostname: ${info.hostname}`))
    console.log(chalk.blue(`[CONFIG] Download to Upload ratio: 1:${config.prefs.ratio}`))

    console.log(`Bandwidth => ${chalk.bold.grey(`${info.bandwidth.used_gb} ${config.prefs.unit}`)} / ${chalk.bold.red(`${info.bandwidth.limit_gb} ${config.prefs.unit}`)}
    • Today usage: IN ${chalk.bold.grey(`${todayUsage.in} ${config.prefs.reportUnit}`)} / OUT ${chalk.bold.grey(`${todayUsage.out} ${config.prefs.reportUnit}`)}
    • Needed traffic (OUT): ${chalk.bold.grey(`${neededOut} ${config.prefs.reportUnit}`)}
    • Traffic to sync (OUT): ${chalk.bold.red(`${trafficToSync} ${config.prefs.reportUnit} ${trafficToSync < 0 ? '(You need Incoming traffic)' : ''}`)}
    `)

    if(trafficToSync < 0) return // no need to initiate SSH connection

    let chunks = 0, littleChunk = 0

    if(trafficToSync < 1000) {
        chunks = 0
        littleChunk = Math.ceil(littleChunk) * 1000000
        console.log(chalk.white(`[INFO] Can create a (<1 GB) file.`))
    } else {
        chunks = trafficToSync / 1000
        littleChunk = (chunks % 1) * 1000000000
        chunks = Math.floor(chunks)
        console.log(chalk.white(`[INFO] Can create ${chunks} x 1 GBs file.`))
    }

    console.log(chalk.white(`[INFO] ${chunks} x 1 GB & 1 x ${littleChunk} MBs file.`))

    // SSH CONNECTION
    console.log(chalk.blue(`[CONFIG] SSH connection to ${config.credentials.user}@${config.credentials.host}`))

    const conn = new ssh(config.credentials)

    if(littleChunk > 0) {
        let command = `cd /tmp && head -c ${littleChunk} /dev/urandom >chunk-${startTime}.zip`
        console.log(chalk.white(`[INFO] Executing command: ${command}`))
        
        conn.exec(command)
        conn.exec(`cd /tmp && curl -F 'n=@/tmp/chunk-${startTime}.zip' -F '${config.prefs.uploadData}' ${config.prefs.uploadURL} --progress-bar --verbose --insecure | tee /dev/null`, {
            out: console.log.bind(console)
        })
    }

    if(chunks > 0) {
        conn.exec(`cd /tmp && head -c 1000000000 /dev/urandom >${config.prefs.sampleFile}`)

        for(i = 0; i < chunks; i++) {
            conn.exec(`cd /tmp && curl -F 'n=@/tmp/${config.prefs.sampleFile}' -F '${config.prefs.uploadData}' ${config.prefs.uploadURL} --progress-bar --verbose --insecure | tee /dev/null`, {
                out: console.log.bind(console)
            })
        }
    }

    conn.exec(`rm -rf chunk-${startTime}.zip`, {
        out: console.log.bind(console)
    })

    console.log(chalk.white(`[INFO] Starting upload process.`))
    conn.start() // start running command queue

    conn.on('error', err => {
        console.log(chalk.red(`[ERROR] ${err}`))
        conn.end()
        return
    })

}).catch(e => {
    console.log(chalk.bold.red(`[ERROR] ${e}`))
    return
})