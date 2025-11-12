# EC2 Backend Deployment Guide

## Overview

The Flask backend runs on an AWS EC2 instance at `3.141.5.227:5000`. After updating the backend code, you need to deploy it to EC2 for production to work.

---

## What Changed

**Updated backend routes to include `/api` prefix:**
- `/orgs` → `/api/orgs`
- `/orgs/<id>` → `/api/orgs/<id>`
- `/events` → `/api/events`
- `/events/<id>` → `/api/events/<id>`
- `/resources` → `/api/resources`
- `/resources/<id>` → `/api/resources/<id>`

**Why:** The frontend calls `/api/*` endpoints, but the backend routes didn't have the `/api` prefix, causing 404 errors in production.

---

## Deployment Options

### Option 1: SSH and Pull from Git (Recommended)

**Step 1:** SSH into the EC2 instance
```bash
ssh -i /path/to/your-key.pem ec2-user@3.141.5.227
```

**Step 2:** Navigate to the project directory
```bash
cd /path/to/immigrow/backend
```

**Step 3:** Pull the latest changes
```bash
git pull origin main
```

**Step 4:** Restart the Flask/Gunicorn service
```bash
# If using systemd service
sudo systemctl restart immigrow-backend

# OR if running manually
pkill gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app &
```

**Step 5:** Verify it's running
```bash
curl http://localhost:5000/api/orgs
```

You should see JSON data, not a 404 error.

---

### Option 2: Using Docker (If Configured)

If the backend is running in a Docker container:

```bash
# SSH into EC2
ssh -i /path/to/your-key.pem ec2-user@3.141.5.227

# Pull latest code
cd /path/to/immigrow
git pull origin main

# Rebuild and restart container
docker-compose down
docker-compose up -d --build backend

# Verify
curl http://localhost:5000/api/orgs
```

---

### Option 3: Direct File Upload (Not Recommended)

If you can't use Git:

**Step 1:** SCP the updated `app.py` to EC2
```bash
scp -i /path/to/your-key.pem backend/app.py ec2-user@3.141.5.227:/path/to/immigrow/backend/
```

**Step 2:** SSH in and restart the service
```bash
ssh -i /path/to/your-key.pem ec2-user@3.141.5.227
sudo systemctl restart immigrow-backend
```

---

## Verifying Deployment

### 1. Check EC2 Backend Directly

From your local machine:
```bash
curl http://3.141.5.227:5000/api/orgs
```

**Expected:** JSON array of organizations
**If you get connection refused:** Flask/Gunicorn is not running on EC2

### 2. Check EC2 Security Groups

Ensure port 5000 is open in the EC2 security group:
1. Go to AWS Console → EC2 → Security Groups
2. Find the security group attached to the EC2 instance
3. Check **Inbound Rules** - should have:
   - Type: Custom TCP
   - Port: 5000
   - Source: `0.0.0.0/0` (or specific CloudFront IPs)

### 3. Check Flask is Running on EC2

SSH into EC2 and check:
```bash
# Check if gunicorn/flask is running
ps aux | grep gunicorn
ps aux | grep python

# Check what's listening on port 5000
netstat -tlnp | grep 5000
```

---

## Troubleshooting

### Problem: "Connection refused" to EC2

**Cause:** Flask/Gunicorn is not running on EC2

**Solutions:**
1. SSH into EC2
2. Check process: `ps aux | grep gunicorn`
3. If not running, start it:
   ```bash
   cd /path/to/immigrow/backend
   gunicorn -w 4 -b 0.0.0.0:5000 app:app &
   ```
4. Or restart systemd service: `sudo systemctl restart immigrow-backend`

### Problem: Flask running but still getting 404 for `/api/orgs`

**Cause:** Old code is still deployed on EC2

**Solutions:**
1. SSH into EC2
2. Check if the routes have `/api` prefix:
   ```bash
   cd /path/to/immigrow/backend
   grep "@app.route" app.py
   ```
3. If routes don't have `/api`, pull latest code: `git pull origin main`
4. Restart Flask/Gunicorn

### Problem: EC2 security group blocks port 5000

**Cause:** Inbound rules don't allow port 5000

**Solution:**
1. Go to AWS Console → EC2 → Security Groups
2. Find your EC2 instance's security group
3. Edit Inbound Rules
4. Add rule:
   - Type: Custom TCP
   - Port: 5000
   - Source: `0.0.0.0/0` (for testing) or CloudFront IP ranges (for production)

---

## Production Checklist

After deploying backend to EC2:

- [ ] Backend code updated with `/api` prefix
- [ ] Flask/Gunicorn restarted on EC2
- [ ] `curl http://3.141.5.227:5000/api/orgs` returns JSON
- [ ] EC2 security group allows port 5000
- [ ] CloudFront origin configured to point to EC2 (see [CLOUDFRONT_SETUP.md](CLOUDFRONT_SETUP.md))
- [ ] Production site https://immigrow.site/orgs shows data

---

## Current Architecture

```
User Browser
    ↓
https://immigrow.site/orgs
    ↓
CloudFront (needs configuration - see CLOUDFRONT_SETUP.md)
    ↓
EC2: 3.141.5.227:5000
    ↓
Flask routes: /api/orgs, /api/events, /api/resources
    ↓
RDS PostgreSQL Database
```

---

## Who Can Deploy?

**You need:**
- AWS EC2 SSH key (`your-key.pem`)
- SSH access to the EC2 instance
- Or AWS Console access to manage EC2 instances

**Team member responsible:** Anisha Bhaskar Torres (Phase 2 Project Leader - set up EC2 and RDS)

---

## After Backend Deployment

Once the backend is deployed and running with `/api` routes:

1. **Local dev will still work** - Vite proxy routes `/api` → `localhost:5000`
2. **Production will work** - After CloudFront is configured (see [CLOUDFRONT_SETUP.md](CLOUDFRONT_SETUP.md))

---

## Questions?

- **Backend not starting?** Check Flask logs on EC2: `journalctl -u immigrow-backend -f`
- **Database connection issues?** Check RDS connection string in `backend/app.py` line 20
- **CloudFront setup?** See [CLOUDFRONT_SETUP.md](CLOUDFRONT_SETUP.md)
