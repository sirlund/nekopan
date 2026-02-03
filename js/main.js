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
    ui.renderResults(calc);
    ui.renderWarnings(state.breadType, state.mode);
    ui.renderTimeline(state.breadType, state.mode, calc);
    ui.renderInstructions(state.breadType, state.mode);
    ui.updateResultTheme(state.breadType);
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
        ui.updateActiveInput(stateManager.get('activeInput'), stateManager.state);
    });

    // Main slider
    el.mainSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const activeInput = stateManager.get('activeInput');
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

    // Input container clicks (to switch active input)
    el.containerFlour.addEventListener('click', () => activateInput('flour'));
    el.containerHydration.addEventListener('click', () => activateInput('hydration'));

    // Mode buttons
    el.btnOvernight.addEventListener('click', () => setMode('overnight'));
    el.btnExpress.addEventListener('click', () => setMode('express'));
    el.btnDirect.addEventListener('click', () => setMode('direct'));

    // Yeast type buttons
    el.btnYeastDry.addEventListener('click', () => setYeastType('dry'));
    el.btnYeastFresh.addEventListener('click', () => setYeastType('fresh'));
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

/**
 * Activate flour or hydration input
 */
function activateInput(input) {
    stateManager.set('activeInput', input);
    ui.updateActiveInput(input, stateManager.state);
}

// Expose functions for onclick handlers if needed
window.setMode = setMode;
window.setYeastType = setYeastType;
window.activateInput = activateInput;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
