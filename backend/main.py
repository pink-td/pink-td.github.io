import os
from contextlib import asynccontextmanager
from hmac import compare_digest
from pathlib import Path
from typing import Annotated

import psycopg
from fastapi import FastAPI, Header, HTTPException, Path as RoutePath, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from psycopg.rows import dict_row
from pydantic import BaseModel, StringConstraints


def connect():
    return psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row)


@asynccontextmanager
async def lifespan(app):
    key = os.environ["PUBLISH_TOKEN"]
    if len(key) < 16:
        raise RuntimeError("PUBLISH_TOKEN must contain at least 16 characters")
    with connect() as db:
        db.execute(Path(__file__).with_name("schema.sql").read_text(encoding="utf-8-sig"))
    yield


app = FastAPI(lifespan=lifespan)
metadata = "id, title, category, summary, published_at"


class Draft(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    category: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=24)]
    summary: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=240)]
    body: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100000)]


@app.get("/api/posts")
def list_posts(limit: Annotated[int, Query(ge=1, le=100)] = 20,
               offset: Annotated[int, Query(ge=0)] = 0):
    with connect() as db:
        return db.execute(
            f"SELECT {metadata} FROM posts ORDER BY published_at DESC, id DESC LIMIT %s OFFSET %s",
            (limit, offset),
        ).fetchall()


@app.get("/api/posts/{post_id}")
def read_post(post_id: Annotated[int, RoutePath(ge=1, le=9223372036854775807)]):
    with connect() as db:
        post = db.execute("SELECT * FROM posts WHERE id = %s", (post_id,)).fetchone()
    if post is None:
        raise HTTPException(404, "文章不存在")
    return post


@app.post("/api/posts", status_code=201)
def publish(draft: Draft, authorization: Annotated[str, Header()] = ""):
    expected = "Bearer " + os.environ["PUBLISH_TOKEN"]
    if not compare_digest(authorization.encode(), expected.encode()):
        raise HTTPException(401, "发布密钥无效", headers={"WWW-Authenticate": "Bearer"})
    with connect() as db:
        return db.execute(
            "INSERT INTO posts (title, category, summary, body) VALUES (%s, %s, %s, %s) RETURNING *",
            (draft.title, draft.category, draft.summary, draft.body),
        ).fetchone()


dist = Path(__file__).with_name("dist")
if dist.is_dir():
    app.mount("/assets", StaticFiles(directory=dist / "assets"), name="assets")

    @app.get("/", include_in_schema=False)
    @app.get("/write", include_in_schema=False)
    @app.get("/posts/{post_id}", include_in_schema=False)
    def frontend():
        return FileResponse(dist / "index.html")

