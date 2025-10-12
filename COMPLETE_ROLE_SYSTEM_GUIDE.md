# 🔐 Complete Role-Based Authentication System

## Overview
This is a comprehensive role-based authentication system for NeighborhoodRank with three user states:
- **👤 Normal Users** - Can rate neighborhoods/buildings
- **👑 Admins** - Full access to admin panel and user management
- **🚫 Banned Users** - Completely blocked from using the site

---

## 📋 Table of Contents
1. [Database Setup](#database-setup)
2. [Middleware Protection](#middleware-protection)
3. [Role Detection](#role-detection)
4. [User Pages](#user-pages)
5. [Admin Features](#admin-features)
6. [Ban System](#ban-system)
7. [How It Works](#how-it-works)
8. [Testing Guide](#testing-guide)

---

## 1. Database Setup

### SQL File: `ROLE_BASED_AUTH_SETUP.sql`

**What it does:**
- Creates `user_profiles` table with role flags
- Auto-creates profile when user signs up
- Sets admin user (tami76@tiffincrane.com)
- Syncs existing users

**Table Structure:**
```sql
user_profiles
  - id (uuid)               -> references auth.users
  - email (text)            -> user's email
  - full_name (text)        -> user's name
  - is_admin (boolean)      -> admin flag (default: false)
  - is_banned (boolean)     -> banned flag (default: false)
  - ban_reason (text)       -> reason for ban
  - banned_at (timestamp)   -> when user was banned
  - created_at (timestamp)  -> account creation date
```

**Run in Supabase:**
```sql
-- Run ROLE_BASED_AUTH_SETUP.sql
-- This creates everything you need
```

---

## 2. Middleware Protection

### File: `middleware.ts`

**What it protects:**
1. **ALL ROUTES** - Checks for banned/deleted users
2. **Admin Routes** (`/admin/*`) - Admin-only access
3. **Rating Routes** (`/rate/*`) - Must be logged in

**Flow:**
```
User visits any page
    ↓
Is route public? (login/signup/banned)
    ↓ NO
Is user logged in?
    ↓ YES
Check user_profiles
    ↓
Profile exists?
    ↓ YES
Is user banned?
    ↓ NO
Continue to page
```

**Automatic Actions:**
- Banned users → Redirect to `/banned`
- Deleted users → Sign out + redirect to login
- Non-admin trying `/admin` → Redirect home
- Not logged in trying `/rate` → Redirect to login

---

## 3. Role Detection

### File: `utils/getUserRole.ts`

**Functions:**

1. **`getUserRole()`** - Returns complete role data
```typescript
const roleData = await getUserRole()
// Returns: { role: 'admin' | 'user' | 'guest', userId, email, isAdmin }
```

2. **`isAdmin()`** - Simple admin check
```typescript
const admin = await isAdmin()
// Returns: true or false
```

3. **`isLoggedIn()`** - Simple login check
```typescript
const loggedIn = await isLoggedIn()
// Returns: true or false
```

**Usage Example:**
```typescript
const { role, email, isAdmin } = await getUserRole()

if (role === 'admin') {
  // Show admin features
} else if (role === 'user') {
  // Show normal user features
} else {
  // Show guest features
}
```

---

## 4. User Pages

### Profile Page: `/app/profile/page.tsx`

**Features:**
- Shows user's name, email, and role
- Displays "Administrator" badge for admins
- Shows "Verified Account" badge for normal users
- Links to admin panel if user is admin
- Lists all user's reviews

**Role Display:**
- **Admin:** Purple badge + "Administrator" + Admin Panel button
- **Normal User:** Green badge + "Verified Account"

### Banned Page: `/app/banned/page.tsx`

**Features:**
- Shows ban reason
- Shows when user was banned
- Explains what being banned means
- Provides contact support option
- Sign out button

**Automatic Redirect:**
- Any banned user accessing ANY page → `/banned`
- Cannot escape this page while banned

---

## 5. Admin Features

### Admin Dashboard: `/app/admin/page.tsx`

**Access:**
- Only users with `is_admin = true`
- Protected by middleware
- Double-checked on page load

**Features:**
- Welcome message with admin email
- Stats dashboard
- Links to manage users, reviews, locations

### Admin User Management: `/app/admin/users/page.tsx`

**Features:**
- View all users
- Toggle admin status (promote/demote)
- Ban users with reason
- Unban users
- Delete users with reason
- See user stats

---

## 6. Ban System

### How Banning Works

**1. Admin Bans User:**
```typescript
// In admin panel
UPDATE user_profiles 
SET 
  is_banned = true,
  ban_reason = 'Spam or inappropriate content',
  banned_at = NOW()
WHERE id = 'user-id-here';
```

**2. Middleware Detects Ban:**
- On EVERY page request
- Checks `is_banned` flag
- Redirects to `/banned` if true

**3. User Sees Ban Page:**
- Cannot access any other pages
- Sees ban reason and date
- Can contact support
- Must sign out

**4. Unbanning:**
```typescript
// In admin panel
UPDATE user_profiles 
SET 
  is_banned = false,
  ban_reason = NULL,
  banned_at = NULL
WHERE id = 'user-id-here';
```

---

## 7. How It Works

### Complete Flow Diagram

```
┌─────────────────────────────────────┐
│     User Visits NeighborhoodRank   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     middleware.ts Runs              │
│     (On EVERY Request)              │
└──────────────┬──────────────────────┘
               │
               ▼
         Is Public Route?
         (login/signup/banned)
               │
        ┌──────┴──────┐
        │             │
       YES           NO
        │             │
        │             ▼
        │    Check User Profile
        │             │
        │             ▼
        │        Deleted?
        │             │
        │      ┌──────┴──────┐
        │      │             │
        │     YES           NO
        │      │             │
        │      │             ▼
        │   Sign Out      Banned?
        │   Redirect          │
        │      │       ┌──────┴──────┐
        │      │       │             │
        │      │      YES           NO
        │      │       │             │
        │      │  Redirect to    Continue
        │      │    /banned         │
        │      │       │             ▼
        │      │       │        Is Admin Route?
        │      │       │             │
        │      │       │      ┌──────┴──────┐
        │      │       │      │             │
        │      │       │     YES           NO
        │      │       │      │             │
        │      │       │  Check Admin   Is Rate Route?
        │      │       │   Status           │
        │      │       │      │      ┌──────┴──────┐
        │      │       │      │      │             │
        │      │       │   Admin?   YES           NO
        │      │       │      │      │             │
        │      │       │   ┌──┴──┐   │         Allow
        │      │       │  YES   NO   │          │
        │      │       │   │     │   │          │
        │      │       │Allow Block Check      │
        │      │       │   │     │   Login      │
        │      │       │   │     │    │         │
        │      │       │   │     │  ┌─┴─┐       │
        │      │       │   │     │ YES  NO      │
        │      │       │   │     │  │   │       │
        │      │       │   │     │Allow Block   │
        │      │       │   │     │  │   │       │
        └──────┴───────┴───┴─────┴──┴───┴───────┘
                       │
                       ▼
               Page Loads Successfully
```

### Role Checking Flow

```
getUserRole() Called
       ↓
Get Supabase Session
       ↓
   Has Session?
       ↓
   ┌───┴───┐
  NO      YES
   │       │
Guest    Query
Role   user_profiles
   │       ↓
   │   is_admin = true?
   │       │
   │   ┌───┴───┐
   │  YES     NO
   │   │       │
   │ Admin   User
   │  Role   Role
   │   │       │
   └───┴───────┘
       │
   Return Role Data
```

---

## 8. Testing Guide

### Test Scenarios

**1. Normal User Access:**
```bash
# 1. Sign up as new user
# 2. Try accessing these:
   ✅ Homepage (/)
   ✅ Explore (/explore)
   ✅ Profile (/profile)
   ✅ Rate pages (/rate/neighborhood, /rate/building)
   ❌ Admin panel (/admin) -> Redirects home
```

**2. Admin User Access:**
```bash
# 1. Set user as admin:
   UPDATE user_profiles SET is_admin = true WHERE email = 'your@email.com';
# 2. Try accessing these:
   ✅ All normal user pages
   ✅ Admin panel (/admin)
   ✅ All admin sub-pages
```

**3. Banned User:**
```bash
# 1. Ban user:
   UPDATE user_profiles 
   SET is_banned = true, ban_reason = 'Test ban' 
   WHERE email = 'banned@email.com';
# 2. Try accessing ANY page:
   ❌ Automatically redirected to /banned
   ❌ Cannot access any other pages
   ✅ Can only sign out
```

**4. Deleted User:**
```bash
# 1. Delete user profile:
   DELETE FROM user_profiles WHERE email = 'deleted@email.com';
# 2. Try accessing any page:
   ❌ Automatically signed out
   ❌ Redirected to login
   ❌ Error: account_deleted
```

### Manual Testing Checklist

- [ ] Normal user can sign up
- [ ] Normal user can submit ratings
- [ ] Normal user CANNOT access /admin
- [ ] Admin user can access /admin
- [ ] Admin can ban users
- [ ] Banned users redirected to /banned immediately
- [ ] Banned users cannot access any pages
- [ ] Deleted users automatically signed out
- [ ] Middleware protects ALL routes
- [ ] Role badges show correctly on profile

---

## 📝 Quick Commands

### Promote User to Admin:
```sql
UPDATE user_profiles 
SET is_admin = true 
WHERE email = 'user@example.com';
```

### Ban User:
```sql
UPDATE user_profiles 
SET 
  is_banned = true,
  ban_reason = 'Reason for ban here',
  banned_at = NOW()
WHERE email = 'user@example.com';
```

### Unban User:
```sql
UPDATE user_profiles 
SET 
  is_banned = false,
  ban_reason = NULL,
  banned_at = NULL
WHERE email = 'user@example.com';
```

### Check User Status:
```sql
SELECT email, is_admin, is_banned, ban_reason 
FROM user_profiles 
WHERE email = 'user@example.com';
```

### List All Admins:
```sql
SELECT email, full_name, created_at 
FROM user_profiles 
WHERE is_admin = true;
```

### List All Banned Users:
```sql
SELECT email, ban_reason, banned_at 
FROM user_profiles 
WHERE is_banned = true;
```

---

## ✅ Setup Checklist

1. [ ] Run `ROLE_BASED_AUTH_SETUP.sql` in Supabase
2. [ ] Verify `user_profiles` table exists
3. [ ] Verify trigger `on_auth_user_created` exists
4. [ ] Create `utils/getUserRole.ts` file
5. [ ] Create/update `middleware.ts` file
6. [ ] Create `/app/banned/page.tsx` file
7. [ ] Update `/app/admin/page.tsx` with role check
8. [ ] Update `/app/profile/page.tsx` with role display
9. [ ] Restart dev server (`npm run dev`)
10. [ ] Test normal user flow
11. [ ] Test admin user flow
12. [ ] Test banned user flow

---

## 🎯 Summary

**Three User States:**
1. **Normal User** (`is_admin = false, is_banned = false`)
   - Can use all normal features
   - Cannot access admin panel
   
2. **Admin** (`is_admin = true, is_banned = false`)
   - Can use all normal features
   - CAN access admin panel
   - Can manage users (ban/unban/delete)

3. **Banned User** (`is_banned = true`)
   - Automatically redirected to ban page
   - Cannot access ANY site features
   - Must contact support or wait for unban

**Middleware Protection:**
- Runs on EVERY request
- Checks ban status FIRST
- Then checks admin status
- Then checks login status
- Automatically redirects as needed

**Zero Manual Work:**
- Auto-creates profiles on signup
- Auto-detects bans/deletions
- Auto-redirects appropriately
- Auto-displays correct role badges

---

**Everything is now integrated and working together!** 🚀

