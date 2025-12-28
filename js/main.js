import { state } from './modules/state.js';
import { Utils } from './modules/utils.js';
import { UI } from './modules/ui.js';
import { Game } from './modules/game.js';
import { Missions } from './modules/missions.js';
import { Achievements } from './modules/achievements.js';
import { Shop } from './modules/shop.js';

// Expor módulos globalmente para acesso via HTML (onclick)
window.Game = Game;
window.Utils = Utils;
window.UI = UI;
window.Missions = Missions;
window.Achievements = Achievements;
window.Shop = Shop;

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização
    UI.buildShop();
    Shop.renderSkins();
    
    // Event Listeners para Upgrades
    document.getElementById("btnUpgradeClick").onclick = () => {
        if (state.honey >= state.clickCost) {
            state.honey -= state.clickCost;
            state.clickLvl++;
            state.hPerClick += Math.floor(1 + (state.clickLvl * 0.2));
            state.clickCost = Math.floor(state.clickCost * 1.45);
            Missions.updateMissionProgress('buy_upgrade', 1);
            UI.updateUI();
            Utils.executeSave();
        }
    };

    document.getElementById("btnAutoAction").onclick = () => {
        if (state.honey >= state.autoCost) {
            state.honey -= state.autoCost;
            if (!state.autoUnlocked) {
                state.autoUnlocked = true;
                state.autoCost = 500;
                Game.startAutoProducing();
            } else {
                state.autoLevel++;
                state.autoCost = Math.floor(state.autoCost * 1.65);
            }
            Missions.updateMissionProgress('buy_upgrade', 1);
            UI.updateUI();
            Utils.executeSave();
        }
    };

    // Event Listeners para Cliques
    ["clickZone", "beeContainer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("mousedown", (e) => { e.preventDefault(); Game.doClick(false); });
            el.addEventListener("touchstart", (e) => { e.preventDefault(); Game.doClick(false); }, { passive: false });
        }
    });

    // Neve
    setInterval(() => Utils.spawnFlake('snowContainer'), 300);
    setInterval(() => {
        if (state.gameLoaded && document.getElementById('gameUI').style.opacity == '1') {
            Utils.spawnFlake('gameSnowContainer');
        }
    }, 400);

    // Teclas para o Minigame
    window.addEventListener("keydown", (e) => {
        if (!Game.snake.running) return;
        const key = e.key.toLowerCase();
        if ((key === "arrowleft" || key === "a")) Game.changeSnakeDir('LEFT');
        if ((key === "arrowup" || key === "w")) Game.changeSnakeDir('UP');
        if ((key === "arrowright" || key === "d")) Game.changeSnakeDir('RIGHT');
        if ((key === "arrowdown" || key === "s")) Game.changeSnakeDir('DOWN');
    });

    // Carregar dados iniciais
    Game.load();
});
