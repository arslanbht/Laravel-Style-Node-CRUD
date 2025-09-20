class ServiceContainer {
    constructor() {
        this.bindings = new Map();
        this.instances = new Map();
        this.singletons = new Set();
    }

    // Bind a service
    bind(name, factory, singleton = false) {
        this.bindings.set(name, factory);
        if (singleton) {
            this.singletons.add(name);
        }
        return this;
    }

    // Bind a singleton service
    singleton(name, factory) {
        return this.bind(name, factory, true);
    }

    // Resolve a service
    resolve(name) {
        // Check if it's a singleton and already instantiated
        if (this.singletons.has(name) && this.instances.has(name)) {
            return this.instances.get(name);
        }

        // Get the factory function
        const factory = this.bindings.get(name);
        if (!factory) {
            throw new Error(`Service '${name}' not found in container`);
        }

        // Create the instance
        let instance;
        if (typeof factory === 'function') {
            instance = factory(this);
        } else {
            instance = factory;
        }

        // Store singleton instances
        if (this.singletons.has(name)) {
            this.instances.set(name, instance);
        }

        return instance;
    }

    // Check if service exists
    has(name) {
        return this.bindings.has(name);
    }

    // Register multiple services at once
    register(services) {
        for (const [name, config] of Object.entries(services)) {
            if (config.singleton) {
                this.singleton(name, config.factory);
            } else {
                this.bind(name, config.factory);
            }
        }
        return this;
    }

    // Clear all bindings and instances
    clear() {
        this.bindings.clear();
        this.instances.clear();
        this.singletons.clear();
        return this;
    }

    // Get all registered service names
    getServiceNames() {
        return Array.from(this.bindings.keys());
    }

    // Create a scoped container (child container)
    createScope() {
        const scope = new ServiceContainer();
        
        // Copy bindings from parent
        for (const [name, factory] of this.bindings) {
            scope.bind(name, factory, this.singletons.has(name));
        }
        
        // Copy singleton instances from parent
        for (const [name, instance] of this.instances) {
            scope.instances.set(name, instance);
        }
        
        return scope;
    }
}

// Global container instance
const container = new ServiceContainer();

module.exports = { ServiceContainer, container };
