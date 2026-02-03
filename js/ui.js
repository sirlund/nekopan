import { BREAD_SYSTEM, FERMENTATION_MODES, INSTRUCTIONS } from './data.js';
import { buildTimeline } from './calculator.js';

// DOM element cache
let el = null;

/**
 * Initialize and cache DOM element references
 */
export function initElements() {
    el = {
        breadSelector: document.getElementById('breadTypeSelector'),
        flourInput: document.getElementById('flourInput'),
        hydrationInput: document.getElementById('hydrationInput'),
        mainSlider: document.getElementById('mainSlider'),
        startTime: document.getElementById('startTime'),

        // Containers
        containerFlour: document.getElementById('container-flour'),
        containerHydration: document.getElementById('container-hydration'),

        // Mode buttons
        btnOvernight: document.getElementById('btn-overnight'),
        btnExpress: document.getElementById('btn-express'),
        btnDirect: document.getElementById('btn-direct'),

        // Yeast buttons
        btnYeastDry: document.getElementById('btn-yeast-dry'),
        btnYeastFresh: document.getElementById('btn-yeast-fresh'),

        // Results
        resFlour: document.getElementById('res-flour'),
        resWater: document.getElementById('res-water'),
        resWaterPct: document.getElementById('res-water-pct'),
        resSalt: document.getElementById('res-salt'),
        resYeast: document.getElementById('res-yeast'),
        resYeastPct: document.getElementById('res-yeast-pct'),
        yeastTypeLabel: document.getElementById('yeast-type-label'),
        resOil: document.getElementById('res-oil'),
        resSugar: document.getElementById('res-sugar'),
        rowSugar: document.getElementById('row-sugar'),
        totalWeight: document.getElementById('total-weight'),

        // Strategy info
        strategyDesc: document.getElementById('strategy-desc'),
        processDesc: document.getElementById('process-desc'),
        warningText: document.getElementById('warning-text'),

        // Slider labels
        sliderMin: document.getElementById('slider-label-min'),
        sliderMax: document.getElementById('slider-label-max'),
        sliderAction: document.getElementById('slider-label-action'),

        // Containers for dynamic content
        timeline: document.getElementById('timeline-container'),
        instructions: document.getElementById('instructions-container')
    };
    return el;
}

/**
 * Sync UI inputs from state (used on page load)
 */
