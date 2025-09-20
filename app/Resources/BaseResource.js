class BaseResource {
    constructor(resource) {
        this.resource = resource;
    }

    // Transform the resource into an array
    toArray() {
        if (Array.isArray(this.resource)) {
            return this.resource.map(item => this.transformItem(item));
        }
        return this.transformItem(this.resource);
    }

    // Transform a single item - override in child classes
    transformItem(item) {
        if (item && typeof item.toJSON === 'function') {
            return item.toJSON();
        }
        return item;
    }

    // Convert to JSON
    toJSON() {
        return this.toArray();
    }

    // Static method to create collection
    static collection(resources) {
        return new this(resources);
    }

    // Static method to create single resource
    static make(resource) {
        return new this(resource);
    }

    // Add metadata to response
    withMeta(meta) {
        const data = this.toArray();
        return {
            data,
            meta
        };
    }

    // Add additional data to response
    additional(additional) {
        const data = this.toArray();
        return {
            data,
            ...additional
        };
    }

    // Wrap response with custom wrapper
    wrap(wrapper) {
        const data = this.toArray();
        return {
            [wrapper]: data
        };
    }

    // Conditional transformation
    when(condition, callback) {
        if (condition) {
            return callback(this);
        }
        return this;
    }

    // Merge additional attributes
    merge(attributes) {
        const data = this.toArray();
        if (Array.isArray(data)) {
            return data.map(item => ({ ...item, ...attributes }));
        }
        return { ...data, ...attributes };
    }

    // Only include specified attributes
    only(attributes) {
        const data = this.toArray();
        const pick = (obj, keys) => {
            const result = {};
            keys.forEach(key => {
                if (obj.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
            });
            return result;
        };

        if (Array.isArray(data)) {
            return data.map(item => pick(item, attributes));
        }
        return pick(data, attributes);
    }

    // Exclude specified attributes
    except(attributes) {
        const data = this.toArray();
        const omit = (obj, keys) => {
            const result = { ...obj };
            keys.forEach(key => delete result[key]);
            return result;
        };

        if (Array.isArray(data)) {
            return data.map(item => omit(item, attributes));
        }
        return omit(data, attributes);
    }
}

module.exports = BaseResource;
