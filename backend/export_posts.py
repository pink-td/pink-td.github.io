import os

import psycopg
from psycopg.rows import dict_row

from main import posts_dir, save_post


def migrate():
    count = 0
    with psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row) as db:
        for post in db.execute("SELECT id, title, category, summary, body, published_at FROM posts"):
            if (posts_dir / f"{post['id']}.json").exists():
                continue
            post["published_at"] = post["published_at"].isoformat()
            save_post(post)
            count += 1
    print(f"Exported {count} posts.")


if __name__ == "__main__":
    migrate()
