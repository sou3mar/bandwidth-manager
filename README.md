# Introduction

A Node.js program to bypass hosting's bandwidth limits on servers by syncing in/out traffic according to ISP's terms.
Most providers will reset the traffic limit when you reach the threashold, if your usage meets their fair-usage ratio. e.g. 1:8 / 1:16 (1 GB Download ~ 8 GB Upload)

# Run

First, ensure that you've got `node` & `npm` installed using below command:

```sh
$ node -v
v16.10.0
$ npm -v
7.24.1
```

Also check for `git` & `curl` on your server:

```sh
$ git --version
git version 2.25.1
$ curl --version
curl 7.68.0 (x86_64-pc-linux-gnu) ...
```

• Versions can be different based on what you have installed on your server.

Clone this repository into your server:

```sh
$ git clone https://github.com/sou3mar/bandwidth-manager.git
```

• Then install dependencies:

```sh
$ npm i
```

• There's a sample config file which can be used as the main config. Name of the config file should be: `config.js` 
You can use the sample config file by entering this command:

```sh
$ mv config.sample.js config.js
```

Open config file using any text editor you got. In this case I use `nano`.

```sh
$ nano config.js
```

• Edit file according to your needs.

- `config.credentials`
- - `host`: Hostname/IP of your VPS (`localhost` if working on the same server)
- - `user`: Username (Don't use `root` or any `sudo-access` users)
- - `pass`: Password
- - `baseDir`: Where the commands should be executed. This script works with files. You can assign a path to where you want the operations happen. Default is `/tmp`
- - `login_auth`: Value of `WHMCSlogin_auth_tk` cookie set by WHMCS. This can be found on WHMCS control panel of your hosting provider. Just copy the cookie value and paste it there.
- - `random_token`: Value of `WHMCSNsYIxCBFPWXb` cookie set by WHMCS. This can also be found on WHMCS control panel of your hosting provider. Just copy the cookie value and paste it there.

- `config.endpoint`
- - `url`: URL of the endpont at your hosting provider's panel. WHMCS provides a monitoring plugin for servers in control panel. This is the URL of that page. It will usually look like this:
`https://yourhosting.com/clientarea.php?action=productdetails&id=<VPSID>&api=json&act=vpsmanage&stats=1&svs=`
All you need to do is to find the clientarea URL and `<VPSID>` as mentioned in the URL above.

- `config.io`
- - `path`: Path to where the export file should be stored. Default: `./exp/`
Change it to `./` if you don't have a directory named `exp` or want the export file to be stored in root directory.
-  - `expFile`: Name of the export file. Default: `exp.data.json`

- `config.prefs`
- - `unit`: Default unit in size calculation. Default: `GB`
- - `reportUnit`: Default unit in report showcase. Default: `MB`
- - `ratio`: ISP's bandwidth fair-usage ratio. (1:n) Default: `8`
- - `sampleFile`: Name of the dummy file created by the script for upload process. Default: `file.zip`
- - `uploadURL`: URL of the upload server. (Any http/https server than can accept file uploads)
- - `uploadData`: (Optional) If upload server requires some POST data during upload, you may insert it there in `key=value` format. (Some upload services send info with files)

• Finally, run the program using this command:
```sh
$ node .
```
