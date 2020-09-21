const fs = require('fs')
const readline = require('readline')

fs.readdir('../backupResults', (err, directories) => {
    if (err) {
        console.error(err)
    }
    // 读取所有项目目录
    let infoArr = []
    directories.reduce((lastPromise, currentDir, index) => {
        return lastPromise.then(value => {
            return new Promise((resolve, reject) => {
                if (fs.statSync(`../backupResults/${currentDir}`).isDirectory()) {
                    let count = 0
                    let readContent = []
                    const rl = readline.createInterface({
                        input: fs.createReadStream(`../backupResults/${currentDir}/index.md`),
                        crlfDelay: Infinity
                    })
                    rl.on('line', (line) => {
                        if (count < 2) {
                            readContent.push(line)
                            count++
                        } else {
                            rl.close()
                        }
                    })
                    rl.on('close', () => {
                        const groupLine1 = readContent[0].match(/^#\s(.+)/)
                        const groupLine2 = readContent[1].match(/^-\s\*\*投票数\*\*：(\d+)$/)
                        const projectName = groupLine1[1]
                        const thumbCount = groupLine2[1]
                        const worksNumber = currentDir
                        infoArr.push({ projectName, thumbCount, worksNumber })
                        resolve(infoArr)
                    })
                } else {
                    resolve(currentDir)
                }
            })
        })
    }, Promise.resolve()).then(value => {
        // 创建目录，并写入
        let writeContent = '## 目录\n'
        infoArr.sort((a, b) => -(a.thumbCount - b.thumbCount))
        infoArr.forEach((projectInfo, index) => {
            const { projectName, worksNumber } = projectInfo
            writeContent += `${index + 1}. [${projectName}](../backupResults/${worksNumber}/index.md)\n`
        })
        fs.writeFileSync('../resource/backupCatalogue.md', writeContent)
    }).catch(reason => {
        console.error(reason)
    })
})