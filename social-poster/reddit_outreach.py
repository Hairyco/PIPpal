#!/usr/bin/env python3
"""
Find UK PIP help threads on Reddit, draft helpful comments, post only after you approve.

This is intentionally NOT fully automated — Reddit treats unsolicited promo comments as spam.

Setup:
  1. Copy .env.example to .env and fill Reddit + Anthropic keys.
  2. pip install -r requirements.txt
  3. python reddit_outreach.py scan          # find new threads
  4. python reddit_outreach.py draft         # write comment drafts (Claude)
  5. python reddit_outreach.py list          # review queue
  6. python reddit_outreach.py post --id abc # post ONE approved comment
  7. python reddit_outreach.py post --id abc --dry-run

Optional: python reddit_outreach.py run      # scan + draft in one step
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

QUEUE_PATH = Path(__file__).with_name("reddit_queue.json")

DEFAULT_SUBREDDITS = [
    "UKPersonalFinance",
    "Benefits",
    "LegalAdviceUK",
    "unitedkingdom",
    "ChronicIllness",
    "AutismInWomen",
    "ADHD",
]

SEARCH_QUERIES = [
    "PIP help",
    "PIP claim",
    "PIP form",
    "personal independence payment",
    "PIP assessment",
    "PIP rejected",
    "PIP appeal",
    "DWP PIP",
]

PIP_TITLE = re.compile(
    r"\b(pip|personal independence payment|dwp|disability benefit|pip2|pip form|pip assessment|pip appeal|pip tribunal)\b",
    re.I,
)


def require_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {name}")
    return value


def load_queue() -> dict:
    if not QUEUE_PATH.exists():
        return {"posts": {}, "last_posted_at": None}
    return json.loads(QUEUE_PATH.read_text(encoding="utf-8"))


def save_queue(data: dict) -> None:
    QUEUE_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")


def reddit_client():
    import praw

    return praw.Reddit(
        client_id=require_env("REDDIT_CLIENT_ID"),
        client_secret=require_env("REDDIT_CLIENT_SECRET"),
        username=require_env("REDDIT_USERNAME"),
        password=require_env("REDDIT_PASSWORD"),
        user_agent=os.getenv("REDDIT_USER_AGENT", "pippal-outreach/1.0"),
    )


def is_relevant_submission(submission) -> bool:
    if submission.stickied or submission.locked:
        return False
    if getattr(submission, "over_18", False):
        return False
    haystack = f"{submission.title}\n{getattr(submission, 'selftext', '') or ''}"
    return bool(PIP_TITLE.search(haystack))


def already_commented(reddit, submission) -> bool:
    me = reddit.user.me().name
    submission.comments.replace_more(limit=0)
    for comment in submission.comments.list():
        if getattr(comment, "author", None) and comment.author and comment.author.name == me:
            return True
    return False


def scan_posts(limit_per_query: int = 15) -> int:
    reddit = reddit_client()
    queue = load_queue()
    subreddits = [
        s.strip()
        for s in os.getenv("REDDIT_SCAN_SUBREDDITS", ",".join(DEFAULT_SUBREDDITS)).split(",")
        if s.strip()
    ]
    time_filter = os.getenv("REDDIT_SCAN_TIME", "week")
    added = 0

    seen_ids: set[str] = set(queue["posts"].keys())

    for sub_name in subreddits:
        subreddit = reddit.subreddit(sub_name)
        for query in SEARCH_QUERIES:
            try:
                results = subreddit.search(query, sort="new", time_filter=time_filter, limit=limit_per_query)
            except Exception as exc:
                print(f"[WARN] Search failed r/{sub_name} '{query}': {exc}", file=sys.stderr)
                continue

            for submission in results:
                post_id = submission.id
                if post_id in seen_ids:
                    continue
                if not is_relevant_submission(submission):
                    continue
                if already_commented(reddit, submission):
                    continue

                seen_ids.add(post_id)
                queue["posts"][post_id] = {
                    "id": post_id,
                    "title": submission.title,
                    "selftext": (submission.selftext or "")[:4000],
                    "url": f"https://reddit.com{submission.permalink}",
                    "subreddit": str(submission.subreddit),
                    "created_utc": submission.created_utc,
                    "status": "pending",
                    "draft_comment": "",
                    "comment_url": "",
                    "found_at": datetime.now(timezone.utc).isoformat(),
                }
                added += 1
                print(f"[NEW] r/{submission.subreddit}: {submission.title[:90]}")

    save_queue(queue)
    print(f"\nScan complete — {added} new thread(s). Queue: {len(queue['posts'])} total.")
    return added


def draft_comment(post: dict) -> str:
    api_key = require_env("ANTHROPIC_API_KEY")
    site = os.getenv("PIPPAL_SITE_URL", "https://www.pippal.uk").strip()

    prompt = f"""You write Reddit comments for someone who genuinely helps UK PIP claimants.

Thread title: {post['title']}
Subreddit: r/{post['subreddit']}
Post body:
{(post.get('selftext') or '(no body)')[:2500]}

Write ONE Reddit comment (plain text, no markdown code fences).

Rules:
- Be genuinely helpful first — practical PIP advice for their situation
- Warm, human UK tone — not corporate or salesy
- You may mention they built a free tool called PIPpal ({site}) ONLY if it fits naturally — max one brief mention
- If mentioning PIPpal, be transparent: "I built a free tool that..." not "check out this amazing app"
- No invented success rates or guaranteed outcomes
- No price talk
- 80–180 words
- Do not use ** bold (Reddit markdown is ok sparingly)
- Do not start with "As an AI"
- End naturally — no "hope this helps!" cliché unless it fits

