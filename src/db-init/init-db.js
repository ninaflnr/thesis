// init-db.js
// Railway service to initialize MySQL database (runs inside Railway network)
const mysql = require('mysql2/promise');

// All SQL statements as strings
const SQL_STATEMENTS = {
    dropTables: [
        'DROP TABLE IF EXISTS Trades',
        'DROP TABLE IF EXISTS Pricing',
        'DROP TABLE IF EXISTS Ownedinstruments',
        'DROP TABLE IF EXISTS Balancehistory',
        'DROP TABLE IF EXISTS Balance',
        'DROP TABLE IF EXISTS CreditCardOrders',
        'DROP TABLE IF EXISTS CreditCardOrderStatus',
        'DROP TABLE IF EXISTS CreditCards',
        'DROP TABLE IF EXISTS Accounts',
        'DROP TABLE IF EXISTS Instruments',
        'DROP TABLE IF EXISTS Products',
        'DROP TABLE IF EXISTS Packages'
    ],
    createTables: [
        `CREATE TABLE Packages (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255) NOT NULL,
            TransactionLimit INT NOT NULL,
            Price DECIMAL(10,2) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Products (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255) NOT NULL,
            ShortDescription VARCHAR(500),
            LongDescription TEXT,
            ImageLocation VARCHAR(500),
            Price DECIMAL(10,2) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Instruments (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Code VARCHAR(50) NOT NULL UNIQUE,
            Description VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Accounts (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            PackageId INT NOT NULL,
            FirstName VARCHAR(50) NOT NULL,
            LastName VARCHAR(50) NOT NULL,
            Username VARCHAR(255) NOT NULL UNIQUE,
            Email VARCHAR(255) NOT NULL,
            HashedPassword VARCHAR(255) NOT NULL,
            Origin VARCHAR(255) NOT NULL,
            CreationDate DATETIME NOT NULL,
            PackageActivationDate DATETIME NOT NULL,
            AccountActive BOOLEAN DEFAULT TRUE,
            Address VARCHAR(255) NOT NULL,
            CONSTRAINT FK_Accounts_Packages FOREIGN KEY (PackageId) REFERENCES Packages(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Balance (
            AccountId INT PRIMARY KEY,
            Amount DECIMAL(15,2) NOT NULL DEFAULT 0,
            CONSTRAINT FK_Balance_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Balancehistory (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            AccountId INT NOT NULL,
            Amount DECIMAL(15,2) NOT NULL,
            ActionDate DATETIME NOT NULL,
            CONSTRAINT FK_Balancehistory_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE CreditCardOrderStatus (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Status VARCHAR(50) NOT NULL UNIQUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE CreditCards (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            AccountId INT NOT NULL,
            CardNumber VARCHAR(16) NOT NULL,
            CardType VARCHAR(50) NOT NULL,
            CVV VARCHAR(3) NOT NULL,
            ExpirationDate VARCHAR(7) NOT NULL,
            CreationDate DATETIME NOT NULL,
            CONSTRAINT FK_CreditCards_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE CreditCardOrders (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            AccountId INT NOT NULL,
            StatusId INT NOT NULL,
            OrderDate DATETIME NOT NULL,
            CardType VARCHAR(50) NOT NULL,
            CONSTRAINT FK_CreditCardOrders_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id),
            CONSTRAINT FK_CreditCardOrders_Status FOREIGN KEY (StatusId) REFERENCES CreditCardOrderStatus(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Ownedinstruments (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            AccountId INT NOT NULL,
            InstrumentId INT NOT NULL,
            Quantity INT NOT NULL,
            CONSTRAINT FK_Ownedinstruments_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id),
            CONSTRAINT FK_Ownedinstruments_Instruments FOREIGN KEY (InstrumentId) REFERENCES Instruments(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Pricing (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            Timestamp DATETIME NOT NULL,
            InstrumentId INT NOT NULL,
            Open DECIMAL(10,2) NOT NULL,
            High DECIMAL(10,2) NOT NULL,
            Low DECIMAL(10,2) NOT NULL,
            Close DECIMAL(10,2) NOT NULL,
            CONSTRAINT FK_Pricing_Instruments FOREIGN KEY (InstrumentId) REFERENCES Instruments(Id),
            INDEX idx_pricing_timestamp (Timestamp),
            INDEX idx_pricing_instrument (InstrumentId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

        `CREATE TABLE Trades (
            Id INT AUTO_INCREMENT PRIMARY KEY,
            AccountId INT NOT NULL,
            InstrumentId INT NOT NULL,
            Price DECIMAL(10,2) NOT NULL,
            Quantity INT NOT NULL,
            Direction VARCHAR(10) NOT NULL,
            TimestampOpen DATETIME NOT NULL,
            TimestampClose DATETIME,
            CONSTRAINT FK_Trades_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts(Id),
            CONSTRAINT FK_Trades_Instruments FOREIGN KEY (InstrumentId) REFERENCES Instruments(Id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ],
    insertData: [
        `INSERT INTO Packages (Name, TransactionLimit, Price) VALUES
        ('Basic', 10, 0.00),
        ('Pro', 100, 9.99),
        ('Premium', 1000, 29.99)`,

        `INSERT INTO CreditCardOrderStatus (Status) VALUES
        ('Pending'),
        ('Approved'),
        ('Shipped'),
        ('Delivered'),
        ('Cancelled')`,

        `INSERT INTO Instruments (Code, Description) VALUES
        ('AAPL', 'Apple Inc.'),
        ('GOOGL', 'Alphabet Inc.'),
        ('MSFT', 'Microsoft Corporation'),
        ('AMZN', 'Amazon.com Inc.'),
        ('TSLA', 'Tesla Inc.'),
        ('META', 'Meta Platforms Inc.'),
        ('NVDA', 'NVIDIA Corporation'),
        ('JPM', 'JPMorgan Chase & Co.'),
        ('V', 'Visa Inc.'),
        ('WMT', 'Walmart Inc.')`,

        `INSERT INTO Accounts (PackageId, FirstName, LastName, Username, Email, HashedPassword, Origin, CreationDate, PackageActivationDate, AccountActive, Address) VALUES
        (2, 'EASYTRADE', 'OWNER', 'owneristhebest', 'easytrade.owner@dynatrace.com', '811210924d294539f709c651ae477768110bdf39005c877bb32bf495b56ce6bd', 'INTERNAL', '2021-12-19 22:24:42', '2021-12-19 22:24:42', TRUE, '2 Burton coves Port Carlyton HS2 9AN'),
        (1, 'Lab', 'User', 'userName', 'lab.user@dynatrace.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'PRESET', '2021-12-19 22:24:42', '2021-12-19 22:24:42', TRUE, '123 Test Street')`,

        `INSERT INTO Balance (AccountId, Amount) VALUES (1, 10000.00), (2, 5000.00)`
    ]
};

async function initializeDatabase() {
    console.log('🚀 Starting Railway MySQL Database Initialization...\n');

    const config = {
        host: process.env.MYSQLHOST || 'mysql.railway.internal',
        port: parseInt(process.env.MYSQLPORT || '3306'),
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway'
    };

    console.log('📡 Connecting to Railway MySQL database...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}\n`);

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to Railway MySQL database\n');
    } catch (error) {
        console.error('❌ Failed to connect to database:');
        console.error(error.message);
        process.exit(1);
    }

    try {
        // Drop existing tables
        console.log('🗑️  Dropping existing tables...');
        for (const sql of SQL_STATEMENTS.dropTables) {
            await connection.query(sql);
        }
        console.log('✅ Existing tables dropped\n');

        // Create tables
        console.log('🏗️  Creating tables...');
        for (const sql of SQL_STATEMENTS.createTables) {
            await connection.query(sql);
        }
        console.log('✅ All tables created\n');

        // Insert initial data
        console.log('📊 Inserting initial data...');
        for (const sql of SQL_STATEMENTS.insertData) {
            await connection.query(sql);
        }
        console.log('✅ Initial data inserted\n');

        console.log('🎉 Database initialization completed successfully!');
        console.log('\n📊 Created tables:');
        console.log('   - Packages (3 tiers)');
        console.log('   - Products');
        console.log('   - Instruments (10 stocks)');
        console.log('   - Accounts (2 test accounts)');
        console.log('   - Balance');
        console.log('   - Balancehistory');
        console.log('   - CreditCardOrderStatus (5 statuses)');
        console.log('   - CreditCards');
        console.log('   - CreditCardOrders');
        console.log('   - Ownedinstruments');
        console.log('   - Pricing');
        console.log('   - Trades\n');

        console.log('✅ Your Railway MySQL database is ready!');
        console.log('   All EasyTrade services can now connect and work properly.\n');

        // Keep the service running for a bit so logs are visible
        console.log('⏰ Service will exit in 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));

    } catch (error) {
        console.error('❌ Error during initialization:');
        console.error(error.message);
        console.error(error.sql || '');
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed.');
        }
    }
}

initializeDatabase().catch(console.error);

