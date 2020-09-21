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

                // 创建文件及文件夹
                const currentRootPath = `../backupResults/${worksNumber}`
                fs.emptyDir(currentRootPath, err => {
                    if (err) {
                        reject(err)
                        return
                    }
                    // 需要写入的内容
                    let writeContent = `# ${projectName} \n`
                    writeContent += `- **投票数**：${thumbCount}\n`
                    // 需要遍历处理的部分，children 找所有的孩子节点，而不是使用 find 找所有的后代
                    const childrenContent = mainContent.children('div')
                    childrenContent.each((index, element) => {
                        const cheerElement = _c(element)
                        if (cheerElement.hasClass('wtt')) {
                            const unorderedListItem = cheerElement.text().split('：')
                            writeContent += `- **${unorderedListItem[0]}**：${unorderedListItem[1]}\n`
                        } else if (cheerElement.attr('style') === 'margin-top:10px;') {
                            const illustrationSrc = _c(cheerElement.children('.picvj')).attr('data-original')
                            const illustrationAlt = _c(cheerElement.children('p').get(0)).text()
                            const paragraphContent = _c(cheerElement.children('p').get(1)).text()

                            // 爬取图片
                            const matchGroup = illustrationSrc.match(/\/(\w+\.(jpg|png))/)
                            if (matchGroup) {
                                request(targetOrigin + illustrationSrc).pipe(
                                    fs.createWriteStream(`${currentRootPath}/${matchGroup[1]}`)
                                )
                                writeContent += `\n![${illustrationAlt}](${matchGroup[1]})\n`
                            }
                            writeContent += `\n${paragraphContent}\n`
                        } else if (cheerElement.hasClass('votett')) {
                            const paragraphTitle2 = cheerElement.children('.tt').text()
                            const paragraphContent = cheerElement.children('div').text()
                            writeContent += `## ${paragraphTitle2}\n`
                            writeContent += `\n${paragraphContent}\n`
                        }
                    })
                    // 写入文件
                    // fs.writeFile 直接打开文件默认是 w 模式，所以如果文件存在，该方法写入的内容会覆盖旧的文件内容。
                    fs.writeFileSync(`${currentRootPath}/index.md`, writeContent)
                })

                resolve({ projectName, url, worksNumber })
            } else {
                reject(response.statusCode)
            }
        })
    })
}

getHrefList().then(value => {
    const temp = value.slice(0, 20)
    temp.reduce((lastPromise, currentHref, index) => {
        return lastPromise.then(lastResult => {
            if (typeof (lastResult) === 'number') {
                console.log('>>> start script')
            } else {
                const { projectName, url, worksNumber } = lastResult
                console.log(`[${index}/${temp.length}]\t${worksNumber}\t${projectName}`)
            }
            return parseWorksInfo(currentHref)
        })
    }, Promise.resolve(temp.length)).then(lastResult => {
        const { projectName, url, worksNumber } = lastResult
        console.log(`[${temp.length}/${temp.length}]\t${worksNumber}\t${projectName}`)
    })
})