import { BREAD_SYSTEM } from './data.js';

const STORAGE_KEY = 'nekopan_state';

const DEFAULTS = {
    breadType: 'ciabatta',
    mode: 'overnight',
    flour: 500,
    hydration: 82,
    yeastType: 'dry',
    startTime: null,
    activeInput: 'flour'
};

class StateManager {
    constructor() {
        this.state = this.load();
        this.listeners = [];
    }

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return this.validate({ ...DEFAULTS, ...parsed });
            }
        } catch (e) {
            console.warn('Failed to load state:', e);
        }
        return { ...DEFAULTS };
    }

    validate(state) {
        // Validate breadType
        if (!BREAD_SYSTEM[state.breadType]) {
            state.breadType = 'ciabatta';
        }

        // Validate mode
        const validModes = ['overnight', 'express', 'direct'];
        if (!validModes.includes(state.mode)) {
            state.mode = 'overnight';
        }

        // Validate flour
        state.flour = Math.max(200, Math.min(2000, state.flour || 500));

        // Validate hydration based on bread type
        const system = BREAD_SYSTEM[state.breadType];
        state.hydration = Math.max(
            system.defaults.minHyd,
            Math.min(system.defaults.maxHyd, state.hydration || system.defaults.hydration)
        );

        // Validate yeastType
        if (!['dry', 'fresh'].includes(state.yeastType)) {
            state.yeastType = 'dry';
        }

        return state;
    }

    save() {
        try {
            // Don't persist activeInput (transient UI state)
            const { activeInput, ...persistable } = this.state;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
        } catch (e) {
            console.warn('Failed to save state:', e);
        }
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        this.state[key] = value;
        this.save();
        this.notify();
    }

    update(partial) {
        Object.assign(this.state, partial);
        this.state = this.validate(this.state);
        this.save();
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(fn => fn(this.state));
    }

    reset() {
        this.state = { ...DEFAULTS };
        this.save();
        this.notify();
    }
}

export const stateManager = new StateManager();
export default stateManager;
