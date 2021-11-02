const config = {
    credentials: {
        host: 'localhost', // VPS host/IP
        user: 'user', // for security perposes don't use root user
        pass: 'pass',
        baseDir: '/tmp',
        login_auth: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        random_token: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    },
    endpoint: {
        url: 'https://yourhosting.com/clientarea.php?action=productdetails&id=<VPSID>&api=json&act=vpsmanage&stats=1&svs='
    },
    io: {
        path: './exp/', // relative path to IO directory
        expFile: 'exp.data.json' // export file. used to save operation info
    },
    prefs: {
        unit: 'GB', // default unit in size calculation
        reportUnit: 'MB', // default unit in report showcase
        ratio: 8, // 1 GB download traffic = 8 GBs upload traffic
        sampleFile: 'file.zip', // temporary filename for dummy file
        uploadURL: 'https://uploadservice.com/', // you can use http/https
        uploadData: '', // if upload server requires data query, you can input it here
    }
}

module.exports = config