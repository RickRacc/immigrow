# CloudFront Configuration for Backend API Routing

## Problem

Currently, when the production site (https://immigrow.site) tries to make API calls to `/api/*` endpoints, CloudFront returns HTML instead of proxying the request to the Flask backend on EC2.

**Symptoms:**
- Organizations, Events, and Resources pages show: `Error: HTTP 404 for /api/orgs`
- The error message contains HTML (`<!doctype html>`) instead of JSON
- Local development works fine because Vite proxy routes `/api` → `localhost:5000`

## Solution

Configure CloudFront distribution `E3VBUSY2EV16W` to route `/api/*` requests to the EC2 backend.

---

## Step-by-Step CloudFront Configuration

### Prerequisites
- AWS Console access with permissions to modify CloudFront distributions
- Backend API running on EC2 at `http://3.141.5.227:5000`

### Step 1: Access CloudFront Distribution

1. Log in to AWS Console
2. Navigate to **CloudFront** service
3. Find and click on distribution ID: `E3VBUSY2EV16W`

### Step 2: Add Backend Origin

1. Click on the **Origins** tab
2. Click **Create origin** button
3. Configure the new origin:
   - **Origin domain:** `3.141.5.227:5000`
   - **Protocol:** HTTP only
   - **HTTP port:** `5000`
   - **Origin path:** Leave empty
   - **Name:** `EC2-Backend` (or any descriptive name)
   - **Enable Origin Shield:** No
   - **Additional settings:** Leave as defaults
4. Click **Create origin**

### Step 3: Add Behavior for API Routes

1. Click on the **Behaviors** tab
2. Click **Create behavior** button
3. Configure the new behavior:
   - **Path pattern:** `/api/*`
   - **Origin and origin groups:** Select `EC2-Backend` (the origin you just created)
   - **Viewer protocol policy:** `Redirect HTTP to HTTPS`
   - **Allowed HTTP methods:** `GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE`
   - **Cache policy:** Select `CachingDisabled` (important for API calls!)
   - **Origin request policy:** Select `AllViewer`
   - **Response headers policy:** Leave as default or select `SimpleCORS` if needed
   - **WAF:** Leave as is (unless you need specific WAF rules)
4. Click **Create behavior**

### Step 4: Verify Behavior Order

1. In the **Behaviors** tab, ensure the `/api/*` behavior is listed **before** the default `*` behavior
2. If not, select the `/api/*` behavior and click **Move up** until it's above the default behavior
3. **Why this matters:** CloudFront evaluates behaviors in order; the first matching pattern wins

### Step 5: Create Invalidation (Optional but Recommended)

1. Click on the **Invalidations** tab
2. Click **Create invalidation**
3. Enter: `/*`
4. Click **Create invalidation**
5. Wait 1-2 minutes for invalidation to complete

---

## Verification Steps

### After CloudFront Configuration:

1. Wait 5-10 minutes for CloudFront to propagate changes
2. Visit https://immigrow.site/orgs (or /events, /resources)
3. You should see data instead of errors

### Testing API Endpoints Directly:

Open your browser console and run:
```javascript
fetch('https://immigrow.site/api/orgs')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

**Expected result:** JSON array of organizations
**Current result (before fix):** HTML error page

---

## Alternative: Update VITE_API_BASE in GitLab CI

If CloudFront configuration is not possible immediately, you can temporarily point the frontend directly to the EC2 backend:

1. Go to GitLab → Settings → CI/CD → Variables
2. Update `VITE_API_BASE`:
   - **Old value:** `http://3.141.5.227:5000`
   - **Keep as is** (this is already correct)
3. The deployed site will call the EC2 backend directly
4. **Downside:** CORS issues may occur, and users will see mixed content warnings (HTTPS site calling HTTP API)

---

## Architecture Diagram

### Current Setup (Not Working):
```
Browser → HTTPS://immigrow.site/api/orgs
         ↓
CloudFront (returns index.html - WRONG!)
         ↓
S3 Bucket (static files only)
```

### After CloudFront Configuration (Working):
```
Browser → HTTPS://immigrow.site/api/orgs
         ↓
CloudFront (sees /api/* pattern)
         ↓
EC2 Backend (3.141.5.227:5000)
         ↓
Returns JSON data
```

---

## Additional Considerations

### HTTPS for Backend (Future Improvement)

Currently, the backend runs on HTTP only. For production, consider:
1. Setting up an Application Load Balancer (ALB) in front of EC2
2. Adding an SSL certificate to the ALB
3. Updating CloudFront origin to use HTTPS
4. Benefits: Better security, no mixed content warnings

### CORS Configuration

The Flask backend should have CORS enabled for the CloudFront domain:
```python
from flask_cors import CORS
CORS(app, origins=['https://immigrow.site'])
```

Check [backend/app.py](backend/app.py) - CORS should already be configured.

---

## Troubleshooting

### Issue: Still getting HTML errors after configuration
**Solution:**
- Check behavior order (must be before default `*`)
- Clear browser cache
- Create CloudFront invalidation for `/*`
- Wait 10 minutes for propagation

### Issue: CORS errors in browser console
**Solution:**
- Verify Flask has `flask-cors` installed and configured
- Check CloudFront response headers policy includes CORS headers
- Consider using `SimpleCORS` response headers policy in behavior

### Issue: 502 Bad Gateway
**Solution:**
- Verify EC2 instance is running: `curl http://3.141.5.227:5000/api/orgs`
- Check EC2 security group allows inbound traffic on port 5000
- Verify Flask is running: SSH into EC2 and check process

---

## Summary

**What we fixed in this PR:**
- ✅ Added automatic deployment to GitLab CI
- ✅ Frontend builds with proper environment variables
- ✅ S3 sync and CloudFront invalidation on every push to `main`

**What still needs to be done:**
- ⚠️ Configure CloudFront origin and behavior for `/api/*` (requires AWS Console access)

**Who can do this:**
- Anyone with AWS Console access to the CloudFront distribution
- Team member who set up the original infrastructure (Lucas?)

**Estimated time:** 10-15 minutes
