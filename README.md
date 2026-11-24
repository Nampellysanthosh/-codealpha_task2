# Connect

Connect is a beginner-friendly mini social media platform built with Python, Django, Django REST Framework, SQLite, HTML, CSS, and Vanilla JavaScript.

## Features

- User registration and session login
- User profiles and follow/unfollow
- Post creation and deletion
- Comments and unique likes
- Search results and a chronological feed
- Responsive desktop and mobile layouts

## Project structure

```text
socialmediaplatform/
├── connect/                  # Django project settings and URL routing
│   ├── api_urls.py           # REST API routes
│   ├── settings.py           # Installed apps, database, static/media settings
│   ├── urls.py               # Main website routes
│   ├── asgi.py
│   └── wsgi.py
├── pages/                    # Views and tests for website pages
├── posts/                    # Posts, comments, likes, and their API
│   └── migrations/           # Database changes for posts
├── users/                    # Profiles, follows, authentication, and their API
│   └── migrations/           # Database changes for users
├── templates/                # Django HTML templates
│   ├── base.html             # Shared page layout
│   ├── landing.html
│   ├── login.html
│   ├── register.html
│   ├── home.html
│   ├── profile.html
│   ├── search.html
│   └── section.html
├── static/
│   ├── css/main.css          # Shared styles and responsive layouts
│   └── js/main.js            # Browser interactions and Fetch API calls
├── media/                    # Uploaded images (created when needed)
├── manage.py                 # Django command-line entry point
├── requirements.txt          # Python package dependencies
├── README.md
└── COLLEGE_DEMO.md           # Project and viva demonstration guide
```

`db.sqlite3` and `.venv/` are created locally during setup and are not source-code folders.

## Setup

From the project folder in PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

With the development server running, open [Connect](http://127.0.0.1:8000/) in your browser. The link only works while `python manage.py runserver` is running on your computer.

For deployment, set the `DJANGO_SECRET_KEY` environment variable to a private key. Do not commit production secrets to GitHub.

## Test

```powershell
python manage.py test users posts
```

## Main URLs

- `/` - Landing page
- `/register/` - Registration
- `/login/` - Login
- `/home/` - Feed
- `/search/` - User search
- `/profiles/<username>/` - User profile
- `/notifications/`, `/messages/`, `/saved/` - Navigation pages; these features are not implemented yet
- `/admin/` - Django administration

## API overview

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET/PATCH /api/profiles/me/`
- `GET /api/profiles/?search=<text>`
- `POST /api/profiles/<id>/follow/`
- `GET/POST /api/posts/?feed=true`
- `PATCH/DELETE /api/posts/<id>/`
- `POST /api/posts/<id>/like/`
- `GET/POST /api/comments/`
- `PATCH/DELETE /api/comments/<id>/`
