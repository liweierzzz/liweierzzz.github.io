---
title: hexo常用的指令
description: "\U0001F967本文汇总hexo一般经常使用的命令，可作为文档进行查询"
mathjax: true
tags:
  - hexo
  - 经验分享
categories:
  - 编程经验
keywords: 命令 经验
sticky: 2
swiper_index: 2
abbrlink: 982fc2c9
date: 2024-07-07 16:14:03
updated:
---

# hexo常用命令

我一般来说就经常用的就是 

- hexo clean && hexo generate && hexo s 
- hexo d 部署上线



## 1. 文章的书写

```cmd
hexo new [layout] <title>
```

eg: `hexo new "post title with whitespace"` 其中 layout为_config.yml中的默认参数值。

- `-p --path` 自定义新文章
- `-r --replace` 存在同名文章，替换
- `-s --slug` 文章的slug，作为新文章的文件名和发布后的URL

## 2. 生成静态文件

```
hexo generate` 或 `hexo g
```

- `-d 或--deploy` 文件生成后部署网站
- `-w 或--watch` 监视文件变动
- `-b 或--bail` 生成过程中出现异常则抛出。
- `-f 或--force` 强制重新生成文件
- `-c 或--concurrency` 最大同时生成文件数量，默认无限制。

## 3. 发布草稿

```
hexo publish [layout] <filename>
```

## 4.启动服务器

```
hexo server` 启动服务器，ctrl+c 结束，默认地址为：`http://localhost:4000/
```

## 5.部署网站

```
hexo deploy` 或`hexo d
```

- `-g 或--generate` 部署之前写成静态文件

## 6.渲染文件

```
hexo render <file1> [file2]
```

- `-o或--output` 设置输出路径

## 7. 清除缓存文件

```
hexo clean
```

## 8. 列出网站资料

```
hexo list <type>
```

## 9. 显示草稿

```
hexo --deaft
```

## 10. 自定义当前工作目录

```
hexo --cwd /path/to/cwd
```
