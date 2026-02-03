import stateManager from './state.js';
import { calculateIngredients } from './calculator.js';
import { BREAD_SYSTEM } from './data.js';
import * as ui from './ui.js';

/**
 * Initialize application
 */
function init() {
    const elements = ui.initElements();
    const state = stateManager.state;

    // Set start time if not saved
    if (!state.startTime) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        stateManager.set('startTime', timeStr);
    }

    // Restore UI from saved state
    ui.syncInputsFromState(state);

    // Subscribe to state changes
    stateManager.subscribe(onStateChange);

    // Wire up event listeners
    setupEventListeners(elements);

    // Initial render
    onStateChange(state);
}

/**
 * Handle state changes - recalculate and re-render
 */
function onStateChange(state) {
    const calc = calculateIngredients(state);
    ui.renderResults(calc, state);
    ui.renderStrategyInfo(state.breadType, state.mode);
    ui.renderTimeline(state.breadType, state.mode, calc);
    ui.renderInstructions(state.breadType, state.mode);
}

/**
 * Setup all event listeners
 */
function setupEventListeners(el) {
    // Bread type selector
    el.breadSelector.addEventListener('change', (e) => {
        const breadType = e.target.value;
        const system = BREAD_SYSTEM[breadType];
        stateManager.update({
            breadType: breadType,
            hydration: system.defaults.hydration
        });
    });

    // Mode buttons
    el.btnOvernight.addEventListener('click', () => setMode('overnight'));
    el.btnExpress.addEventListener('click', () => setMode('express'));
    el.btnDirect.addEventListener('click', () => setMode('direct'));

    // Yeast type buttons
    el.btnYeastDry.addEventListener('click', () => setYeastType('dry'));
    el.btnYeastFresh.addEventListener('click', () => setYeastType('fresh'));

    // Main slider
    el.mainSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const activeInput = stateManager.get('activeInput') || 'flour';
        if (activeInput === 'flour') {
            stateManager.set('flour', val);
        } else {
            stateManager.set('hydration', val);
        }
    });

    // Start time picker
    el.startTime.addEventListener('input', (e) => {
        stateManager.set('startTime', e.target.value);
    });

    // Flour input container click
    el.containerFlour.addEventListener('click', () => {
        stateManager.set('activeInput', 'flour');
        ui.updateActiveInput('flour', stateManager.state);
    });

    // Hydration input container click
    el.containerHydration.addEventListener('click', () => {
        stateManager.set('activeInput', 'hydration');
        ui.updateActiveInput('hydration', stateManager.state);
    });
}

/**
 * Set fermentation mode
 */
function setMode(mode) {
    stateManager.set('mode', mode);
    ui.updateModeButtons(mode);
}

/**
 * Set yeast type
 */
function setYeastType(type) {
    stateManager.set('yeastType', type);
    ui.updateYeastButtons(type);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
