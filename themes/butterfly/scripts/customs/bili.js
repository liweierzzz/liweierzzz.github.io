const logger = require('hexo-log')()
const fs = require('hexo-fs')
const fetch = require('node-fetch')
const config = hexo.config.bilibili || hexo.config.theme_config.bilibili

const options = {
    options: [
        {name: '-u, --update', desc: 'Update data'},
        {name: '-d, --delete', desc: 'Delete data'}
    ]
}

hexo.extend.console.register('bangumi', '番剧JSON文件的相关操作', options, async args => {
    if (!config?.enable) return
    const root = `${hexo.config.source_dir}/bilibili/`
    const amount = 50   //每个文件内番剧的数量
    const writeConfig = json => {
        const result = {
            amount,     // 每个文件的最大数据量
            size: {},   // 各个分类的番剧数量
            tags: []    // 分类列表
        }
        for (let jsonKey in json) {
            const list = json[jsonKey]
            result.size[jsonKey] = list.length
            for (let it of list) {
                const tags = it.tags ?? []
                for (let tag of tags) {
                    if (result.tags.includes(tag)) continue
                    result.tags.push(tag)
                }
            }
        }
        fs.writeFile(`${root}config.json`, JSON.stringify(result))
    }
    if (args.u || args.update) {
        const historyPath = `${root}all.json`
        let history = fs.existsSync(historyPath) ? JSON.parse(fs.readFileSync(historyPath)) : {}
        const json = await buildJson(history)
        fs.writeFile(historyPath, JSON.stringify(json))
        writeConfig(json)
        for (let key in json) {
            const sonRoot = `${root}${key}/`
            const value = json[key]
            const objs = Object.keys(value)
            const page = Math.ceil(objs.length / amount)
            for (let i = 0; i !== page; ++i) {
                const start = i * 50
                const end = Math.min(start + amount, objs.length)
                const data = {}
                for (let k = start; k !== end; ++k) {
                    const sonKey = objs[k]
                    data[sonKey] = value[sonKey]
                }
                fs.writeFile(`${sonRoot}${i}.json`, JSON.stringify(data))
            }
        }
        logger.info("成功生成JSON文件")
    } else if (args.d || args.delete) {
        const arg = args.d || args.delete
        if (typeof arg === "string") {
            const [...deletes] = args._
            deletes.push(arg)
            const historyPath = `${root}all.json`
            if (!fs.existsSync(historyPath)) {
                logger.info('文件不存在，跳过删除')
                return
            }
            let count = 0
            const history = JSON.parse(fs.readFileSync(historyPath))
            for (let key in history) {
                const list = history[key]
                for (let i = 0; i < list.length; i++) {
                    const title = list[i].title
                    if (deletes.includes(title)) {
                        list.splice(i--, 1)
                        ++count
                    }
                }
            }
            fs.writeFileSync(historyPath, JSON.stringify(history), 'utf-8')
            logger.info(`成功移除 ${count} 条数据`)
        } else if (fs.existsSync(root)) {
            fs.deleteFile(root)
            logger.info("成功删除JSON文件")
        } else logger.info('文件不存在，逃过删除')
    }
})

async function buildJson(history) {
    const readJson = async (json, list) => {
        for (let element of json) list.push(element)
    }
    const data = {
        vmid: config.vmid,
        extra: config.extra || 'extra_bangumis'
    }
    const wantWatch = await getBiliJson(data.vmid, 1)
    const watching = await getBiliJson(data.vmid, 2)
    const watched = await getBiliJson(data.vmid, 3)
    const extraPath = `${hexo.config.source_dir}/_data/${data.extra}.json`
    if (fs.existsSync(extraPath)) {
        const extra = JSON.parse(fs.readFileSync(extraPath))
        for (let key in extra) {
            switch (key) {
                case 'watchedExtra':
                case 'watched':
                    await readJson(extra[key], watched)
                    break
                case 'watchingExtra':
                case 'watching':
                    await readJson(extra[key], watching)
                    break
                case 'wantWatchExtra':
                case 'wantWatch':
                    await readJson(extra[key], wantWatch)
                    break
            }
        }
    }
    const sort = (array, history) => {
        const list = array.filter(it => {
            if (!history) return true
            for (let i = 0; i < history.length; i++) {
                const value = history[i]
                if (value.title === it.title) {
                    history[i] = it
                    return false
                }
            }
            return true
        })
        return [...mergeSort(list), ...(history ?? [])]
    }
    const locks = config.locks
    const info = {
        wantWatch: sort(wantWatch, locks.wantLock ? history.wantWatch : null),
        watching: sort(watching, locks.ingLock ? history.watching : null),
        watched: sort(watched, locks.edLock ? history.watched : null)
    }
    const sum = info.watching.length + info.watched.length + info.wantWatch.length
    logger.info(`wantWatch(${info.wantWatch.length}) + watching(${info.watching.length}) + watched(${info.watched.length}) = ${sum}`)
    return info
}

// eslint-disable-next-line no-nested-ternary
const count = (e) =>  (e ? (e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e) : '-')

const getDataPage = (vmid, status) =>
    fetch(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`)
        .then(it => {
            if (it.ok) return it.json()
            else return null
        })
        .then(json => {
            if (!json) return {success: false}
            if (json.code === 0 && json.message === '0' && json.data && json.data?.total !== undefined) {
                return {success: true, data: Math.ceil(json.data.total / 30) + 1}
            } else if (json.message !== '0') {
                return {success: false, data: json.message}
            } else {
                return {success: false, data: json}
            }
        })

// kmar edit point
const getData = async (vmid, status, pn) =>
    fetch(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=30&pn=${pn}`)
        .then(it => {
            if (it.ok) return it.json()
            else return null
        })
        .then(json => {
            const result = []
            if (!json) return result
            if (json.code === 0) {
                const data = json.data
                const list = data?.list || []

                for (const bangumi of list) {
                    let cover = bangumi?.cover
                    if (cover) {
                        const href = new URL(cover)
                        href.protocol = 'https'
                        cover = href.href
                        if (cover.startsWith('https://i0.hdslb.com/bfs/bangumi/')) {
                            cover = cover.substring(33)
                        }
                    }
                    result.push({
                        title: bangumi?.title,
                        type: bangumi?.season_type_name,
                        area: bangumi?.areas?.[0]?.name,
                        cover,
                        id: bangumi?.media_id,
                        follow: count(bangumi?.stat?.follow),
                        view: count(bangumi?.stat?.view),
                        danmaku: count(bangumi?.stat?.danmaku),
                        coin: count(bangumi.stat.coin),
                        score: bangumi?.rating?.score ?? '-',
                        tags: bangumi?.styles
                    })
                }
                return result
            }
        })

async function getBiliJson(vmid, status) {
    const page = await getDataPage(vmid, status)
    if (page?.success) {
        const list = []
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < page.data; i++) {
            const data = await getData(vmid, status, i)
            list.push(...data)
        }
        for (let i = 0; i < list.length; i++)
            list[i].index = list.length - i
        return list
    }
    return []
}

function mergeSort(array) {
    function merge(left, right) {
        let arr = []
        while (left.length && right.length) {
            arr.push(left[0].index > right[0].index ? left.shift() : right.shift())
        }
        return [...arr, ...left, ...right]
    }

    const half = array.length / 2
    if (array.length < 2) return array
    const left = array.splice(0, half)
    return merge(mergeSort(left), mergeSort(array))
}
