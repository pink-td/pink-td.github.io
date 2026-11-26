import json
import os
from datetime import datetime, timezone
from hmac import compare_digest
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Annotated
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, StringConstraints

app = FastAPI()
posts_dir = Path(__file__).resolve().parents[1] / "frontend" / "src" / "posts"


class Draft(BaseModel):
    title: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]
    category: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=24)]
    summary: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=240)]
    body: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100000)]


def save_post(post):
    posts_dir.mkdir(parents=True, exist_ok=True)
    content = json.dumps(post, ensure_ascii=False, indent=2) + "\n"
    with NamedTemporaryFile(dir=posts_dir, delete=False) as file:
        temporary = Path(file.name)
        try:
            file.write(content.encode("utf-8"))
        except BaseException:
            file.close()
            temporary.unlink(missing_ok=True)
            raise
    try:
        temporary.replace(posts_dir / f"{post['id']}.json")
    finally:
        temporary.unlink(missing_ok=True)


@app.post("/api/posts", status_code=201)
def publish(draft: Draft, authorization: Annotated[str, Header()] = ""):
    token = os.environ.get("PUBLISH_TOKEN", "")
    if len(token) < 16:
        raise HTTPException(503, "Configure PUBLISH_TOKEN with at least 16 characters.")
    if not compare_digest(authorization.encode(), f"Bearer {token}".encode()):
        raise HTTPException(401, "Invalid publish token", headers={"WWW-Authenticate": "Bearer"})

    post = draft.model_dump() | {"id": uuid4().hex, "published_at": datetime.now(timezone.utc).isoformat()}
    save_post(post)
    return post