Output only the comment text."""

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
        json={
            "model": os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001"),
            "max_tokens": 500,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=60,
    )
    body = response.json()
    if not response.ok:
        message = body.get("error", {}).get("message") or response.text
        raise RuntimeError(f"Claude API error: {message}")

    text = body.get("content", [{}])[0].get("text", "").strip()
    if not text:
        raise RuntimeError("Empty draft from Claude")
    return text


def draft_pending() -> int:
    queue = load_queue()
    drafted = 0
    for post_id, post in queue["posts"].items():
        if post.get("status") != "pending":
            continue
        try:
            post["draft_comment"] = draft_comment(post)
            post["status"] = "drafted"
            post["drafted_at"] = datetime.now(timezone.utc).isoformat()
            drafted += 1
            print(f"[DRAFT] {post_id}: {post['title'][:70]}")
            time.sleep(1.2)
        except Exception as exc:
            print(f"[FAIL]  {post_id}: {exc}", file=sys.stderr)
    save_queue(queue)
    print(f"\nDrafted {drafted} comment(s).")
    return drafted


def list_queue(status_filter: str | None = None) -> None:
    queue = load_queue()
    posts = list(queue["posts"].values())
    posts.sort(key=lambda p: p.get("found_at", ""), reverse=True)

    if status_filter:
        posts = [p for p in posts if p.get("status") == status_filter]

    if not posts:
        print("Queue is empty. Run: python reddit_outreach.py scan")
        return

    for post in posts:
        print("-" * 72)
        print(f"ID:         {post['id']}")
        print(f"Status:     {post.get('status')}")
        print(f"Subreddit:  r/{post.get('subreddit')}")
        print(f"Title:      {post.get('title')}")
        print(f"URL:        {post.get('url')}")
        if post.get("draft_comment"):
            print("Draft comment:")
            print(post["draft_comment"])
            print()
        if post.get("comment_url"):
            print(f"Posted:     {post['comment_url']}")


def enforce_rate_limit(queue: dict) -> None:
    min_hours = float(os.getenv("REDDIT_MIN_HOURS_BETWEEN", "4"))
    last = queue.get("last_posted_at")
    if not last:
        return
    last_dt = datetime.fromisoformat(last)
    elapsed_hours = (datetime.now(timezone.utc) - last_dt).total_seconds() / 3600
    if elapsed_hours < min_hours:
        wait = min_hours - elapsed_hours
        raise RuntimeError(
            f"Rate limit: wait {wait:.1f}h before next comment (REDDIT_MIN_HOURS_BETWEEN={min_hours})."
        )


def post_comment(post_id: str, dry_run: bool = False, edit_text: str | None = None) -> None:
    queue = load_queue()
    post = queue["posts"].get(post_id)
    if not post:
        raise ValueError(f"Unknown post id: {post_id}")

    if post.get("status") == "posted":
        print(f"Already posted: {post.get('comment_url')}")
        return

    comment = (edit_text or post.get("draft_comment") or "").strip()
    if not comment:
        raise ValueError("No draft comment — run draft first or pass --text")

    print(f"Thread: r/{post['subreddit']} — {post['title']}\n")
    print("Comment to post:")
    print(comment)
    print()

    if dry_run:
        print("[DRY RUN] Not posting.")
        return

    enforce_rate_limit(queue)

    reddit = reddit_client()
    submission = reddit.submission(id=post_id)
    if already_commented(reddit, submission):
        post["status"] = "skipped"
        post["skipped_reason"] = "already_commented"
        save_queue(queue)
        print("You already commented on this thread — skipped.")
        return

    reply = submission.reply(comment)
    post["status"] = "posted"
    post["comment_url"] = f"https://reddit.com{reply.permalink}"
    post["posted_at"] = datetime.now(timezone.utc).isoformat()
    if edit_text:
        post["draft_comment"] = comment
    queue["last_posted_at"] = post["posted_at"]
    save_queue(queue)
    print(f"[POSTED] {post['comment_url']}")


def skip_post(post_id: str) -> None:
    queue = load_queue()
    post = queue["posts"].get(post_id)
    if not post:
        raise ValueError(f"Unknown post id: {post_id}")
    post["status"] = "skipped"
    save_queue(queue)
    print(f"Skipped {post_id}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Reddit PIP outreach assistant (approve before posting).")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("scan", help="Find new PIP help threads")
    sub.add_parser("draft", help="Draft comments for pending threads")
    sub.add_parser("run", help="scan + draft")

    list_parser = sub.add_parser("list", help="Show queue")
    list_parser.add_argument("--status", choices=["pending", "drafted", "posted", "skipped"])

    post_parser = sub.add_parser("post", help="Post an approved comment")
    post_parser.add_argument("--id", required=True, help="Reddit submission id from list")
    post_parser.add_argument("--text", help="Override draft comment text")
    post_parser.add_argument("--dry-run", action="store_true")

    skip_parser = sub.add_parser("skip", help="Skip a thread")
    skip_parser.add_argument("--id", required=True)

    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command == "scan":
            scan_posts()
        elif args.command == "draft":
            draft_pending()
        elif args.command == "run":
            scan_posts()
            draft_pending()
        elif args.command == "list":
            list_queue(args.status)
        elif args.command == "post":
            post_comment(args.id, dry_run=args.dry_run, edit_text=args.text)
        elif args.command == "skip":
            skip_post(args.id)
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
