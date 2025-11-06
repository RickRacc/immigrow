# PostgreSQL Setup Guide for Immigrow

PostgreSQL is the **recommended database** for Immigrow Phase 2. This guide covers installation and configuration.

## Why PostgreSQL?

✅ **Production-ready** - Used by major platforms (Heroku, AWS RDS)
✅ **Better for complex queries** - Superior to MySQL for relationships
✅ **Free and open source** - No licensing costs
✅ **Industry standard** - Most popular for Python/Flask apps
✅ **Built-in JSON support** - Better for flexible schemas

## Installation

### Windows

**Option 1: Official Installer (Recommended)**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer (includes pgAdmin GUI)
3. Remember your password during installation!
4. Default port: 5432

**Option 2: Using Chocolatey**
```powershell
choco install postgresql
```

### macOS

**Option 1: Homebrew (Recommended)**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Option 2: Postgres.app**
Download from: https://postgresapp.com/

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Linux (Red Hat/CentOS)

```bash
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Configuration

### 1. Create Database

**Windows (using psql from Start Menu):**
```sql
-- Opens psql command line
CREATE DATABASE immigrow;
```

**macOS/Linux:**
```bash
# Switch to postgres user
sudo -u postgres psql

# In psql:
CREATE DATABASE immigrow;

# Exit psql
\q
```

**Or use one-liner:**
```bash
# macOS/Linux
sudo -u postgres createdb immigrow

# Windows (from cmd/PowerShell)
createdb -U postgres immigrow
```

### 2. Configure Environment Variables

Copy the example file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:

```bash
# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here  # Set during installation
POSTGRES_DATABASE=immigrow
```

### 3. Verify Connection

Test your setup:
```bash
python test_setup.py
```

Should see:
```
✓ PostgreSQL: localhost:5432/immigrow
✓ Database tables created successfully
```

## Common Issues & Solutions

### Issue: "FATAL: password authentication failed"

**Solution 1:** Check your password
```bash
# Reset password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'new_password';
```

**Solution 2:** Update `.env` with correct password
```bash
POSTGRES_PASSWORD=your_actual_password
```

### Issue: "could not connect to server"

**Solution:** Start PostgreSQL service

**Windows:**
```powershell
# Check service status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-15  # or your version
```

**macOS:**
```bash
brew services start postgresql@15
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

### Issue: "database 'immigrow' does not exist"

**Solution:** Create the database
```bash
# Option 1: Using psql
psql -U postgres
CREATE DATABASE immigrow;
\q

# Option 2: Using createdb
createdb -U postgres immigrow
```

### Issue: "psycopg2 not installed" or "ImportError: psycopg2"

**Solution:** Install Python PostgreSQL driver
```bash
pip install psycopg2-binary
# or if already installed:
pip install --upgrade psycopg2-binary
```

## PostgreSQL GUI Tools (Optional)

### pgAdmin (Recommended)
- **Included** with Windows installer
- **Download:** https://www.pgadmin.org/download/
- Full-featured database management tool

### DBeaver (Alternative)
- **Download:** https://dbeaver.io/download/
- Supports multiple databases
- Lighter than pgAdmin

### VS Code Extension
- **Install:** "PostgreSQL" by Chris Kolkman
- Manage databases directly in VS Code

## Using PostgreSQL with Immigrow

### Initialize Database
```bash
cd backend
python app.py  # Auto-creates tables on first run

# Or manually:
flask init-db
```

### Seed with Data
```bash
python seed_database.py
```

Should see:
```
✓ Using PostgreSQL: localhost:5432/immigrow
[2/6] Fetching and seeding organizations from ProPublica...
✓ Seeded 10 organizations
[3/6] Fetching and seeding legal resources from CourtListener...
✓ Seeded 15 legal resources
...
```

### Query Data
```bash
# Using psql
psql -U postgres -d immigrow

# Check tables
\dt

# Count records
SELECT COUNT(*) FROM event;
SELECT COUNT(*) FROM organization;
SELECT COUNT(*) FROM resource;

# View sample data
SELECT id, name, city, state FROM organization LIMIT 5;
```

## Database Management

### Backup Database
```bash
pg_dump -U postgres immigrow > immigrow_backup.sql
```

### Restore Database
```bash
psql -U postgres immigrow < immigrow_backup.sql
```

### Reset Database (Drop all data)
```bash
flask reset-db
# Or:
python -c "from app import app, db; app.app_context().push(); db.drop_all(); db.create_all()"
```

### View Database Stats
```bash
# Via API
curl http://localhost:5000/stats

# Via psql
psql -U postgres -d immigrow -c "
SELECT
  (SELECT COUNT(*) FROM event) as events,
  (SELECT COUNT(*) FROM organization) as organizations,
  (SELECT COUNT(*) FROM resource) as resources;
"
```

## Production Deployment

### AWS RDS PostgreSQL

1. Create RDS instance in AWS Console
2. Note the endpoint URL
3. Set environment variable:
```bash
DATABASE_URL=postgresql://username:password@your-db.region.rds.amazonaws.com:5432/immigrow
```

### Heroku PostgreSQL

1. Add Heroku Postgres addon:
```bash
heroku addons:create heroku-postgresql:mini
```

2. Database URL automatically set as `DATABASE_URL`
3. Initialize database:
```bash
heroku run flask init-db
heroku run flask seed-db
```

### Docker PostgreSQL

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: immigrow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

## Performance Tips

### 1. Enable Connection Pooling
Already configured in SQLAlchemy (handles automatically)

### 2. Add Indexes (Already done in models.py)
```python
# Events
date = db.Column(db.Date, nullable=False, index=True)
location = db.Column(db.String(255), nullable=False, index=True)

# Organizations
city = db.Column(db.String(100), nullable=False, index=True)
topic = db.Column(db.String(100), nullable=False, index=True)
```

### 3. Monitor Query Performance
```sql
-- Enable query logging
ALTER DATABASE immigrow SET log_statement = 'all';

-- View slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;
```

## Quick Reference

### Connection String Formats

**Development (Individual Variables):**
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=mypassword
POSTGRES_DATABASE=immigrow
```

**Production (Single URL):**
```bash
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/immigrow
```

### Common Commands

```bash
# Start PostgreSQL
# Windows: Start-Service postgresql-x64-15
# macOS: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# Stop PostgreSQL
# Windows: Stop-Service postgresql-x64-15
# macOS: brew services stop postgresql@15
# Linux: sudo systemctl stop postgresql

# Restart PostgreSQL
# Windows: Restart-Service postgresql-x64-15
# macOS: brew services restart postgresql@15
# Linux: sudo systemctl restart postgresql

# Connect to database
psql -U postgres -d immigrow

# List databases
psql -U postgres -l

# Create database
createdb -U postgres immigrow

# Drop database
dropdb -U postgres immigrow
```

## Alternatives to PostgreSQL

If you can't use PostgreSQL, the app supports:

### SQLite (No setup required)
```bash
# Just delete all database variables from .env
# App will automatically use SQLite
```

### MySQL
```bash
# In .env:
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=immigrow
```

## Support

For PostgreSQL-specific issues:
- **Official Docs:** https://www.postgresql.org/docs/
- **Community:** https://www.postgresql.org/community/
- **Stack Overflow:** Tag [postgresql]

For Immigrow integration issues, see [SETUP.md](SETUP.md)
