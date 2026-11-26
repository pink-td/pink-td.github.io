# SDD · 留白 / Daily Me

## 目标
访客可以浏览最新文章、按分类筛选并打开独立阅读链接。站主可以在 /write 输入标题、分类、摘要与 Markdown 正文，也可导入 UTF-8 Markdown 文件，预览后用发布密钥提交。发布成功立即跳转至公开文章。

## 设计
以白色和冷灰为基底，深墨色标题，浮动导航使用半透明玻璃、模糊和高光。首页用一张抽象封面建立视觉焦点，下方用留白和细线组织文章。阅读页采用窄栏，移动端折为单列。提供键盘焦点和加载、空列表、失败反馈。
参考 [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)。

## 技术与接口
React + Vite 构建，FastAPI 托管前端并提供同源 JSON API，PostgreSQL 持久化。Docker Compose 启动应用和数据库。Sites 托管的静态文件与 Worker 运行时无法直接运行此 FastAPI 服务，本项目交付为本地容器工程。

- GET /api/posts 返回按时间和 ID 倒序排列的摘要，支持 limit 和 offset。
- GET /api/posts/{id} 返回文章正文，缺失返回 404。
- POST /api/posts 使用 Authorization: Bearer 发布密钥，成功返回 201，凭证无效返回 401，字段不合法返回 422。
- posts 存储数字主键、标题、分类、摘要、正文、发布时间。数据库使用持久卷。首次初始化带三篇示例。
- 密钥通过服务端环境变量提供，浏览器仅在提交时发送。Markdown 渲染禁用 HTML。

## 验收
首页能读取列表，筛选可切换，文章链接可刷新。编辑器能导入文件与预览。错误密钥无权写入，合法提交能跳转正文且刷新后可读。窄屏能完成阅读与发布。
