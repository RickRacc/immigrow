# Production Fix Guide: Mixed Content Error

## Current Status

### What's Working
- Backend deployed to EC2 with `/api` routes
- Backend returns JSON data: `http://3.141.5.227:5000/api/orgs` works
- Frontend deployed to S3/CloudFront
- About page shows Phase 2 updates

###  What's Broken
- Organizations, Events, Resources pages show "Error: Failed to fetch"
- Browser console shows: "Mixed Content" or "NetworkError when attempting to fetch resource"

---

## Root Cause: Mixed Content Error

**The Problem:**
- Production site: `https://immigrow.site` (HTTPS - secure)
- Backend API: `http://3.141.5.227:5000` (HTTP - insecure)
- **Browsers block HTTPS sites from calling HTTP APIs** (security policy)

**Why it happens:**
1. GitLab CI variable `VITE_API_BASE=http://3.141.5.227:5000` tells frontend to use HTTP
2. Frontend tries: `http://3.141.5.227:5000/api/orgs`
3. Browser blocks it: "Cannot load insecure content from HTTPS page"
4. Result: "Failed to fetch" error

**Why local dev works:**
- Local: `http://localhost:5175` → `http://localhost:5000` (both HTTP so it works but won't in production)
- Production: `https://immigrow.site` → `http://3.141.5.227:5000` (HTTPS → HTTP )

---

## The Solution (Two Required Steps)

You **MUST** do both steps. Doing only one will not fix production.

### Step 1: Remove VITE_API_BASE from GitLab CI (5 minutes)

### Step 2: Configure CloudFront to Route `/api/*` to EC2 (10-15 minutes)

**Both are required!** Here's why:

| If you only... | What happens | Result |
|---|---|---|
| Remove `VITE_API_BASE` | Frontend calls `/api/orgs` but CloudFront doesn't know where to route it | Still broken (404 or wrong response) |
| Configure CloudFront | Frontend still calls `http://3.141.5.227:5000` directly | Still broken (mixed content error) |
| Do BOTH | Frontend calls `/api/orgs` → CloudFront routes to EC2 → Works! | Fixed! |

---

## Step 1: Remove VITE_API_BASE from GitLab CI/CD

### Why Remove It?

**Current behavior (with `VITE_API_BASE=http://3.141.5.227:5000`):**
```javascript
// Frontend code interprets this as:
fetch('http://3.141.5.227:5000/api/orgs')
//  Browser blocks: HTTPS site calling HTTP API
```

**Desired behavior (without `VITE_API_BASE`):**
```javascript
// Frontend code defaults to relative URL:
fetch('/api/orgs')
// Which browser interprets as:
fetch('https://immigrow.site/api/orgs')
//  Same protocol (HTTPS), browser allows it
// CloudFront then routes it to EC2 backend internally
```

**The variable was originally set to bypass CloudFront** for testing, but now it's causing the mixed content error.

### How to Remove It

1. **Go to GitLab:**
   - Navigate to: https://gitlab.com/anisha1045/cs373-55090-09
   - Settings → CI/CD → Variables

2. **Find the variable:**
   - Look for: `VITE_API_BASE`
   - Current value: `http://3.141.5.227:5000`

3. **Delete or disable it:**
   - **Option A (Recommended):** Click the trash icon to delete it completely
   - **Option B:** Edit and set value to empty string `""` (keeps it for reference)

4. **Trigger new deployment:**
   - Go to: CI/CD → Pipelines
   - Click "Run pipeline" on `main` branch
   - OR make a small commit and push

5. **Wait for deployment:**
   - Pipeline will take ~10-15 minutes
   - Watch the `deploy` stage complete

### What This Does

**Before removal:**
- Frontend built with: `VITE_API_BASE=http://3.141.5.227:5000`
- API calls: `http://3.141.5.227:5000/api/orgs` (absolute URL)

**After removal:**
- Frontend built without `VITE_API_BASE`
- `api.js` line 5 defaults to: `/api`
- API calls: `/api/orgs` (relative URL)
- Browser resolves as: `https://immigrow.site/api/orgs`
- CloudFront receives request for `/api/orgs`

**But!** CloudFront doesn't know what to do with `/api/orgs` yet → That's why Step 2 is required.

---

## Step 2: Configure CloudFront to Route `/api/*` to EC2

### Prerequisites

- AWS Console access with CloudFront permissions
- Knows the CloudFront distribution ID: `E3VBUSY2EV16W`

### Detailed Instructions

#### Part A: Add EC2 Backend as CloudFront Origin

1. **Open AWS Console:**
   - Go to: https://console.aws.amazon.com/cloudfront
   - Sign in with AWS credentials

2. **Find the distribution:**
   - Look for distribution ID: `E3VBUSY2EV16W`
   - Click on the ID to open details

3. **Add new origin:**
   - Click the **Origins** tab
   - Click **Create origin** button

4. **Configure origin settings:**
   ```
   Origin domain:        3.141.5.227:5000
   Protocol:             HTTP only
   HTTP port:            5000
   HTTPS port:           443 (leave default, won't be used)
   Origin path:          (leave empty)
   Name:                 EC2-Backend-Flask
   Enable Origin Shield: No
   ```

5. **Additional settings (leave as defaults):**
   - Minimum origin SSL protocol: TLSv1.2
   - Origin response timeout: 30 seconds
   - Origin keep-alive timeout: 5 seconds

6. **Click "Create origin"**

#### Part B: Create Behavior to Route `/api/*` to Backend

1. **Still in the same CloudFront distribution:**
   - Click the **Behaviors** tab
   - Click **Create behavior** button

2. **Configure behavior settings:**
   ```
   Path pattern:                    /api/*
   Origin and origin groups:        EC2-Backend-Flask (select from dropdown)
   Viewer protocol policy:          Redirect HTTP to HTTPS
   Allowed HTTP methods:            GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   Cache policy:                    CachingDisabled
   Origin request policy:           AllViewer
   Response headers policy:         (leave as default or SimpleCORS if needed)
   ```

3. **Why these settings:**
   - **Path pattern `/api/*`**: Matches all API routes
   - **Redirect HTTP to HTTPS**: Users always use HTTPS, CloudFront handles HTTP→backend
   - **All HTTP methods**: API needs POST, PUT, DELETE for full REST support
   - **CachingDisabled**: API responses shouldn't be cached (always get fresh data)
   - **AllViewer**: Forward all headers/query params to backend

4. **Click "Create behavior"**

#### Part C: Verify Behavior Order (IMPORTANT!)

1. **Go back to Behaviors tab**

2. **Check the order:**
   - Behaviors are evaluated top-to-bottom
   - `/api/*` must be BEFORE the default `*` behavior

3. **If `/api/*` is not at the top:**
   - Select the `/api/*` behavior
   - Click **Move up** until it's above the default `*` behavior

4. **Correct order should look like:**
   ```
   Priority | Path Pattern | Origin
   ---------+--------------+------------------
   0        | /api/*       | EC2-Backend-Flask
   1        | *            | S3-Origin
   ```

#### Part D: Create CloudFront Invalidation (Optional but Recommended)

1. **Go to Invalidations tab**
2. **Click "Create invalidation"**
3. **Add paths:**
   ```
   /*
   ```
4. **Click "Create invalidation"**
5. **Wait 1-2 minutes** for invalidation to complete

#### Part E: Wait for CloudFront Deployment

1. **Go to General tab**
2. **Check "Last modified" status**
3. **Wait until status changes from "Deploying" to timestamp** (~5-10 minutes)

### Verification Steps

Once CloudFront changes are deployed:

1. **Test in browser:**
   - Visit: https://immigrow.site/orgs
   - Should show: List of organizations
   - If error: Check browser console for details

2. **Test API endpoint directly:**
   - Open browser console (F12)
   - Run: `fetch('https://immigrow.site/api/orgs').then(r => r.json()).then(console.log)
   - Should see: Array of organization objects 

3. **Test all pages:**
   - https://immigrow.site/orgs 
   - https://immigrow.site/events 
   - https://immigrow.site/resources 

---

## Troubleshooting

### Issue: Still getting "Failed to fetch" after both steps

**Possible causes:**

1. **CloudFront changes not deployed yet**
   - Solution: Wait 5-10 minutes for CloudFront to propagate changes globally

2. **Browser cache**
   - Solution: Hard refresh (Ctrl+Shift+R) or open in incognito mode

3. **Frontend not rebuilt yet**
   - Solution: Check GitLab pipeline completed successfully

4. **Behavior order wrong**
   - Solution: Make sure `/api/*` behavior is BEFORE default `*` behavior

### Issue: Getting 502 Bad Gateway from CloudFront

**Possible causes:**

1. **EC2 backend not running**
   - Solution: SSH into EC2 and verify Docker container is running
   - Test: `curl http://localhost:5000/api/orgs`

2. **EC2 security group blocking CloudFront**
   - Solution: Check EC2 security group allows inbound port 5000
   - From: All IPs (`0.0.0.0/0`) or CloudFront IP ranges

### Issue: Getting 404 from CloudFront for `/api/orgs`

**Possible causes:**

1. **Origin not configured correctly**
   - Solution: Verify origin domain is `3.141.5.227:5000` (with port!)

2. **Behavior not created**
   - Solution: Check `/api/*` behavior exists in CloudFront

3. **Behavior order wrong**
   - Solution: Move `/api/*` behavior above default `*` behavior

### Issue: CORS errors in browser console

**Possible causes:**

1. **Flask CORS not configured**
   - Solution: Check `backend/app.py` has `CORS(app)` (it should)

2. **CloudFront response headers**
   - Solution: Add `SimpleCORS` response headers policy to `/api/*` behavior

---

## Timeline Summary

| Step | Time | Who Can Do It |
|------|------|---------------|
| 1. Remove GitLab CI variable | 2 min | Anyone with project maintainer access |
| 2. Trigger new pipeline | 10-15 min | Automatic after step 1 |
| 3. Configure CloudFront origin | 3 min | Anyone with AWS CloudFront access |
| 4. Configure CloudFront behavior | 3 min | Same as above |
| 5. Wait for CloudFront deployment | 5-10 min | Automatic |
| **Total** | **~25-35 min** | |

---

## Architecture Diagram

### Before Fix (Current - Broken):
```
User Browser
    ↓
https://immigrow.site/orgs (loads React app from CloudFront/S3)
    ↓
React app tries to fetch: http://3.141.5.227:5000/api/orgs
    ↓
X Browser blocks: "Mixed Content - cannot load HTTP from HTTPS page"
```

### After Fix (Will Work):
```
User Browser
    ↓
https://immigrow.site/orgs (loads React app from CloudFront/S3)
    ↓
React app fetches: /api/orgs (relative URL)
    ↓
Browser resolves to: https://immigrow.site/api/orgs (same origin, HTTPS)
    ↓
CloudFront receives request for /api/orgs
    ↓
CloudFront behavior matches: /api/*
    ↓
CloudFront forwards to: http://3.141.5.227:5000/api/orgs (internal, allowed)
    ↓
EC2 Flask returns: JSON data
    ↓
CloudFront forwards to browser
    ↓
Browser receives JSON data, displays organizations
```

---

## Key Takeaways

1. **Both steps are required** - removing GitLab variable alone won't fix it
2. **CloudFront is the proper solution** - not a workaround, it's the correct architecture
3. **Order matters** - CloudFront behaviors are evaluated top-to-bottom
4. **Port is important** - Origin must be `3.141.5.227:5000` (include `:5000`)
5. **Wait for propagation** - CloudFront changes take 5-10 minutes to deploy globally


---

## After Production is Fixed

Once everything works, consider these improvements:

1. **Set up HTTPS for EC2 backend** (use Application Load Balancer with SSL certificate)
2. **Use environment-specific configs** (staging vs production)
3. **Monitor CloudFront metrics** (request count, error rate, latency)
4. **Set up CloudFront alarms** (alert if 5xx errors spike)

---

## Questions?

If you encounter issues not covered in this guide:

1. Check browser console for specific error messages
2. Check CloudFront monitoring tab for error codes
3. SSH into EC2 and check if backend is responding: `curl http://localhost:5000/api/orgs`
4. Check EC2 security groups allow inbound port 5000
5. Verify CloudFront distribution status is "Deployed"

---

**Last Updated:** 2025-11-12
**Status:** Production broken until both steps completed
**Priority:** High - production site not functional
