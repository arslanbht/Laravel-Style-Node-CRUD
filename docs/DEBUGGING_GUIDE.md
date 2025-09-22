# Laravel-Style Debugging in Node.js

This Laravel-style Node.js application includes comprehensive debugging functions similar to Laravel's `dd()`, `dump()`, and `ray()` functions.

## Available Debugging Functions

### 1. `dd()` - Dump and Die
**Usage**: `dd(variable1, variable2, ...)`

Dumps variables in a readable format and **stops execution** (like Laravel's `dd()`).

```javascript
// In any controller, middleware, or service
dd(req.body); // Dumps request body and exits

dd(user, posts, 'debug message'); // Dumps multiple variables

dd(); // Shows "No arguments provided"
```

**Example Output**:
```
================================================================================
🔍 DD (Dump and Die) - Debug Output
================================================================================

📦 Argument 1:
────────────────────────────────────────
🔹 Type: object
🔹 Constructor: Object
🔹 Keys: [ 'name', 'email', 'password' ]
🔹 Value:
{
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
}

📍 Stack Trace:
────────────────────────────────────────
   1. UserController.store (/app/Controllers/UserController.js:45:9)
   2. Layer.handle [as handle_request] (/node_modules/express/lib/router/layer.js:95:5)

================================================================================
💀 Process terminated by dd()
================================================================================
```

### 2. `dump()` - Dump without Dying
**Usage**: `dump(variable1, variable2, ...)`

Dumps variables **without stopping execution** (like Laravel's `dump()`).

```javascript
dump(req.body); // Shows request body, continues execution

dump(user.toJSON(), 'User data loaded');

// Continues to next line
res.json({ success: true });
```

### 3. `ddr()` - Dump Request and Die
**Usage**: `ddr(req)` or `ddr(req, 'body', 'params', 'headers')`

Specialized function to dump request data and stop execution.

```javascript
// Dump entire request object
ddr(req);

// Dump specific parts of request
ddr(req, 'body', 'params', 'query');

// In middleware
app.use((req, res, next) => {
    if (req.url.includes('/debug')) {
        ddr(req, 'body', 'headers');
    }
    next();
});
```

### 4. `ray()` - Quick Debug
**Usage**: `ray(variable1, variable2, ...)`

Quick debugging that **doesn't stop execution** and returns the value.

```javascript
const user = ray(await User.find(1)); // Logs and returns user

ray('Processing user:', user.name);

// Chain with ray
const result = ray(someCalculation()).map(x => x * 2);
```

### 5. `ddLog()` - Log to File
**Usage**: `ddLog(variable1, variable2, ...)`

Logs debug data to `storage/logs/debug.log` for production debugging.

```javascript
ddLog(req.body, 'Request received at', new Date());

// File output with timestamp
```

## Usage Examples

### In Controllers

```javascript
const BaseController = require('./BaseController');

class UserController extends BaseController {
    store = this.asyncHandler(async (req, res) => {
        // Debug request body
        ray('Incoming request body:', req.body);
        
        // Validate and dump if needed
        if (!req.body.email) {
            dd('Missing email in request:', req.body);
        }
        
        const user = await User.create(req.body);
        
        // Quick debug without stopping
        dump('User created:', user.toJSON());
        
        return this.created(res, user);
    });
    
    show = this.asyncHandler(async (req, res) => {
        const userId = ray('Looking for user ID:', req.params.id);
        
        const user = await User.find(userId);
        
        if (!user) {
            // Emergency debug - stops here
            dd('User not found!', { 
                requestedId: userId, 
                params: req.params,
                query: req.query 
            });
        }
        
        return this.success(res, user);
    });
}
```

### In Middleware

```javascript
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    
    // Debug authentication
    ray('Auth header:', token);
    
    if (!token) {
        // Debug and stop
        ddr(req, 'headers', 'url', 'method');
    }
    
    // Continue processing...
    next();
};
```

### In Services

```javascript
class UserService extends BaseService {
    async authenticateUser(email, password) {
        // Debug input
        ray('Authentication attempt:', { email, passwordLength: password.length });
        
        const user = await User.findByEmail(email);
        
        if (!user) {
            // Log for production debugging
            ddLog('Authentication failed - user not found:', { 
                email, 
                timestamp: new Date(),
                ip: 'req.ip would go here' 
            });
            throw new Error('Invalid credentials');
        }
        
        // Debug user data (without password)
        dump('User found:', user.toJSON());
        
        return user;
    }
}
```

### Debug Request Data

```javascript
// In any route handler
app.post('/api/users', (req, res) => {
    // Dump full request
    ddr(req);
    
    // Or specific parts
    ddr(req, 'body', 'headers', 'query');
});

// Debug specific request properties
app.use((req, res, next) => {
    ray('Request URL:', req.url);
    ray('Request Method:', req.method);
    ray('User Agent:', req.headers['user-agent']);
    next();
});
```

## Debug Middleware

Use the included `DebugRequestMiddleware` for automatic request debugging:

```javascript
const DebugRequestMiddleware = require('../app/Middleware/DebugRequestMiddleware');

// Debug all requests (development only)
app.use(DebugRequestMiddleware.handle);

// Debug specific routes
app.post('/api/users', DebugRequestMiddleware.dumpBody, userController.store);

// Emergency debug (stops execution)
app.use('/debug', DebugRequestMiddleware.emergency);
```

## Global Helper Functions

These functions are available globally (no imports needed):

```javascript
// Environment helper
const appName = env('APP_NAME', 'Default App');
const isDev = env('APP_ENV') === 'development';

// Config helper
const dbHost = config('database.host');
const jwtSecret = config('jwt.secret');

// Date helpers
const currentTime = now();
const todayStart = today();

// Debug helpers
dd(appName, dbHost, currentTime);
```

## Best Practices

### 1. Environment-Specific Debugging
```javascript
// Only debug in development
if (env('APP_ENV') === 'development') {
    dd(req.body);
}

// Or use ray() which is safe for production
ray('This works in any environment');
```

### 2. Conditional Debugging
```javascript
// Debug specific conditions
if (user.role === 'admin') {
    dump('Admin user detected:', user);
}

// Debug errors
try {
    const result = await someOperation();
} catch (error) {
    dd('Operation failed:', error, { context: req.body });
}
```

### 3. Chain Debugging
```javascript
// Ray returns the value, so you can chain
const processedData = ray(rawData)
    .map(item => item.id)
    .filter(id => id > 0);

// Debug intermediate steps
const user = await User.find(ray('User ID:', req.params.id));
```

### 4. Production Logging
```javascript
// Use ddLog for production debugging
if (env('APP_ENV') === 'production') {
    ddLog('Critical error occurred:', error, req.body);
} else {
    dd('Development error:', error, req.body);
}
```

## Output Examples

### Request Debugging
```javascript
ddr(req, 'body', 'query');
```

**Output**:
```
================================================================================
🌐 DDR (Dump Request and Die) - Request Debug
================================================================================
🔹 Requested Keys: body, query

📋 req.body:
──────────────────────────────
{
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
}

📋 req.query:
──────────────────────────────
{
  page: '1',
  limit: '10',
  sort: 'name'
}
================================================================================
💀 Process terminated by ddr()
================================================================================
```

### Ray Output
```javascript
ray('User login attempt:', { email: 'john@example.com', timestamp: new Date() });
```

**Output**:
```
🔥 RAY DEBUG:
   1. 'User login attempt:'
   2. { email: 'john@example.com', timestamp: 2023-01-01T12:00:00.000Z }
```

## Tips

1. **Use `ray()` for production-safe debugging**
2. **Use `dd()` when you need to stop and inspect**
3. **Use `dump()` for non-blocking inspection**
4. **Use `ddr()` specifically for request debugging**
5. **Use `ddLog()` for production error logging**
6. **Remove debug calls before production deployment**

## Keyboard Shortcuts (if using VS Code)

Create snippets for quick debugging:

```json
{
  "Laravel DD": {
    "prefix": "dd",
    "body": ["dd($1);"],
    "description": "Laravel-style dump and die"
  },
  "Laravel Dump": {
    "prefix": "dump",
    "body": ["dump($1);"],
    "description": "Laravel-style dump"
  },
  "Ray Debug": {
    "prefix": "ray",
    "body": ["ray($1);"],
    "description": "Ray debugging"
  }
}
```

Happy debugging! 🐛🔍
