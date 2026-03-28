# Westlake Little League Equipment Tracker

## Current State
- Full equipment tracker with Dashboard, Inventory, Issue Equipment, Returns, Reports, Settings pages
- Open access -- no authentication, all users have equal access
- Top-right header shows a static circle "A" button with a non-functional dropdown
- Layout.tsx has a user button UI but no actual dropdown implementation
- Backend: equipment tracking only (no user management)
- Authorization component is now selected

## Requested Changes (Diff)

### Add
- Login page: email + password form, with link to sign up
- Sign up page: name, email, password fields
- User authentication using the authorization component (email/password stored via backend)
- Route guard: redirect unauthenticated users to login page
- Fix the top-right user button: show logged-in user's name/initials, functional dropdown with "Profile" and "Log out"
- User management section in Settings page: list registered users, add new user (name, email, password)

### Modify
- App.tsx: add login/signup routes, wrap protected routes with auth check
- Layout.tsx: fix user button dropdown to show real user info and logout option
- Settings.tsx: add "Users" tab/section for managing users
- Backend: add user management (register, login, list users, delete user)

### Remove
- Static "Admin" label and non-functional dropdown from header

## Implementation Plan
1. Update backend (main.mo) to add user registration, login (email+password), and list/delete user functions
2. Run generate_motoko_code to produce updated backend and bindings
3. Update frontend:
   - Add LoginPage and SignUpPage components
   - Add auth context (currentUser state, login/logout/register functions)
   - Guard all routes -- redirect to /login if not authenticated
   - Fix user button dropdown in Layout.tsx (show initials, name, logout option)
   - Add Users management section in Settings.tsx (list users, add user form)
