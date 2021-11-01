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

    let neededOut       =   todayUsage.in * config.prefs.ratio
    let trafficToSync   =   neededOut - todayUsage.out

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
        littleChunk = Math.ceil(trafficToSync) * 1000000
    } else {
        chunks = trafficToSync / 1000
        littleChunk = Math.ceil((chunks % 1) * 1000000000)
        chunks = Math.floor(chunks)
    }

    console.log(chalk.white(`[INFO] ${chalk.bold(chunks)} x 1 GBs & 1 x ${chalk.bold(littleChunk / 1000000)} MBs file.`))

    // SSH CONNECTION
    if(config.credentials.user.toLowerCase() === 'root') { // checking user access
        console.log(chalk.bold.red(`[WARN] Looks like you are using root user. It's not recommended at all!`))
    }

    console.log(chalk.blue(`[CONFIG] Initializing SSH connection to ${config.credentials.user}@${config.credentials.host}`))

    const conn = new ssh(config.credentials)

    if(littleChunk > 0) {
        conn.exec(`rm -rf ${config.prefs.sampleFile}`)

        let command = `head -c ${littleChunk} /dev/urandom >chunk-${startTime}.zip`

        console.log(chalk.white(`[INFO] Executing command: ${command}`))
        conn.exec(command).exec(`curl -F 'n=@/tmp/chunk-${startTime}.zip' -F '${config.prefs.uploadData}' ${config.prefs.uploadURL} --progress-bar --verbose --insecure | tee /dev/null`, {
            out: stdout => {
                console.log(chalk.cyan(`[RESPONSE] chunk-${startTime}.zip => ${stdout}`))
            }
        }).exec(`rm -rf chunk-${startTime}.zip`)
    }

    if(chunks > 0) {
        let command = `head -c 1000000000 /dev/urandom >${config.prefs.sampleFile}`
        console.log(chalk.white(`[INFO] Executing command: ${command}`))
        conn.exec(command) // creates a 1 GBs dummy file
        let uploaded = 0

        for(i = 0; i < chunks; i++) {
            conn.exec(`curl -F 'n=@/tmp/${config.prefs.sampleFile}' -F '${config.prefs.uploadData}' ${config.prefs.uploadURL} --progress-bar --verbose --insecure | tee /dev/null`, {
                out: stdout => {
                    ++uploaded
                    console.log(chalk.cyan(`[RESPONSE] ${config.prefs.sampleFile}:${uploaded}/${chunks} => ${stdout}`))
                }
            })
        }
    }

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