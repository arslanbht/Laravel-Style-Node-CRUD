const util = require('util');
const fs = require('fs');
const path = require('path');

/**
 * Laravel-style dd() (dump and die) function for Node.js
 * Dumps variables in a readable format and exits the process
 */
function dd(...args) {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DD (Dump and Die) - Debug Output');
    console.log('='.repeat(80));
    
    if (args.length === 0) {
        console.log('📋 No arguments provided to dd()');
    } else {
        args.forEach((arg, index) => {
            console.log(`\n📦 Argument ${index + 1}:`);
            console.log('─'.repeat(40));
            
            // Handle different types of data
            if (arg === null) {
                console.log('🔹 Type: null');
                console.log('🔹 Value: null');
            } else if (arg === undefined) {
                console.log('🔹 Type: undefined');
                console.log('🔹 Value: undefined');
            } else if (typeof arg === 'string') {
                console.log('🔹 Type: string');
                console.log('🔹 Length:', arg.length);
                console.log('🔹 Value:', JSON.stringify(arg));
            } else if (typeof arg === 'number') {
                console.log('🔹 Type: number');
                console.log('🔹 Value:', arg);
            } else if (typeof arg === 'boolean') {
                console.log('🔹 Type: boolean');
                console.log('🔹 Value:', arg);
            } else if (typeof arg === 'function') {
                console.log('🔹 Type: function');
                console.log('🔹 Name:', arg.name || 'anonymous');
                console.log('🔹 Source:', arg.toString().substring(0, 200) + '...');
            } else if (Array.isArray(arg)) {
                console.log('🔹 Type: array');
                console.log('🔹 Length:', arg.length);
                console.log('🔹 Value:');
                console.log(util.inspect(arg, { 
                    colors: true, 
                    depth: null, 
                    maxArrayLength: null,
                    maxStringLength: null,
                    compact: false
                }));
            } else if (arg instanceof Date) {
                console.log('🔹 Type: Date');
                console.log('🔹 Value:', arg.toISOString());
                console.log('🔹 Timestamp:', arg.getTime());
            } else if (arg instanceof Error) {
                console.log('🔹 Type: Error');
                console.log('🔹 Name:', arg.name);
                console.log('🔹 Message:', arg.message);
                console.log('🔹 Stack:', arg.stack);
            } else if (typeof arg === 'object') {
                console.log('🔹 Type: object');
                console.log('🔹 Constructor:', arg.constructor.name);
                console.log('🔹 Keys:', Object.keys(arg));
                console.log('🔹 Value:');
                console.log(util.inspect(arg, { 
                    colors: true, 
                    depth: null, 
                    maxArrayLength: null,
                    maxStringLength: null,
                    compact: false,
                    showHidden: false
                }));
            } else {
                console.log('🔹 Type:', typeof arg);
                console.log('🔹 Value:', util.inspect(arg, { colors: true, depth: null }));
            }
        });
    }
    
    // Show stack trace
    console.log('\n📍 Stack Trace:');
    console.log('─'.repeat(40));
    const stack = new Error().stack;
    const stackLines = stack.split('\n').slice(2); // Remove Error and dd() from stack
    stackLines.forEach((line, index) => {
        if (index < 5) { // Show only first 5 stack frames
            console.log(`   ${index + 1}. ${line.trim()}`);
        }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('💀 Process terminated by dd()');
    console.log('='.repeat(80) + '\n');
    
    // Exit the process
    process.exit(0);
}

/**
 * Laravel-style dump() function - dumps without dying
 * Useful for debugging without stopping execution
 */
function dump(...args) {
    console.log('\n' + '─'.repeat(60));
    console.log('🔍 DUMP - Debug Output');
    console.log('─'.repeat(60));
    
    if (args.length === 0) {
        console.log('📋 No arguments provided to dump()');
    } else {
        args.forEach((arg, index) => {
            console.log(`\n📦 Variable ${index + 1}:`);
            console.log(util.inspect(arg, { 
                colors: true, 
                depth: null, 
                maxArrayLength: null,
                maxStringLength: null,
                compact: false
            }));
        });
    }
    
    console.log('─'.repeat(60) + '\n');
}

/**
 * Dump request data (Laravel-style)
 * Usage: ddr(req) or ddr(req, 'body', 'params')
 */
function ddr(req, ...keys) {
    console.log('\n' + '='.repeat(80));
    console.log('🌐 DDR (Dump Request and Die) - Request Debug');
    console.log('='.repeat(80));
    
    if (!req) {
        console.log('❌ No request object provided');
        process.exit(0);
    }
    
    const requestData = {
        method: req.method,
        url: req.url,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        ip: req.ip,
        ips: req.ips,
        headers: req.headers,
        query: req.query,
        params: req.params,
        body: req.body,
        cookies: req.cookies,
        user: req.user,
        userId: req.userId,
        authenticated: !!req.user
    };
    
    if (keys.length > 0) {
        console.log('🔹 Requested Keys:', keys.join(', '));
        keys.forEach(key => {
            console.log(`\n📋 req.${key}:`);
            console.log('─'.repeat(30));
            console.log(util.inspect(requestData[key], { 
                colors: true, 
                depth: null, 
                compact: false 
            }));
        });
    } else {
        console.log('📋 Full Request Object:');
        console.log('─'.repeat(40));
        console.log(util.inspect(requestData, { 
            colors: true, 
            depth: null, 
            compact: false 
        }));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('💀 Process terminated by ddr()');
    console.log('='.repeat(80) + '\n');
    
    process.exit(0);
}

/**
 * Log to file (for production debugging)
 */
function ddLog(...args) {
    const timestamp = new Date().toISOString();
    const logDir = path.join(process.cwd(), 'storage', 'logs');
    const logFile = path.join(logDir, 'debug.log');
    
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logData = {
        timestamp,
        data: args.map(arg => util.inspect(arg, { depth: null, colors: false }))
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logData, null, 2) + '\n\n');
    console.log(`🔍 Debug data logged to: ${logFile}`);
}

/**
 * Pretty print JSON with colors
 */
function prettyJson(obj) {
    console.log(util.inspect(obj, { 
        colors: true, 
        depth: null, 
        compact: false 
    }));
}

/**
 * Laravel-style ray() function for debugging
 * Sends data to a debug console without stopping execution
 */
function ray(...args) {
    console.log('\n🔥 RAY DEBUG:');
    args.forEach((arg, index) => {
        console.log(`   ${index + 1}.`, util.inspect(arg, { 
            colors: true, 
            depth: 2, 
            compact: true 
        }));
    });
    console.log('');
    return args.length === 1 ? args[0] : args;
}

module.exports = {
    dd,
    dump,
    ddr,
    ddLog,
    prettyJson,
    ray
};
