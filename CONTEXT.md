# Context: fb2

A small Facebook-like social app where users can post and read each other's posts.

## Glossary

### User
A person with a registered account. Has a name, email, and password. Can create Posts and appears on a Profile page. Distinguished from an anonymous visitor, who has no identity in the system and can only read the feed.

### Post
A text message published by a User. Has a single canonical form — there is no distinction between a "profile post" and a "feed post". Every Post belongs to exactly one User and appears in the global Feed.

### Feed
The reverse-chronological stream of all Posts from all Users, shown on the home page. No curation, filtering, or ranking — newest Post always appears first.

### Profile
The page for a specific User, showing their name, email, and their Posts in reverse-chronological order. No bio, follower count, or other metadata in v1.

### Log in / Log out
The canonical verbs for a User authenticating and ending their session. Written as two words ("Log in", "Log out") in UI labels. Route is `/login`. Never "Sign in" or "Signin".

### Sign up
The canonical verb for creating a new account. Written as two words ("Sign up") in UI labels. Route is `/signup`. Never "Register" or "Create account".
