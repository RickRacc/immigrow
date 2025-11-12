# Backend Deployment Instructions

## Context
Backend API pagination changes have been committed but need to be deployed to the EC2 server at `http://3.141.5.227:5000`

## What Changed
- Updated `/api/orgs`, `/api/events`, and `/api/resources` endpoints to support pagination
- Response format changed from array to object with `{ data: [], total, page, per_page, total_pages }`
- Added query parameters: `?page=1&per_page=15`

## Deployment Steps (For Teammate with EC2 Access)

### 1. SSH into the EC2 Server
```bash
ssh -i <your-key.pem> ec2-user@3.141.5.227
# Or whatever your SSH command is
```

### 2. Navigate to Backend Directory
```bash
cd /path/to/backend
# (wherever the backend code is deployed)
```

### 3. Pull Latest Changes
```bash
git pull origin main
```

### 4. Restart the Backend Service
Depending on how the backend is running:

**If using Docker:**
```bash
docker-compose down
docker-compose up -d --build
# Or
docker restart <container-name>
```

**If using systemd:**
```bash
sudo systemctl restart <backend-service-name>
```

**If running directly:**
```bash
# Kill the current process
pkill -f "python.*app.py"
# Or find and kill the PID
ps aux | grep app.py
kill <PID>

# Restart
cd backend
python app.py &
# Or however it's normally started
```

### 5. Verify Deployment
Test that pagination is working:
```bash
curl "http://3.141.5.227:5000/api/events?page=1&per_page=15" | python -m json.tool
```

Expected response should have this structure:
```json
{
  "data": [...],
  "total": 48,
  "page": 1,
  "per_page": 15,
  "total_pages": 4
}
```

### 6. Confirm Tests Pass
Once deployed, the Postman tests in GitLab CI should pass. You can manually test:
```bash
newman run inmigo_collection.json
```

## Current Status
- ✅ Backend code updated locally and committed
- ✅ Backend tests pass locally (pytest)
- ✅ Postman collection updated
- ❌ Postman tests WILL FAIL in CI/CD until backend is deployed
- ❌ Frontend will break until backend is deployed (response format changed)

## Notes
- The frontend pagination changes depend on this backend deployment
- Existing frontend code will need updates to handle the new response format
- All changes are backward compatible via default parameters (page=1, per_page=15)

## Questions?
Contact the team member who made these pagination changes if you encounter any issues during deployment.
