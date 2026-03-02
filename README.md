# Social Media Web App 🚀

A **full-featured Social Media Web Application** built with **React**, **React Query**, and **Hero UI**.  
This platform simulates a real-world social network with **authentication**, **posts**, **comments**, **likes**, **shares**, **bookmarks**, **notifications**, and **user relationships**.

---

## 🌟 Features

### 🔐 Authentication
- Register & Login
- JWT-based authentication
- Change password
- Protected routes

### 👤 Users
- User profile page
- Follow / Unfollow users
- Follow suggestions
- Followers & Following lists
- Explore users

### 📝 Posts
- Create, Read, Update, Delete (CRUD)
- Post details page
- Home feed (followers’ posts)
- Explore feed
- Bookmark / Unbookmark posts
- Share posts
- Like / Unlike posts with animated UI

### 💬 Comments
- CRUD comments on posts
- Real-time UI updates

### 🔔 Notifications
- Get notifications and counts
- Mark one as read
- Mark all as read

---

## 🛠 Tech Stack
- **Frontend:** React, Context API, React Query
- **HTTP Requests:** Axios
- **Animations:** Framer Motion
- **Auth:** JWT
- **State Management:** React Query & Context
- **Routing:** React Router
- **UI Library:** Hero UI (`@heroui/react`)

---

## ⚡ Live Demo
Check the live version here: [🌐 Live Demo](https://social-media-web-self.vercel.app)

---

## 🧠 Architecture Highlights
- Optimized React Query caching and invalidation
- Clean separation between UI and data logic
- Reusable components for posts, comments, modals, and cards
- Optimistic updates for smooth UX
- Animated interactions for like/share/bookmark buttons

---

## ⚙️ Setup & Run

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/<repo-name>.git

# 2. Install dependencies
cd <repo-name>
npm install

# 3. Run the app
npm start
