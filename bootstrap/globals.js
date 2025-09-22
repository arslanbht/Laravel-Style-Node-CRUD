/**
 * Laravel-style Global Helper Functions
 * Makes debugging functions available globally without imports
 */

const { dd, dump, ddr, ddLog, prettyJson, ray } = require('../helpers/dd');

// Make debugging functions globally available
global.dd = dd;
global.dump = dump;
global.ddr = ddr;
global.ddLog = ddLog;
global.prettyJson = prettyJson;
global.ray = ray;

// Additional Laravel-style global helpers
global.env = (key, defaultValue = null) => {
    return process.env[key] || defaultValue;
};

global.config = (key, defaultValue = null) => {
    // Simple config helper - can be extended
    const configs = {
        'app.name': process.env.APP_NAME || 'Laravel Style Node CRUD',
        'app.env': process.env.APP_ENV || 'development',
        'app.port': process.env.APP_PORT || 3000,
        'app.url': process.env.APP_URL || 'http://localhost:3000',
        'database.host': process.env.DB_HOST || 'localhost',
        'database.port': process.env.DB_PORT || 3306,
        'database.name': process.env.DB_DATABASE || 'laravel_node_crud',
        'jwt.secret': process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        'jwt.expires': process.env.JWT_EXPIRES_IN || '24h'
    };
    
    return configs[key] || defaultValue;
};

global.now = () => new Date();

global.today = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

console.log('🌍 Global Laravel-style helpers loaded');
console.log('   Available functions: dd(), dump(), ddr(), ray(), env(), config()');

module.exports = {
    dd,
    dump,
    ddr,
    ddLog,
    prettyJson,
    ray,
    env: global.env,
    config: global.config,
    now: global.now,
    today: global.today
};
