# Reddit Clone — React Native & Expo

A full-stack, cross-platform **Reddit Clone** built with **React Native**, **TypeScript**, **Expo Router**, **Supabase**, **Clerk Authentication**, and **TanStack Query**. Supports **Android**, **iOS**, and **Web** with community-based posting, image uploads, nested comment threads, and real-time voting.

---

## Table of Contents

- [Reddit Clone — React Native \& Expo](#reddit-clone--react-native--expo)
  - [Table of Contents](#table-of-contents)
  - [1. Features](#1-features)
    - [1.1 Authentication \& User Management](#11-authentication--user-management)
    - [1.2 Home Feed \& Post Discovery](#12-home-feed--post-discovery)
    - [1.3 Post Creation \& Media Uploads](#13-post-creation--media-uploads)
    - [1.4 Voting \& Nested Comments](#14-voting--nested-comments)
    - [1.5 Communities \& Moderation](#15-communities--moderation)
  - [2. Tech Stack](#2-tech-stack)
    - [2.1 Frontend \& Mobile Framework](#21-frontend--mobile-framework)
    - [2.2 State Management \& Data Fetching](#22-state-management--data-fetching)
    - [2.3 Backend, Database \& Authentication](#23-backend-database--authentication)
  - [3. Deployment](#3-deployment)
    - [3.1 Live Application URL (APP URL)](#31-live-application-url-app-url)
    - [3.2 Web Build \& Static Export](#32-web-build--static-export)
    - [3.3 Mobile Build (EAS \& Expo Go)](#33-mobile-build-eas--expo-go)
  - [4. Test and Admin Users Credentials](#4-test-and-admin-users-credentials)
    - [4.1 Regular Test User Credentials](#41-regular-test-user-credentials)
    - [4.2 Admin User Credentials](#42-admin-user-credentials)
  - [5. How to Use App for Regular User](#5-how-to-use-app-for-regular-user)
    - [5.1 Signing Up \& Signing In](#51-signing-up--signing-in)
    - [5.2 Browsing the Feed \& Interacting with Posts](#52-browsing-the-feed--interacting-with-posts)
    - [5.3 Creating a New Post with Images](#53-creating-a-new-post-with-images)
    - [5.4 Commenting \& Replying in Threads](#54-commenting--replying-in-threads)
  - [6. How to Use App for Admin User](#6-how-to-use-app-for-admin-user)
    - [6.1 Managing Communities (Groups)](#61-managing-communities-groups)
    - [6.2 Moderating Posts \& Comments](#62-moderating-posts--comments)
    - [6.3 Managing Users \& Storage Policies](#63-managing-users--storage-policies)
  - [7. Getting Started \& Local Setup](#7-getting-started--local-setup)
    - [7.1 Prerequisites](#71-prerequisites)
    - [7.2 Installation](#72-installation)
    - [7.3 Environment Variables](#73-environment-variables)
    - [7.4 Running the App](#74-running-the-app)
  - [8. Project Structure \& Scripts](#8-project-structure--scripts)
    - [8.1 Directory Layout](#81-directory-layout)
    - [8.2 Available Scripts](#82-available-scripts)
    - [8.3 Troubleshooting](#83-troubleshooting)

---

## 1. Features

### 1.1 Authentication & User Management
- ✅ **Clerk Email & Password Authentication**: Secure sign-up and sign-in flows across Android, iOS, and Web.
- ✅ **Persistent Token Cache**: Encrypted session persistence on native devices using `expo-secure-store`.
- ✅ **Protected Routing**: Automatic redirection between `(auth)` and `(protected)` route groups based on session state.
- ✅ **Authenticated Supabase Requests**: Seamless Clerk JWT integration injected directly into Supabase client requests.

### 1.2 Home Feed & Post Discovery
- ✅ **Infinite Scrolling Home Feed**: Paginated post feed powered by TanStack Query's `useInfiniteQuery`.
- ✅ **Pull-to-Refresh**: Instant feed synchronization with a swipe-down gesture.
- ✅ **Rich Post Cards**: Displays community avatar, group name, relative timestamps (`date-fns`), post title, image preview, vote score, and comment count.
- ✅ **Detailed Post View**: Dedicated screen (`/post/[id]`) displaying full post descriptions, high-resolution images, and nested discussion threads.

### 1.3 Post Creation & Media Uploads
- ✅ **Community Group Selector**: Searchable community picker (`groupSelector`) with instant filtering.
- ✅ **Native & Web Image Picker**: Select and crop images in a `4:3` aspect ratio using `expo-image-picker`.
- ✅ **Supabase Storage Integration**: Direct binary/base64 upload to Supabase Storage `images` bucket with automatic public/authenticated URL resolution.
- ✅ **Post Deletion**: One-tap post removal from the Post Detail header with optimistic cache updates.

### 1.4 Voting & Nested Comments
- ✅ **Upvote & Downvote System**: Real-time score calculation and user vote highlighting (`+1` / `-1`).
- ✅ **Multi-Level Nested Comments**: Recursive comment tree supporting replies up to 5 levels deep.
- ✅ **Expandable Reply Threads**: On-demand loading of child replies via a *"Show Replies"* toggle.
- ✅ **Comment Author Controls**: Users can delete their own comments directly from the thread.

### 1.5 Communities & Moderation
- ✅ **Community Directory**: Browse and search communities (`groups`) with custom icons and names.
- ✅ **Database Row-Level Security (RLS)**: Supabase PostgreSQL policies protecting posts, comments, upvotes, and storage buckets.
- ✅ **Cross-Platform UI**: Responsive layouts tailored for iOS, Android (Fabric), and Web (`react-native-web`).

---

## 2. Tech Stack

### 2.1 Frontend & Mobile Framework
- **React Native** (`0.86.3`) & **React** (`19.2.3`)
- **Expo SDK** (`~57.0.25`)
- **Expo Router** (`~57.0.23`) — File-based routing with typed routes, tabs, and modals
- **React Native Web** (`^0.21.2`) — Web rendering support
- **TypeScript** (`~6.0.3`) — End-to-end static typing with generated Supabase database types
- **Expo Vector Icons** (`@expo/vector-icons`) — MaterialCommunityIcons, AntDesign, Entypo, Feather, Octicons, and Ionicons

### 2.2 State Management & Data Fetching
- **TanStack React Query** (`^5.66.11`) — Server-state caching, infinite queries, mutations, and optimistic cache updates
- **Jotai** (`^2.12.1`) — Lightweight atomic client state management (selected community group state)
- **date-fns** (`^4.1.0`) — Relative timestamp formatting

### 2.3 Backend, Database & Authentication
- **Supabase** (`@supabase/supabase-js` `^2.117.2`) — PostgreSQL database (`posts`, `groups`, `comments`, `upvotes`, `users`) and cloud object storage (`images` bucket)
- **Clerk** (`@clerk/clerk-expo` `^2.7.8`) — User authentication, session management, and JWT issuance
- **Expo Secure Store** (`~57.0.4`) — Native encrypted token storage

---

## 3. Deployment

### 3.1 Live Application URL (APP URL)
- **APP URL**: `[https://your-deployed-app-url.web.app](https://your-deployed-app-url.web.app)` *(Replace with your live Firebase Hosting / EAS Hosting URL)*

### 3.2 Web Build & Static Export
To build the static web bundle into the `dist/` directory and deploy it:

```bash
# Export static web production bundle
npx expo export -p web

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or deploy to EAS Hosting
npx eas-cli deploy
```

### 3.3 Mobile Build (EAS & Expo Go)
```bash
# Run in development with Expo Go (LAN or Tunnel)
npx expo start --tunnel -c

# Build Android APK via EAS Build
npx eas-cli build --platform android --profile preview
```

---

## 4. Test and Admin Users Credentials

### 4.1 Regular Test User Credentials
Use the following credentials to test standard user workflows (browsing, creating posts, voting, and commenting):

| Field | Value |
| :--- | :--- |
| **Role** | Regular User |
| **Email** | `user@example.com` *(or register a new account via Sign Up)* |
| **Username** | `testuser` |
| **Password** | `TestUser@12345` |

### 4.2 Admin User Credentials
Use the following credentials for administrative testing and moderation workflows:

| Field | Value |
| :--- | :--- |
| **Role** | Admin / Moderator |
| **Email** | `admin@example.com` |
| **Username** | `admin` |
| **Password** | `AdminUser@12345` |
| **Supabase / Clerk Dashboard** | Managed via [Clerk Dashboard](https://dashboard.clerk.com/) & [Supabase Studio](https://supabase.com/dashboard) |

---

## 5. How to Use App for Regular User

### 5.1 Signing Up & Signing In
1. Launch the app on Web or Expo Go. You will be directed to the **Sign In** screen (`/signIn`).
2. To create a new account, tap **Sign up** at the bottom of the screen.
3. Enter your **Email**, **Username (optional)**, and **Password**, then tap **Sign Up**.
4. Once authenticated, you are automatically redirected to the protected **Home Feed** (`/`).
5. To log out at any time, tap the **Log Out** icon in the top-right header bar.

### 5.2 Browsing the Feed & Interacting with Posts
1. Scroll vertically through the **Home Feed** to view posts from all communities.
2. Pull down from the top of the feed to refresh posts.
3. Tap the **Upvote (↑)** or **Downvote (↓)** arrows on any post card to cast your vote.
4. Tap anywhere on a post card (or the comment icon) to open the **Post Detail** view (`/post/[id]`).

### 5.3 Creating a New Post with Images
1. Tap the **Create** (`+`) tab in the bottom navigation bar.
2. Tap the **r/ Select a community** pill at the top to open the **Group Selector** modal.
3. Search for a community (e.g., `React Native`) and tap it to select it.
4. Enter a **Title** (required) and optional **body text**.
5. *(Optional)* Tap the **Image icon** at the bottom-left to pick and crop a photo from your device library.
6. Tap the **Post** button in the top-right corner to publish your post and return to the Home Feed.

### 5.4 Commenting & Replying in Threads
1. Open any post to access the **Post Detail** screen.
2. Tap the *"Join the conversation"* input bar at the bottom of the screen, type your comment, and tap **Reply**.
3. To reply to a specific comment, tap the **Reply icon** beneath that comment, enter your response, and tap **Reply**.
4. Tap **Show Replies** under a parent comment to expand nested replies.
5. To delete a comment you authored, tap the **Trash icon** on that comment.

---

## 6. How to Use App for Admin User

### 6.1 Managing Communities (Groups)
1. Sign in as an Admin user or open the **Supabase Dashboard** → **Table Editor** → `groups`.
2. Add, update, or remove community groups (`id`, `name`, `image`).
3. Newly added communities immediately appear in the in-app **Group Selector** when users create posts.

### 6.2 Moderating Posts & Comments
1. Open any post in the **Post Detail** view (`/post/[id]`).
2. Tap the **Trash icon** in the top-right header bar to delete inappropriate or test posts. The post is immediately removed from Supabase and evicted from the Home Feed cache.
3. Comments can be moderated directly via the comment **Trash icon** or through the `comments` table in Supabase Studio.

### 6.3 Managing Users & Storage Policies
1. **User Management**: In the [Clerk Dashboard](https://dashboard.clerk.com/), view registered users, reset passwords, manage sessions, or toggle **Bot sign-up protection** under *Configure → Attack protection*.
2. **Storage Management**: In the [Supabase Dashboard](https://supabase.com/dashboard) → **Storage** → `images`, inspect uploaded post images and configure bucket visibility or RLS policies.

---

## 7. Getting Started & Local Setup

### 7.1 Prerequisites
- **Node.js** (v18+ or v20+ LTS recommended)
- **npm** or **yarn**
- **Expo Go** app installed on your iOS or Android device (compatible with Expo SDK 57)
- A **Supabase** project and a **Clerk** application

### 7.2 Installation
```bash
# Clone the repository
git clone <repository-url>
cd react-native-reddit-clone

# Install dependencies
npm install
```

### 7.3 Environment Variables
Create a `.env` file in the root directory of the project with the following keys:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 7.4 Running the App
```bash
# Start the Expo development server
npm start

# Start with tunnel (recommended if Windows Firewall blocks LAN connections)
npx expo start --tunnel -c

# Start directly on Web
npm run web

# Start on Android
npm run android

# Start on iOS
npm run ios
```

---

## 8. Project Structure & Scripts

### 8.1 Directory Layout
```text
react-native-reddit-clone/
├── assets/                          # App icons, splash screens, and static images
├── src/
│   ├── app/                         # Expo Router file-based routes
│   │   ├── (auth)/                  # Public authentication routes (signIn, signUp)
│   │   ├── (protected)/             # Authenticated routes
│   │   │   ├── (tabs)/              # Bottom tab screens (index, communities, create, chat, inbox)
│   │   │   ├── post/[id].tsx        # Post detail & nested comments screen
│   │   │   └── groupSelector.tsx    # Community selection screen
│   │   └── _layout.tsx              # Root layout with ClerkProvider & QueryClientProvider
│   ├── atoms.tsx                    # Jotai state atoms (selectedGroupAtom)
│   ├── components/                  # Reusable UI components (PostListItem, CommentListItem, SupabaseImage)
│   ├── lib/                         # Supabase client initialization with Clerk session token
│   ├── services/                    # Data access layer (postService, commentsService, groupService, upvotesService)
│   ├── types/                       # TypeScript definitions & generated Supabase database types
│   └── utils/                       # Helper utilities (supabaseImages upload & download helpers)
├── cache.ts                         # Clerk token cache using expo-secure-store
├── app.json                         # Expo configuration
├── firebase.json                    # Firebase Hosting configuration
└── package.json                     # Project dependencies and scripts
```

### 8.2 Available Scripts
| Script | Command | Description |
| :--- | :--- | :--- |
| `npm start` | `expo start` | Starts the Metro bundler and Expo dev server |
| `npm run android` | `expo start --android` | Opens the app on a connected Android device/emulator |
| `npm run ios` | `expo start --ios` | Opens the app on an iOS simulator/device |
| `npm run web` | `expo start --web` | Launches the app in a web browser |
| `npm run gen-types` | `npx supabase gen types...` | Regenerates TypeScript types from the Supabase schema |

### 8.3 Troubleshooting
- **`java.io.IOException: Failed to download remote update` on Expo Go**:
  Ensure your phone and computer are on the same Wi-Fi network, allow inbound TCP port `8081` in Windows Firewall, or start the server using `npx expo start --tunnel -c`.
- **Clerk `422` or CAPTCHA warning on Web Sign-Up**:
  Ensure you are running the latest web bundle (`npx expo export -p web`) or disable **Bot sign-up protection** in the Clerk Dashboard under *Configure → Attack protection* during development.

