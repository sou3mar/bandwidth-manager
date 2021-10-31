const config = {
    credentials: {
        host: 'localhost', // VPS host/IP - 
        user: 'user', // for security purposes don't use root user
        pass: 'pass',
        login_auth: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        random_token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    endpoint: {
        url: 'https://ur-server-provider-endpoint'
    },
    io: {
        path: './exp/', // relative path to IO directory
        expFile: 'exp.data.json' // export file. used to save operation info
    },
    prefs: {
        unit: 'GB', // default unit in calculation
        reportUnit: 'MB', // default unit in report showcase
        ratio: 8, // 1 GB download traffic = 8 GBs upload traffic
        sampleFile: 'file.zip', // temporary filename for dummy file
        uploadURL: 'http://someuploadserver', // you can use http/https
        uploadData: '', // if upload server requires data query, you can input it here
    }
}

module.exports = config