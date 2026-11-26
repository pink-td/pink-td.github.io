# SDD · 留白 / Daily Me

## 范围

React 单页博客，首页展示一篇 Markdown 文章，支持章节目录和回到顶部。文章源文件随前端版本管理。

## 界面

白底黑字，以正文、标题和留白建立层级。桌面端左侧为目录，移动端目录位于正文之前。代码块可横向滚动。

## 构建与验收

Vite 将 Markdown 和 React 打包到 frontend/dist，资源使用相对路径。GitHub Actions 部署构建产物到 GitHub Pages。验收包括静态构建、首页访问、原文展示和目录锚点。
