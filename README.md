# 留白 · Daily Me

单篇文章的静态 React 博客。正文位于 frontend/src/posts/，由 Vite 打包进网页。

## 本地预览

```powershell
npm.cmd ci --prefix frontend
npm.cmd run dev --prefix frontend -- --host 127.0.0.1
```

打开 Vite 输出的 Local 地址。运行 npm.cmd run build --prefix frontend 生成 frontend/dist。

## GitHub Pages

在仓库 Settings → Pages 中将 Source 设为 GitHub Actions。提交推送到 main 后，现有工作流会构建并部署 frontend/dist。
