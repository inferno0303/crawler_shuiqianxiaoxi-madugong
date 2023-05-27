/*
    This node.js program is used to achieve crawling web content, and store txt text files.
    author: inferno0303
    version: 1.0.0
*/

const { JSDOM } = require('jsdom');
const fs = require('fs');

const BASEURL = "https://doosho.com/";
const REQUEST_INTERVAL = 200; // ms


async function fetchUrlList() {
    const url = `${BASEURL}_next/data/ioW0RaaxVs9fpl-uF3Aav/zh-CN/cn/44.json`;
    const response = await fetch(url, { method: "GET", mode: "cors" });
    if (!response.ok) {
        throw new Error('请求失败');
    }
    const data = await response.json();
    const list = data?.pageProps?.bookjson?.child;
    const temp = [];

    list?.forEach((item) => {
        item?.child?.forEach((nestedItem) => {
            nestedItem?.child?.forEach((value) => {
                temp.push(value);
            });
        });
    });

    const result = [];
    temp.forEach(value => {
        result.push({
            url: BASEURL + (value?.slug ?? ""),
            title: value?.title ?? "",
        });

        value?.child?.forEach((nestedValue) => {
            result.push({
                url: BASEURL + (nestedValue?.slug ?? ""),
                title: (value?.title || "") + (nestedValue?.title || ""),
            });
        });
    });
    return result;
}

async function* fetchDetailHTML(urlList) {
    for (let index = 0; index < urlList.length; index++) {
        const value = urlList[index];
        const response = await fetch(value?.url, { method: "GET", mode: "cors" });
        console.log(value, index, response.ok);
        const text = await response.text();
        yield text;
    }
}

async function parseHTML(htmlString) {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;
    // 选取artical标签的内容
    const artical = document.querySelector("article");
    /* 掐头，删除h1标签之前的所有标签 */
    // 获取所有的 <h1> 标签
    const h1Elements = artical.getElementsByTagName('h1');
    // 遍历 <h1> 标签，删除前面的内容
    for (let i = 0; i < h1Elements.length; i++) {
        const h1Element = h1Elements[i];
        let previousSibling = h1Element.previousSibling;
        while (previousSibling) {
            const currentSibling = previousSibling;
            previousSibling = currentSibling.previousSibling;
            currentSibling.parentNode.removeChild(currentSibling);
        }
    }
    /* 去尾，删除hr标签后的所有内容 */
    // 获取所有的 <hr> 标签
    const hrElements = artical.getElementsByTagName('hr');
    // 遍历 <hr> 标签，删除后面的内容
    for (let i = 0; i < hrElements.length; i++) {
        const hrElement = hrElements[i];
        let nextSibling = hrElement.nextSibling;
        while (nextSibling) {
            const currentSibling = nextSibling;
            nextSibling = currentSibling.nextSibling;
            currentSibling.parentNode.removeChild(currentSibling);
        }
    }
    return artical.textContent;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 构建日期时间字符串 YYYY-MM-DD HH:mm:ss
function getCurrentDateTimeString() {
    // 创建一个新的Date对象，表示当前日期和时间
    var currentDate = new Date();

    // 获取年、月、日、小时、分钟和秒
    var year = currentDate.getFullYear();
    var month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // 注意月份从0开始，需要加1
    var day = ("0" + currentDate.getDate()).slice(-2);
    var hours = ("0" + currentDate.getHours()).slice(-2);
    var minutes = ("0" + currentDate.getMinutes()).slice(-2);
    var seconds = ("0" + currentDate.getSeconds()).slice(-2);

    var currentDateTimeString = year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;

    return currentDateTimeString;
}

async function main() {
    // 要写入的文件
    const filePath = 'result.txt';
    // 检查文件是否存在
    const isFileExist = await new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, err => {
            if (err) {
                // 如果没有这个文件
                resolve(false);
            } else {
                // 如果存在这个文件
                resolve(true);
            }
        });
    })
    if (isFileExist) {
        // 如果文件存在，那就删除这个文件
        await new Promise((resolve, reject) => {
            fs.unlink(filePath, (err) => {
                if (err) reject(err);
                else resolve()
            })
        })
    }
    // 写入日期时间字符串到文件头部
    await new Promise((resolve, reject) => {
        fs.appendFile(filePath, `================${getCurrentDateTimeString()}================`, (err) => {
            if (err) reject(err);
            else resolve();
        })
    })
    // 获取目录页列表
    const urlList = await fetchUrlList();
    // 获取详情页HTML
    const detailHTML = fetchDetailHTML(urlList);
    // 使用迭代器逐个处理结果
    let iterator = await detailHTML.next()
    while (!iterator.done) {
        const html = iterator.value;
        // 解析HTML
        const text = await parseHTML(html);
        // 追加写入文件
        await new Promise((resolve, reject) => {
            fs.appendFile(filePath, `\n\n=====================================\n\n` + text, (err) => {
                if (err) reject(err);
                else {
                    console.log("write text content to file -> ", text);
                    resolve();
                };
            })
        })
        await delay(REQUEST_INTERVAL);
        // 迭代下一个
        iterator = await detailHTML.next();
    }
}

// 程序从这里开始运行
main().then(null).catch(err => {
    console.log("main.catch(err) -> ", err);
    throw err;
});
