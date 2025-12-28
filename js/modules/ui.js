import { state, durations, boostBases } from './state.js';
import { Utils } from './utils.js';

export const UI = {
    updateUI: () => {
        document.getElementById("honeyDisplay").textContent = Utils.formatNum(state.honey);
        document.getElementById("levelText").textContent = `Nível Real ${state.level}`;
        document.getElementById("xpText").textContent = `${Utils.formatNum(state.currentXP)} / ${Utils.formatNum(state.nextLevelXP)} XP`;
        document.getElementById("xpFill").style.width = (state.currentXP / state.nextLevelXP * 100) + "%";
        
        document.getElementById("clickCostText").textContent = `Custo: ${Utils.formatNum(state.clickCost)} 🍯`;
        document.getElementById("autoCostText").textContent = `Custo: ${Utils.formatNum(state.autoCost)} 🍯`;
        document.getElementById("autoActionTitle").textContent = state.autoUnlocked ? `MELHORAR AUTO (Lvl ${state.autoLevel})` : "DESBLOQUEAR AUTO";
        
        document.getElementById("btnUpgradeClick").disabled = state.honey < state.clickCost;
        document.getElementById("btnAutoAction").disabled = state.honey < state.autoCost;

        UI.updateBoostsUI();
        UI.updateShopButtons();
    },

    updateBoostsUI: () => {
        const container = document.getElementById("active-boosts");
        if (!container) return;
        container.innerHTML = "";
        const icons = { pepper: '🌶️', energy: '🥤', flower: '🌼' };
        for (let key in state.activeBoosts) {
            if (state.activeBoosts[key] > 0) {
                const div = document.createElement("div");
                div.className = "active-boost-timer";
                div.innerHTML = `<span>${icons[key]}</span> <span>${Utils.formatTime(state.activeBoosts[key])}</span>`;
                container.appendChild(div);
            }
        }
    },

    updateShopButtons: () => {
        ['pepper', 'energy', 'flower'].forEach(type => {
            durations.forEach((d, i) => {
                const cost = Math.floor(boostBases[type] * (1 + (state.level * 0.18)) * d.m);
                const grid = document.getElementById(`grid_${type}`);
                if (grid && grid.children[i]) {
                    grid.children[i].disabled = state.honey < cost;
                }
            });
        });
    },

    openTab: (id, btn) => {
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(id).classList.add('active');
        btn.classList.add('active');
        if (id === 'achievements') window.Achievements.renderAchs();
    },

    openSubShop: (id, btn) => {
        document.querySelectorAll('.sub-shop-pane').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('shop_' + id).style.display = 'block';
        btn.classList.add('active');
    },

    setAchFilter: (rarity, btn) => {
        state.currentAchFilter = rarity;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.Achievements.renderAchs();
    },

    buildShop: () => {
        ['pepper', 'energy', 'flower'].forEach(type => {
            const grid = document.getElementById(`grid_${type}`);
            if (!grid) return;
            grid.innerHTML = "";
            durations.forEach(d => {
                const cost = Math.floor(boostBases[type] * (1 + (state.level * 0.18)) * d.m);
                const btn = document.createElement("button");
                btn.className = "buy-btn-small";
                btn.disabled = state.honey < cost;
                btn.innerHTML = `<b>${d.label}</b><br>${Utils.formatNum(cost)} 🍯`;
                btn.onclick = () => window.Shop.buyBoostManual(type, d.t, cost, d.label);
                grid.appendChild(btn);
            });
        });
    }
};
