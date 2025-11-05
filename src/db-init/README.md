# 🚀 Railway Database Initialization Service

## Problem Solved
Running the database initialization from your local machine fails because:
- ❌ Railway's internal addresses don't work from outside
- ❌ Railway's public proxy has connection issues and incurs egress fees
- ✅ **Solution:** Deploy this service **inside Railway** to use private network (free!)

## What This Service Does
- Runs **once** inside Railway's network
- Connects to MySQL using internal/private address
- Creates all 12 required tables
- Inserts test data (accounts, instruments, packages)
- Exits after completion

## 🎯 How to Deploy (3 Steps)

### Step 1: Create New Service in Railway

1. Go to **Railway Dashboard**
2. Click your project
3. Click **"+ New"** → **"Empty Service"**
4. Name it: `db-init`

### Step 2: Connect to This Folder

1. In the new `db-init` service, click **"Settings"**
2. Under **"Source"**, click **"Connect Repo"** (or use GitHub deployment)
3. Set **Root Directory** to: `db-init`
   - Or if deploying manually, the service needs these 3 files:
     - `package.json`
     - `init-db.js`
     - `Dockerfile`

### Step 3: Add Environment Variables

In the `db-init` service **Variables** tab, add these **shared** variables:

```
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
```

Or use shared variables:
```
MYSQLHOST=${{shared.MYSQLHOST}}
MYSQLPORT=${{shared.MYSQLPORT}}
MYSQLUSER=${{shared.MYSQLUSER}}
MYSQLPASSWORD=${{shared.MYSQLPASSWORD}}
MYSQLDATABASE=${{shared.MYSQLDATABASE}}
```

### Step 4: Deploy and Watch Logs

1. Railway will automatically deploy the service
2. Click **"Logs"** tab to watch the initialization
3. You should see:
   ```
   🚀 Starting Railway MySQL Database Initialization...
   ✅ Connected to Railway MySQL database
   ✅ Existing tables dropped
   ✅ All tables created
   ✅ Initial data inserted
   🎉 Database initialization completed successfully!
   ```

### Step 5: Remove or Stop the Service (Optional)

Once initialization is complete:
- **Option 1:** Delete the `db-init` service (it's done its job)
- **Option 2:** Stop the service (so it doesn't keep restarting)

## ✅ What Gets Created

### Tables (12 total)
- Packages (3 tiers: Basic, Pro, Premium)
- Products
- Instruments (10 stocks: AAPL, GOOGL, MSFT, etc.)
- Accounts (2 test accounts with balances)
- Balance
- Balancehistory
- CreditCardOrderStatus (5 statuses)
- CreditCards
- CreditCardOrders
- Ownedinstruments
- Pricing
- Trades

### Test Accounts
**Owner Account:**
- Username: `owneristhebest`
- Balance: $10,000

**Test User:**
- Username: `userName`
- Balance: $5,000

## 🔧 Troubleshooting

### Service Keeps Restarting
This is normal! The service:
1. Runs initialization
2. Waits 30 seconds (so you can see logs)
3. Exits
4. Railway restarts it (normal behavior)

**Solution:** Just delete or stop the service after first successful run.

### Connection Failed
Make sure environment variables are set correctly:
- Check they reference your MySQL service
- Use Railway's internal addresses (not public)
- Format: `${{MySQL.MYSQLHOST}}` or `${{shared.MYSQLHOST}}`

### Tables Already Exist
No problem! The script drops existing tables first, so it's safe to run multiple times.

## 🎉 Success!

Once you see "Database initialization completed successfully!" in the logs:
- ✅ All tables created
- ✅ Test data inserted
- ✅ Your other services (contentcreator, pricing-service, etc.) will now work!

You can now delete or stop this `db-init` service - it's done its job!

## 📝 Files in This Folder

- **`package.json`** - Node.js dependencies (mysql2)
- **`init-db.js`** - Initialization script with all SQL
- **`Dockerfile`** - Container configuration for Railway
- **`README.md`** - This file

## 💡 Why This Approach Works

✅ Runs **inside Railway's network** (free, no egress fees)
✅ Uses **private MySQL address** (fast, secure)
✅ **One-time** execution (no recurring costs)
✅ **No local MySQL client** needed
✅ **Visible logs** in Railway dashboard

Perfect for Railway deployment! 🚀

