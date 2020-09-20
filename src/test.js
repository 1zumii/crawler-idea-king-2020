const request = require('request')
const fs = require('fs')

request('https://www.idea-king.org//IK/www/img/works/9/138581/906a34ac258e050b75a61323d33872b9.jpg').pipe(fs.createWriteStream('../backupResults/' + 'abc.jpg'))