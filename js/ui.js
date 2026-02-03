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
        resultCard: document.getElementById('result-card'),
        resultTitle: document.getElementById('result-title'),
        resultDesc: document.getElementById('result-desc'),
        totalWeight: document.getElementById('total-weight'),
        waterTempBadge: document.getElementById('water-temp-badge'),
        yeastLabel: document.getElementById('yeast-label'),
        rowSugar: document.getElementById('row-sugar'),

        // Result values
        resFlour: document.getElementById('res-flour'),
        resWater: document.getElementById('res-water'),
        resWaterPct: document.getElementById('res-water-pct'),
        resSalt: document.getElementById('res-salt'),
        resYeast: document.getElementById('res-yeast'),
        resYeastPct: document.getElementById('res-yeast-pct'),
        resSugar: document.getElementById('res-sugar'),
        resSugarPct: document.getElementById('res-sugar-pct'),
        resOil: document.getElementById('res-oil'),
        resOilPct: document.getElementById('res-oil-pct'),

        // Slider labels
        sliderMin: document.getElementById('slider-label-min'),
        sliderMax: document.getElementById('slider-label-max'),
        sliderAction: document.getElementById('slider-label-action'),

        // Containers for dynamic content
        warnings: document.getElementById('warnings-container'),
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
    el.mainSlider.value = state.activeInput === 'flour' ? state.flour : state.hydration;

    if (state.startTime) {
        el.startTime.value = state.startTime;
    } else {
        const now = new Date();
        el.startTime.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    updateModeButtons(state.mode);
    updateYeastButtons(state.yeastType);
    updateActiveInput(state.activeInput, state);
    updateResultTheme(state.breadType);
}

/**
 * Update mode button states
 */
export function updateModeButtons(mode) {
    el.btnOvernight.classList.toggle('btn-active', mode === 'overnight');
    el.btnExpress.classList.toggle('btn-active', mode === 'express');
    el.btnDirect.classList.toggle('btn-active', mode === 'direct');
}

/**
 * Update yeast toggle button states
 */
export function updateYeastButtons(yeastType) {
    el.btnYeastDry.classList.toggle('btn-active', yeastType === 'dry');
    el.btnYeastFresh.classList.toggle('btn-active', yeastType === 'fresh');
}

/**
 * Update active input container and slider configuration
 */
export function updateActiveInput(activeInput, state) {
    const system = BREAD_SYSTEM[state.breadType];

    el.containerFlour.classList.toggle('active', activeInput === 'flour');
    el.containerHydration.classList.toggle('active', activeInput !== 'flour');

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
        el.sliderAction.textContent = 'Ajustando Hidratacion';
    }
}

/**
 * Update result card theme based on bread type
 */
export function updateResultTheme(breadType) {
    const system = BREAD_SYSTEM[breadType];
    el.resultCard.className = `result-card theme-${system.theme}`;
}

/**
 * Render calculated results
 */
export function renderResults(calc) {
    el.resultTitle.textContent = `${calc.breadIcon} ${calc.breadName}`;
    el.resultDesc.textContent = calc.modeDesc;
    el.totalWeight.textContent = `${calc.total} g`;
    el.waterTempBadge.textContent = calc.temp;
    el.yeastLabel.textContent = calc.isFresh ? 'Levadura Fresca' : 'Levadura Seca';

    el.resFlour.textContent = `${calc.flour} g`;
    el.resWaterPct.textContent = `${calc.hydration}%`;
    el.resWater.textContent = `${calc.water} g`;
    el.resSalt.textContent = `${calc.salt} g`;
    el.resOilPct.textContent = `${(calc.oilPct * 100).toFixed(0)}%`;
    el.resOil.textContent = `${calc.oil} g`;
    el.resYeastPct.textContent = `${(calc.yeastPct * 100).toFixed(1)}%`;
    el.resYeast.textContent = `${formatAmount(calc.yeast)} g`;

    if (calc.sugarPct > 0) {
        el.rowSugar.classList.add('visible');
        el.resSugarPct.textContent = `${(calc.sugarPct * 100).toFixed(1)}%`;
        el.resSugar.textContent = `${formatAmount(calc.sugar)} g`;
    } else {
        el.rowSugar.classList.remove('visible');
        el.resSugarPct.textContent = '0%';
        el.resSugar.textContent = '0 g';
    }

    // Update input displays
    el.flourInput.value = calc.flour;
    el.hydrationInput.value = calc.hydration;
}

/**
 * Render warning messages
 */
export function renderWarnings(breadType, mode) {
    const modeData = FERMENTATION_MODES[mode];
    const warnings = [];

    if (modeData.temp === 'Fria') {
        warnings.push({ text: 'Verano en Santiago: usar agua bien fria (refri) para controlar fermentacion.' });
    } else {
        warnings.push({ text: 'Agua tibia (~30C). En verano cuidado: no usar caliente, solo tibia.' });
    }

    if (breadType === 'ciabatta') {
        warnings.push({ text: 'La Ciabatta NO se amasa. Solo pliegues (coil folds).' });
    }

    if (mode === 'overnight') {
        warnings.push({ text: 'Sacar masa del refri 1-2h antes de hornear/cocinar para atemperar.' });
    }

    if (mode === 'express') {
        warnings.push({ text: 'Express 8h en verano: vigilar que no sobrefermente. Si sube muy rapido, meter al refri.' });
    }

    el.warnings.innerHTML = warnings.map(w => `
        <div class="warning-item">
            <span class="warning-icon">*</span>
            <span class="warning-text">${w.text}</span>
        </div>
    `).join('');
}

/**
 * Render timeline with calculated times
 */
export function renderTimeline(breadType, modeKey, calc) {
    const steps = buildTimeline(breadType, modeKey, calc);
    const startDate = getStartDate();

    el.timeline.innerHTML = steps.map((step, i) => {
        const time = addMinutes(startDate, step.offset);
        const isLast = i === steps.length - 1;
        return `
            <li>
                <div class="timeline-start text-xs font-mono font-bold">${formatTime(time)}</div>
                <div class="timeline-middle">
                    <div class="w-3 h-3 rounded-full bg-warning"></div>
                </div>
                <div class="timeline-end timeline-box bg-warning/20 border-warning/30">
                    <div class="font-bold text-sm">${step.title}</div>
                    <div class="text-xs opacity-70">${step.desc}</div>
                </div>
                ${!isLast ? '<hr class="bg-warning/30"/>' : ''}
            </li>
        `;
    }).join('');
}

/**
 * Render step-by-step instructions
 */
export function renderInstructions(type, mode) {
    const data = INSTRUCTIONS[type];
    const system = BREAD_SYSTEM[type];
    const steps = [];

    steps.push({ title: "Mezcla", text: data.common_mix });
    steps.push({ title: "Desarrollo", text: data.common_fold });

    if (mode === 'overnight') steps.push({ title: "Fermentacion", text: data.overnight_proof });
    else if (mode === 'express') steps.push({ title: "Fermentacion", text: data.express_proof });
    else steps.push({ title: "Fermentacion", text: data.direct_proof });

    steps.push({ title: "Formado", text: data.shape });
    steps.push({ title: "Coccion", text: data.bake });

    el.instructions.innerHTML = `
        <ul class="steps steps-vertical w-full">
            ${steps.map((step, index) => `
                <li class="step step-neutral" data-content="${index + 1}">
                    <div class="text-left">
                        <div class="font-bold">${step.title}</div>
                        <div class="text-sm opacity-70">${step.text}</div>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
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