export function syncInputsFromState(state) {
    el.breadSelector.value = state.breadType;
    el.flourInput.value = state.flour;
    el.hydrationInput.value = state.hydration;
    el.mainSlider.value = state.activeInput === 'hydration' ? state.hydration : state.flour;

    if (state.startTime) {
        el.startTime.value = state.startTime;
    } else {
        const now = new Date();
        el.startTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    updateModeButtons(state.mode);
    updateYeastButtons(state.yeastType);
    updateActiveInput(state.activeInput || 'flour', state);
}

/**
 * Update active input container highlighting
 */
export function updateActiveInput(activeInput, state) {
    el.containerFlour.classList.toggle('active', activeInput === 'flour');
    el.containerHydration.classList.toggle('active', activeInput === 'hydration');
    updateSlider(activeInput, state);
}

/**
 * Update mode button states
 */
export function updateModeButtons(mode) {
    el.btnOvernight.classList.toggle('active', mode === 'overnight');
    el.btnExpress.classList.toggle('active', mode === 'express');
    el.btnDirect.classList.toggle('active', mode === 'direct');
}

/**
 * Update yeast toggle button states
 */
export function updateYeastButtons(yeastType) {
    el.btnYeastDry.classList.toggle('active', yeastType === 'dry');
    el.btnYeastFresh.classList.toggle('active', yeastType === 'fresh');
}

/**
 * Update slider configuration
 */
export function updateSlider(activeInput, state) {
    const system = BREAD_SYSTEM[state.breadType];

    if (activeInput === 'flour') {
        el.mainSlider.min = 200;
        el.mainSlider.max = 2000;
        el.mainSlider.step = 10;
        el.mainSlider.value = state.flour;
        el.sliderMin.textContent = '200g';
        el.sliderMax.textContent = '2000g';
        el.sliderAction.textContent = 'Ajustando Harina';
    } else {
        el.mainSlider.min = system.defaults.minHyd;
        el.mainSlider.max = system.defaults.maxHyd;
        el.mainSlider.step = 1;
        el.mainSlider.value = state.hydration;
        el.sliderMin.textContent = `${system.defaults.minHyd}%`;
        el.sliderMax.textContent = `${system.defaults.maxHyd}%`;
        el.sliderAction.textContent = 'Ajustando Hidratación';
    }
}

/**
 * Render calculated results
 */
export function renderResults(calc, state) {
    el.resFlour.textContent = `${calc.flour}g`;
    el.resWaterPct.textContent = `${calc.hydration}%`;
    el.resWater.textContent = `${calc.water}g`;
    el.resSalt.textContent = `${calc.salt}g`;
    el.resOil.textContent = `${calc.oil}g`;
    el.resYeastPct.textContent = `${(calc.yeastPct * 100).toFixed(1)}%`;
    el.resYeast.textContent = `${formatAmount(calc.yeast)}g`;
    el.yeastTypeLabel.textContent = calc.isFresh ? 'FRESCA' : 'SECA';
    el.totalWeight.textContent = `${calc.total}g`;

    if (calc.sugarPct > 0) {
        el.rowSugar.classList.add('visible');
        el.resSugar.textContent = `${formatAmount(calc.sugar)}g`;
    } else {
        el.rowSugar.classList.remove('visible');
        el.resSugar.textContent = '0g';
    }

    // Update input displays
    el.flourInput.value = calc.flour;
    el.hydrationInput.value = calc.hydration;
}

/**
 * Render strategy description and warning
 */
export function renderStrategyInfo(breadType, mode) {
    const isCiabatta = breadType === 'ciabatta';

    // Strategy descriptions
    const strategies = {
        overnight: {
            desc: 'Ferm. Lenta (Frío 18h+).',
            process: isCiabatta ? 'Pliegues x4 (cada 30min) → Frío.' : 'Amasar 5min → Bolear → Frío.',
            tip: 'Si pliegas mañana, atempera la masa 2hrs antes de hornear.'
        },
        express: {
            desc: 'Ferm. Media (~8h ambiente).',
            process: isCiabatta ? 'Pliegues x4 → Fermentar 8h.' : 'Amasar → Fermentar 8h.',
            tip: 'En verano vigilar que no sobrefermente. Si sube muy rápido, meter al refri.'
        },
        direct: {
            desc: 'Ferm. Rápida (3-4h).',
            process: isCiabatta ? 'Pliegues x4 → Fermentar 3-4h.' : 'Amasar → Reposar 1h.',
            tip: 'Usar lugar cálido para acelerar fermentación.'
        }
    };

    const info = strategies[mode];
    el.strategyDesc.textContent = info.desc;
    el.processDesc.textContent = info.process;
    el.warningText.innerHTML = `<strong>Tip:</strong> ${info.tip}`;
}

/**
 * Render timeline with calculated times
 */
export function renderTimeline(breadType, modeKey, calc) {
    const steps = buildTimeline(breadType, modeKey, calc);
    const startDate = getStartDate();

    el.timeline.innerHTML = steps.map((step) => {
        const time = addMinutes(startDate, step.offset);
        return `
            <div class="timeline-item">
                <span class="timeline-time">${formatTime(time)}</span>
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-title">${step.title}</div>
                    <div class="timeline-desc">${step.desc}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render step-by-step instructions
 */
export function renderInstructions(type, mode) {
    const data = INSTRUCTIONS[type];
    const steps = [];

    steps.push({ title: "Mezcla", text: data.common_mix });
    steps.push({ title: "Desarrollo", text: data.common_fold });

    if (mode === 'overnight') steps.push({ title: "Fermentación", text: data.overnight_proof });
    else if (mode === 'express') steps.push({ title: "Fermentación", text: data.express_proof });
    else steps.push({ title: "Fermentación", text: data.direct_proof });

    steps.push({ title: "Formado", text: data.shape });
    steps.push({ title: "Cocción", text: data.bake });

    el.instructions.innerHTML = steps.map((step, index) => `
        <div class="step-item">
            <div class="step-number">${index + 1}</div>
            <div class="step-content">
                <div class="step-title">${step.title}</div>
                <div class="step-text">${step.text}</div>
            </div>
        </div>
    `).join('');
}

// Helper functions
function formatTime(date) {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function addMinutes(date, mins) {
    return new Date(date.getTime() + mins * 60000);
}

function getStartDate() {
    const val = el.startTime.value;
    const now = new Date();
    if (val) {
        const [h, m] = val.split(':').map(Number);
        now.setHours(h, m, 0, 0);
    }
    return now;
}

function formatAmount(value) {
    return value.toFixed(1).replace('.0', '');
}
