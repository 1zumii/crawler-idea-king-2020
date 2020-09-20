const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs-extra')

const targetOrigin = "https://www.idea-king.org"
const mainListUrl = "/mobile/tpxs.php?from=timeline"

function getHrefList() {
    return new Promise((resolve, reject) => {
        request(targetOrigin + mainListUrl, function (error, response, body) {
            if (error === null && response.statusCode === 200) {
                const _c = cheerio.load(body)
                // 好像不可以用css中的「>」儿子选择器
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
                // 主要爬取的部分
                const mainContent = _c('#dowebok')
                // 项目名称
                const projectName = mainContent.find('h2').text()
                // 点赞数
                const thumbCount = mainContent.find('.dsum span').text()
                // 作品编号
                const wn = mainContent.find('.wtt').get(0)
                const worksNumber = _c(wn).text().split('：')[1]
                // 需要遍历处理的部分，children 找所有的孩子节点，而不是使用 find 找所有的后代
                const childrenContent = mainContent.children('div')
                childrenContent.each((index, element) => {
                    if (_c(element).hasClass('wtt')) {
                        console.log(index, 'wtt')
                    } else if (_c(element).attr('style') === 'margin-top:10px;') {
                        console.log(index, 'style')
                    } else if (_c(element).hasClass('votett')) {
                        console.log(index, 'votett')
                    } else {
                        console.log(index, element.name)
                    }
                })

                resolve({ projectName, url, worksNumber })
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