import { BREAD_SYSTEM, FERMENTATION_MODES } from './data.js';

/**
 * Calculate all ingredients based on current state
 * @param {Object} state - Current application state
 * @returns {Object} Calculated values for all ingredients
 */
export function calculateIngredients(state) {
    const bread = BREAD_SYSTEM[state.breadType];
    const mode = FERMENTATION_MODES[state.mode];
    const isFresh = state.yeastType === 'fresh';

    const flour = state.flour;
    const water = flour * (state.hydration / 100);
    const salt = flour * bread.ratios.salt;
    const oil = flour * bread.ratios.oil;

    // Yeast: fresh = dry * 3
    const yeastDryPct = mode.yeastDry;
    const yeastFreshPct = yeastDryPct * 3;
    const activePct = isFresh ? yeastFreshPct : yeastDryPct;
    const yeast = flour * activePct;

    const sugar = flour * mode.sugar;
    const total = flour + water + salt + oil + yeast + sugar;

    return {
        flour: Math.round(flour),
        water: Math.round(water),
        salt: Math.round(salt),
        oil: Math.round(oil),
        yeast: yeast,
        yeastPct: activePct,
        sugar: sugar,
        sugarPct: mode.sugar,
        oilPct: bread.ratios.oil,
        hydration: state.hydration,
        total: Math.round(total),
        temp: mode.temp,
        isFresh: isFresh,
        breadName: bread.name,
        breadIcon: bread.icon,
        modeDesc: mode.desc,
        theme: bread.theme
    };
}

/**
 * Build timeline steps based on bread type and mode
 * @param {string} breadType - 'ciabatta' or 'churrasca'
 * @param {string} modeKey - 'overnight', 'express', or 'direct'
 * @param {Object} calc - Calculated ingredient values
 * @returns {Array} Array of timeline step objects
 */
export function buildTimeline(breadType, modeKey, calc) {
    const steps = [];
    const isCiabatta = breadType === 'ciabatta';
    const yeastLabel = calc.isFresh ? 'levadura fresca' : 'levadura seca';
    const sugarNote = modeKey === 'direct' ? `, ${formatAmount(calc.sugar)}g azucar` : '';

    if (isCiabatta) {
        steps.push({ offset: 0, title: "Mezcla + Autolisis", desc: `${calc.flour}g harina + ${calc.water}g agua (${calc.temp}). Reposar 20 min.` });
        steps.push({ offset: 20, title: "Integrar", desc: `Anadir ${calc.salt}g sal, ${formatAmount(calc.yeast)}g ${yeastLabel}${sugarNote} y ${calc.oil}g aceite. Mano mojada.` });
        steps.push({ offset: 50, title: "Pliegue 1", desc: "Coil folds con manos mojadas." });
        steps.push({ offset: 80, title: "Pliegue 2", desc: "Coil folds." });
        steps.push({ offset: 110, title: "Pliegue 3", desc: "Ultimo pliegue. Cubrir." });

        if (modeKey === 'overnight') {
            steps.push({ offset: 140, title: "-> Refrigerador", desc: "18-24h en frio. El sabor se desarrolla aqui." });
            steps.push({ offset: 1320, title: "Sacar del frio", desc: "Atemperar 2h antes de hornear." });
            steps.push({ offset: 1440, title: "Formado + Horno", desc: "Volcar sobre harina, cortar rectangulos. 250C, 15 min vapor + 15 min dorar." });
        } else if (modeKey === 'express') {
            steps.push({ offset: 120, title: "Fermentar", desc: "Cubrir. ~8h a temperatura ambiente." });
            steps.push({ offset: 600, title: "Formado", desc: "Volcar sobre harina. NO desgasificar. Cortar rectangulos." });
            steps.push({ offset: 620, title: "Horno", desc: "250C. 15 min con vapor (hielo) + 15 min dorar." });
        } else {
            steps.push({ offset: 120, title: "Fermentar", desc: "3-4h en lugar calido hasta triplicar volumen." });
            steps.push({ offset: 300, title: "Formado", desc: "Volcar sobre harina. NO desgasificar. Cortar rectangulos." });
            steps.push({ offset: 320, title: "Horno", desc: "250C. 15 min con vapor (hielo) + 15 min dorar." });
        }
    } else {
        steps.push({ offset: 0, title: "Mezcla", desc: `${calc.flour}g harina, ${calc.water}g agua (${calc.temp}), ${calc.salt}g sal, ${formatAmount(calc.yeast)}g ${yeastLabel}${sugarNote}, ${calc.oil}g grasa. Amasar 5-8 min.` });
        steps.push({ offset: 10, title: "Bolear", desc: "Formar bollo liso. Cubrir con pano." });

        if (modeKey === 'overnight') {
            steps.push({ offset: 40, title: "-> Refrigerador", desc: "En bolsa/bowl aceitado hasta manana." });
            steps.push({ offset: 1320, title: "Sacar del frio", desc: "Atemperar 1h." });
            steps.push({ offset: 1380, title: "Formar + Cocinar", desc: "Bolitas 60-80g -> estirar -> sarten muy caliente." });
        } else if (modeKey === 'express') {
            steps.push({ offset: 40, title: "Fermentar", desc: "Cubrir bollo aceitado. ~8h a ambiente." });
            steps.push({ offset: 520, title: "Formar + Cocinar", desc: "Bolitas 60-80g -> estirar con uslero -> sarten muy caliente." });
        } else {
            steps.push({ offset: 40, title: "Reposo", desc: "1h a temperatura ambiente." });
            steps.push({ offset: 100, title: "Formar + Cocinar", desc: "Bolitas 60-80g -> estirar con uslero -> sarten muy caliente." });
        }
    }

    return steps;
}

/**
 * Format amount removing unnecessary decimals
 */
function formatAmount(value) {
    return value.toFixed(1).replace('.0', '');
}
