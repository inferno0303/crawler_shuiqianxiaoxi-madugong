# 睡前消息文字稿爬虫

该程序是《睡前消息》文字稿的爬虫工具。

它的功能是从网站`https://doosho.com/cn/44`上抓取《睡前消息》的文字稿内容，并将提取的文字信息保存到名为`result.txt`的文件中。

```
仓库名称：shuiqianxiaoxi-madugong_crawler
版本：20230824
作者：@inferno0303
```

# 使用方法

```
npm install
node index.js
```

 # 依赖
 
 - jsdom

 # 更新历史

 ## 20230527

 - first commit

 ## 20230824

- fix: 修复了url被更改导致访问目录页404的故障
- fix: 修复了输出的文件有大量空行的问题
- refactor: 重写了index.js的部分注释
- refactor: 重写了.gitignore
- doc: 重写了README.md
