const request = require('request')
const cheerio = require('cheerio')
const targetOrigin = "https://www.idea-king.org"
const mainListUrl = "/mobile/tpxs.php?from=timeline"

function getHrefList() {
    return new Promise((resolve, reject) => {
        request(targetOrigin + mainListUrl, function (error, response, body) {
            if (error === null && response.statusCode === 200) {
                const _c = cheerio.load(body)
                const aResultSet = _c('.inset .container .slzs ul li a')
                const aArr = aResultSet.map((index, element) => _c(element).attr('href')).get()
                resolve(aArr)
            } else {
                reject(response.statusCode)
            }
        })
    })
}
