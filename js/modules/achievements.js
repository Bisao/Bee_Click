import { state, achThemes } from './state.js';
import { Utils } from './utils.js';

export const Achievements = {
    initAchievements: () => {
        state.achievements = [];
        for (let i = 1; i <= 200; i++) {
            let val = Math.pow(1.58, i) * 120;
            let rar = i < 80 ? "common" : (i < 160 ? "rare" : "epic");
            let theme = achThemes[i % achThemes.length];
            state.achievements.push({
                id: i,
                n: `${theme.n} ${Math.ceil(i / achThemes.length)}`,
                d: `Produziu ${Utils.formatNum(val)} de mel`,
                target: val,
                u: false,
                r: rar,
                i: theme.i
            });
        }
    },

    renderAchs: () => {
        const l = document.getElementById("achList");
        if (!l) return;
        l.innerHTML = "";
        state.achievements.filter(a => state.currentAchFilter === 'all' || a.r === state.currentAchFilter).forEach(a => {
            const card = document.createElement("div");
            card.className = `ach-card ${a.u ? 'unlocked ' + a.r : 'locked'}`;
            card.innerHTML = `
                <div style="font-size:24px;">${a.u ? a.i : '🔒'}</div>
                <div style="flex:1">
                    <div style="font-weight:900; color:var(--dark); font-size:13px;">${a.n}</div>
                    <div style="font-size:11px; color:#666;">${a.d}</div>
                </div>
                ${a.u ? '<div style="color:var(--xp-bar)">✔</div>' : ''}
            `;
            l.appendChild(card);
        });
    }
};
