# Connect College Demonstration Guide

## 1. Database explanation

The Django `auth.User` model stores login information securely. `UserProfile` stores extra profile details with a one-to-one relationship. `Post` belongs to one author. `Comment` belongs to a post and an author. `Like` connects one user to one post. `Follow` connects a follower to a following user.

Unique constraints prevent duplicate likes and duplicate follow relationships. The follow model also prevents self-following.

## 2. System architecture

Browser HTML, CSS, and JavaScript communicate with Django REST Framework through the Fetch API. DRF validates requests and reads or writes SQLite through Django models. Django session authentication keeps the logged-in user on the server.

## 3. Demonstration flow

1. Open the landing page.
2. Register a new account.
3. Log out and log in again.
4. Open the feed and create a post.
5. Add a comment and toggle a like.
6. Search for another user and follow them.
7. Open the Django admin to show stored database records.

## 4. Viva questions

**What is Django?** A Python web framework that separates URLs, views, templates, and database models.

**What is SQLite?** A small file-based SQL database used for development.

**What is a foreign key?** A database link between a record and a record in another table.

**Why hash passwords?** Password hashing protects the original password from being read directly if the database is exposed.

**What is REST?** An API style using HTTP methods such as GET, POST, PATCH, and DELETE.

**What is Fetch API?** Browser JavaScript used to send HTTP requests to the backend.

**What is the difference between authentication and authorization?** Authentication proves who the user is. Authorization decides what the user can do.

**How does a unique constraint help?** It prevents duplicate records, such as one user liking the same post twice.
