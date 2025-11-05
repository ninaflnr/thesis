// Stub implementation for Railway deployment
// Lightweight version without browser automation dependencies

import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

async function main() {
    logger.info('='.repeat(60));
    logger.info('EasyTrade Load Generator - Stub Mode');
    logger.info('='.repeat(60));
    logger.info('Running lightweight stub version');
    logger.info('Full load generation disabled for Railway deployment');

    const easytradeUrl = process.env.EASYTRADE_URL || 'http://localhost';
    logger.info(`Target URL: ${easytradeUrl}`);

    logger.info('Service started successfully');
    logger.info('Keeping process alive...');

    // Keep process running
    setInterval(() => {
        logger.debug('Loadgen stub heartbeat');
    }, 60000);

    // Graceful shutdown handlers
    process.on('SIGTERM', () => {
        logger.info('Received SIGTERM - shutting down gracefully');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        logger.info('Received SIGINT - shutting down gracefully');
        process.exit(0);
    });
}

main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
