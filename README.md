# 留白 · Daily Me

React、FastAPI 和 PostgreSQL 个人博客。设计与验收标准见 [SDD](docs/SDD.md)。

- frontend/ 存放 React 页面、样式和 Vite 配置。
- backend/ 存放 FastAPI 接口、数据库结构和 Python 依赖。
- compose.yaml 和 Dockerfile 用于本机启动。

## 启动博客

在仓库根目录运行：

```powershell
.\start-db.ps1
docker compose up -d --build
docker compose ps
```

浏览器访问 http://localhost:8000，发布页为 http://localhost:8000/write，API 文档为 http://localhost:8000/docs。
发布页的密钥是根目录 .env 中 PUBLISH_TOKEN 的值。若在新 checkout 中没有 .env，创建该文件并配置至少 16 字符的随机 ASCII 密钥。

Docker Desktop 中独立的 daily_me 容器映射本机 5435，Compose 管理的博客服务映射本机 8000。脚本沿用 daily_me_blog_data 数据卷。

## 本地开发

先在根目录运行 .\start-db.ps1。前端在 frontend/ 运行 npm install 和 npm run dev。后端在 backend/ 安装 requirements.txt，设置 PUBLISH_TOKEN 和 DATABASE_URL，再运行 python -m uvicorn main:app --reload。本机数据库地址为 postgresql://daily_me:local_daily_me@127.0.0.1:5435/daily_me。



### Docker Hub 拉取超时时

数据库容器保持运行。在项目根目录打开两个 PowerShell 终端。

后端终端：

```powershell
python -m pip install -r backend/requirements.txt
$env:DATABASE_URL = 'postgresql://daily_me:local_daily_me@127.0.0.1:5435/daily_me'
$env:PUBLISH_TOKEN = (Get-Content .env | Where-Object { $_ -match '^PUBLISH_TOKEN=' } | Select-Object -First 1) -replace '^PUBLISH_TOKEN=', ''
python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000
```

前端终端：

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

用浏览器打开 Vite 输出的 Local 地址（通常是 http://localhost:5173）。API 文档在 http://localhost:8000/docs。
