// Bread system configurations
export const BREAD_SYSTEM = {
    ciabatta: {
        name: "Ciabatta Rustica",
        icon: "",
        defaults: { hydration: 82, minHyd: 75, maxHyd: 95 },
        ratios: { salt: 0.02, oil: 0.03 },
        theme: "gray"
    },
    churrasca: {
        name: "Churrasca / Naan",
        icon: "",
        defaults: { hydration: 60, minHyd: 50, maxHyd: 70 },
        ratios: { salt: 0.02, oil: 0.05 },
        theme: "stone"
    }
};

// Fermentation modes - yeast % stored as dry, fresh = dry * 3
export const FERMENTATION_MODES = {
    overnight: {
        label: "Manana",
        yeastDry: 0.002,   // 0.2%
        sugar: 0,
        desc: "Fermentacion lenta 18-24h en frio",
        temp: "Fria"
    },
    express: {
        label: "~8 horas",
        yeastDry: 0.004,   // 0.4%
        sugar: 0,
        desc: "~8h a temperatura ambiente",
        temp: "Fria"
    },
    direct: {
        label: "Ya!",
        yeastDry: 0.012,   // 1.2%
        sugar: 0.015,
        desc: "Listo en 3-4h",
        temp: "Tibia"
    }
};

// Step-by-step instructions
export const INSTRUCTIONS = {
    ciabatta: {
        common_mix: "Mezcla harina y agua. Deja reposar 20 min (Autolisis). Luego anade sal, levadura y aceite. Integra con mano mojada.",
        common_fold: "Haz 3 series de pliegues (Coil Folds) cada 30 min para desarrollar fuerza.",
        overnight_proof: "Cubre y guarda en el refrigerador por 18-24 horas. Sacar 2h antes de hornear para atemperar.",
        express_proof: "Cubrir y dejar fermentar a temperatura ambiente ~8 horas (ej: preparar de noche, hornear de manana).",
        direct_proof: "Deja fermentar en lugar calido 3-4 horas hasta que triplique volumen.",
        shape: "Vuelca sobre mucha harina. NO desgasifiques. Corta rectangulos con rasqueta.",
        bake: "Horno max (250C). 15 min con vapor (hielo), luego 15 min sin vapor para dorar."
    },
    churrasca: {
        common_mix: "Mezcla todo junto y amasa bien por 5-8 min hasta tener una masa lisa y suave.",
        common_fold: "Deja descansar la masa (bollo) tapada por 30 minutos para relajar el gluten.",
        overnight_proof: "Guarda el bollo en bolsa/bowl aceitado en el refri hasta manana. Atemperar 1h antes de usar.",
        express_proof: "Cubrir el bollo aceitado y dejar fermentar a ambiente ~8 horas.",
        direct_proof: "Deja descansar 1 hora a temperatura ambiente.",
        shape: "Haz bolitas de 60-80g. Estira delgadas con uslero. Pincha con tenedor.",
        bake: "Sarten o parrilla muy caliente. Vuelta y vuelta hasta que se inflen y doren."
    }
};
