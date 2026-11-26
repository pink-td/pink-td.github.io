# daily me

个人博客使用 Vite 构建。文章的标题、摘要和 Markdown 全文保存在 `frontend/src/posts/*.json`，随前端一起发布到 GitHub Pages。访客可直接打开文章链接并刷新页面。

## 在本地发布文章

在项目根目录运行 `docker compose up -d --build`。发布服务使用根目录 `.env` 中的 `PUBLISH_TOKEN`，请设置至少 16 个字符的随机密钥。

打开 http://127.0.0.1:8000/docs，在 POST /api/posts 的 Try it out 中填写标题、分类、摘要和 Markdown 正文。Authorization 字段填写 Bearer 加空格和发布密钥。上传成功后，文章文件会出现在前端源码目录。

将新生成的 `frontend/src/posts/*.json` 提交到 `main`，推送到 GitHub Pages 仓库。现有的 Pages 工作流会重新构建并更新网站。

```powershell
git add frontend/src/posts
git commit -m "发布博客文章"
git push pages main
```

也可以使用 VS Code 的源代码管理界面提交和推送。文章图片可放在 `frontend/public/images/`，Markdown 里用 `/images/文件名` 引用，并与文章一起提交。

## 导出旧数据库中的文章

如果旧 PostgreSQL 数据库里已有文章，先保持旧数据库运行，在根目录执行以下命令。已有的同 ID 文件会保留。

```powershell
python -m pip install -r backend/requirements.txt
$env:DATABASE_URL = 'postgresql://daily_me:local_daily_me@127.0.0.1:5435/daily_me'
python backend/export_posts.py
```

导出后检查文章，再把生成的 JSON 一起提交。旧文章的静态链接格式为 `/?post=原文章ID`。

## 绑定自定义域名

1. 打开 [仓库的 Pages 设置](https://github.com/pink-td/pink-td.github.io/settings/pages)，在 **Custom domain** 输入你的域名并保存。只填域名，例如 `blog.example.com`。
2. 到域名的 DNS 管理页面添加记录。子域名使用 CNAME，主机记录填 `blog` 或 `www`，目标填 `pink-td.github.io`。根域名使用四条 A 记录，主机记录均为 `@`，分别指向 `185.199.108.153`、`185.199.109.153`、`185.199.110.153` 和 `185.199.111.153`。
3. DNS 检查通过且证书就绪后，在 Pages 设置勾选 **Enforce HTTPS**。

[GitHub 官方自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
