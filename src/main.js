const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

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

function parseWorksInfo(url) {
    return new Promise((resolve, reject) => {
        request(targetOrigin + url, function (error, response, body) {
            if (error === null && response.statusCode === 200) {
                const _c = cheerio.load(body)
                const mainContent = _c('#dowebok')
                const childrenContent = mainContent.find('div')
                const temp = childrenContent.map((index, element) => _c(element).attr('class')).get()
                resolve(temp)
            } else {
                reject(response.statusCode)
            }
        })
    })
}

getHrefList().then(value => {
    parseWorksInfo(value[0]).then(value => {
        console.log(value)
    })
})