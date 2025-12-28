import { state, soundMusic, AUDIO_KEY, SAVE_KEY, MISSION_KEY } from './state.js';
import { Utils } from './utils.js';
import { UI } from './ui.js';

export const Game = {
    getGlobalBonus: () => {
        let b = 1;
        if (state.activeBoosts.pepper > 0) b *= 2;
        if (state.activeBoosts.energy > 0) b *= 2;
        return b;
    },

    getSkinBonus: () => {
        if (state.equippedCosmetic === 'NoelBee') return 1.2;
        return 1;
    },

    getMPSBase: () => {
        return state.autoLevel * 2;
    },

    doClick: (isTarget = false) => {
        Utils.playClickSound();
        const g = state.hPerClick * Game.getGlobalBonus();
        state.honey += g;
        state.totalHoneyEver += g;
        Game.addXP(g);
        
        window.Missions.updateMissionProgress('clicks', 1);
        window.Missions.updateMissionProgress('honey_gain', g);
        if (isTarget) window.Missions.updateMissionProgress('target_clicks', 1);
        
        const bee = document.getElementById("beeContainer");
        bee.style.transform = "scale(0.85)";
        setTimeout(() => bee.style.transform = "scale(1)", 50);
        
        state.clickBuffer.push(Date.now());
        Utils.spawnFlake('gameSnowContainer');
        UI.updateUI();
    },

    addXP: (amt) => {
        let m = ((state.activeBoosts.flower > 0) ? 5 : 1) * Game.getSkinBonus();
        state.currentXP += (amt * m);
        window.Missions.updateMissionProgress('xp_gain', amt * m);
        
        while (state.currentXP >= state.nextLevelXP) {
            state.currentXP -= state.nextLevelXP;
            state.level++;
            state.nextLevelXP = Math.floor(state.nextLevelXP * 1.25);
            Utils.notify({ n: `Nível Real ${state.level}!` });
        }
    },

    startAutoProducing: () => {
        if (state.autoProduceInterval) clearInterval(state.autoProduceInterval);
        state.autoProduceInterval = setInterval(() => {
            if (state.autoUnlocked) {
                let gain = Game.getMPSBase() * Game.getGlobalBonus();
                state.honey += gain;
                state.totalHoneyEver += gain;
                Game.addXP(gain);
                window.Missions.updateMissionProgress('honey_gain', gain);
            }
        }, 1000);
    },

    startGameTicks: () => {
        if (state.gameTickInterval) clearInterval(state.gameTickInterval);
        state.gameTickInterval = setInterval(() => {
            if (!state.gameLoaded) return;
            const now = Date.now();
            state.clickBuffer = state.clickBuffer.filter(t => now - t < 1000);
            const cps = state.clickBuffer.length;
            
            const aura = document.getElementById("aura");
            if (aura) {
                aura.style.transform = `scale(${1 + (cps * 0.15)})`;
                aura.style.opacity = 0.3 + (cps * 0.1);
            }
            
            state.achievements.forEach(a => {
                if (!a.u && state.totalHoneyEver >= a.target) {
                    a.u = true;
                    Utils.notify(a);
                    Utils.executeSave();
                }
            });
            
            for (let b in state.activeBoosts) if (state.activeBoosts[b] > 0) state.activeBoosts[b]--;
            
            if (now % 1000 < 150) {
                UI.updateUI();
                window.Missions.checkMissionReset();
            }
        }, 100);
    },

    load: () => {
        window.Achievements.initAchievements();
        Utils.renderChangelog();
        
        const savedAudio = localStorage.getItem(AUDIO_KEY);
        if (savedAudio) {
            state.audioSettings = JSON.parse(savedAudio);
        }
        Utils.applyAudioSettings();
        
        const rawMissions = localStorage.getItem(MISSION_KEY);
        if (rawMissions) {
            const md = JSON.parse(rawMissions);
            state.dailyMissions = md.dailyMissions || [];
            state.lastMissionReset = md.lastMissionReset || 0;
        }
        
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            try {
                const d = JSON.parse(raw);
                state.honey = d.honey || 0;
                state.totalHoneyEver = d.totalHoneyEver || 0;
                state.hPerClick = d.hPerClick || 1;
                state.clickCost = d.clickCost || 10;
                state.level = d.level || 1;
                state.currentXP = d.currentXP || 0;
                state.nextLevelXP = d.nextLevelXP || 1000;
                state.autoUnlocked = d.autoUnlocked || false;
                state.autoLevel = d.autoLevel || 1;
                state.autoCost = d.autoCost || 100;
                state.clickLvl = d.clickLvl || 1;
                state.autoLvlLvl = d.autoLvlLvl || 1;
                if (d.activeBoosts) state.activeBoosts = d.activeBoosts;
                if (d.equippedCosmetic) state.equippedCosmetic = d.equippedCosmetic;
                if (d.equippedBackground) state.equippedBackground = d.equippedBackground;
                if (d.achs) d.achs.forEach((u, i) => { if (state.achievements[i]) state.achievements[i].u = u; });
            } catch (e) { console.error(e); }
        }
        window.Missions.checkMissionReset();
    },

    enterGame: () => {
        Game.load();
        Utils.tryPlayMusic();
        Utils.requestFullscreen();
        document.getElementById('startScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('startScreen').style.display = 'none';
            const gameUI = document.getElementById('gameUI');
            gameUI.style.display = 'flex';
            gameUI.style.opacity = '1';
            state.gameLoaded = true;
            Game.startGameTicks();
            if (state.autoUnlocked) Game.startAutoProducing();
            UI.updateUI();
            UI.buildShop();
            // startDynamicNotifications(); // To be implemented if needed
        }, 500);
    },

    returnToMain: () => {
        Utils.closeModal('settingsModal');
        if (state.autoProduceInterval) { clearInterval(state.autoProduceInterval); state.autoProduceInterval = null; }
        if (state.gameTickInterval) { clearInterval(state.gameTickInterval); state.gameTickInterval = null; }
        Utils.executeSave();
        document.getElementById('gameUI').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('gameUI').style.display = 'none';
            document.getElementById('startScreen').style.display = 'flex';
            document.getElementById('startScreen').style.opacity = '1';
            state.gameLoaded = false;
        }, 500);
    },

    // Snake Minigame Logic
    snake: {
        parts: [],
        food: { x: 0, y: 0 },
        dx: 20,
        dy: 0,
        score: 0,
        running: false,
        lastUpdate: 0,
        tickRate: 120,
        boxSize: 20
    },

    prepareMinigame: (type) => {
        document.getElementById("minigameOverlay").style.display = "flex";
        document.getElementById("mgResultScreen").style.display = "none";
        const countdownEl = document.getElementById("mgCountdown");
        countdownEl.style.display = "block";
        
        let count = 3;
        countdownEl.textContent = count;
        
        const countTimer = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
            } else if (count === 0) {
                countdownEl.textContent = "GO!";
            } else {
                clearInterval(countTimer);
                countdownEl.style.display = "none";
                if (type === 'snake') Game.startSnakeGame();
            }
        }, 1000);
    },

    startSnakeGame: () => {
        const canvas = document.getElementById("snakeCanvas");
        canvas.width = 300;
        canvas.height = 300;
        Game.snake.parts = [{ x: 140, y: 140 }, { x: 120, y: 140 }, { x: 100, y: 140 }];
        Game.snake.score = 0;
        Game.snake.dx = Game.snake.boxSize;
        Game.snake.dy = 0;
        Game.snake.running = true;
        document.getElementById("snakeScore").textContent = "0";
        Game.createFood();
        requestAnimationFrame(Game.snakeLoop);
    },

    snakeLoop: (timestamp) => {
        if (!Game.snake.running) return;
        if (timestamp - Game.snake.lastUpdate >= Game.snake.tickRate) {
            Game.snake.lastUpdate = timestamp;
            Game.updateSnakePhysics();
        }
        Game.drawSnakeCanvas();
        requestAnimationFrame(Game.snakeLoop);
    },

    updateSnakePhysics: () => {
        const canvas = document.getElementById("snakeCanvas");
        const head = { x: Game.snake.parts[0].x + Game.snake.dx, y: Game.snake.parts[0].y + Game.snake.dy };
        if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || Game.checkSnakeBodyCollision(head)) {
            Game.showMgResult(Game.snake.score);
            return;
        }
        Game.snake.parts.unshift(head);
        if (head.x === Game.snake.food.x && head.y === Game.snake.food.y) {
            Game.snake.score++;
            document.getElementById("snakeScore").textContent = Game.snake.score;
            Game.createFood();
        } else {
            Game.snake.parts.pop();
        }
    },

    drawSnakeCanvas: () => {
        const canvas = document.getElementById("snakeCanvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4757";
        ctx.beginPath();
        ctx.arc(Game.snake.food.x + Game.snake.boxSize / 2, Game.snake.food.y + Game.snake.boxSize / 2, Game.snake.boxSize / 2.5, 0, Math.PI * 2);
        ctx.fill();
        Game.snake.parts.forEach((part, index) => {
            ctx.fillStyle = index === 0 ? "#ffcc00" : "#4a3b00";
            ctx.beginPath();
            ctx.roundRect(part.x + 1, part.y + 1, Game.snake.boxSize - 2, Game.snake.boxSize - 2, 4);
            ctx.fill();
        });
    },

    checkSnakeBodyCollision: (head) => {
        for (let i = 0; i < Game.snake.parts.length; i++) {
            if (head.x === Game.snake.parts[i].x && head.y === Game.snake.parts[i].y) return true;
        }
        return false;
    },

    createFood: () => {
        const canvas = document.getElementById("snakeCanvas");
        Game.snake.food.x = Math.floor(Math.random() * (canvas.width / Game.snake.boxSize)) * Game.snake.boxSize;
        Game.snake.food.y = Math.floor(Math.random() * (canvas.height / Game.snake.boxSize)) * Game.snake.boxSize;
        for (let part of Game.snake.parts) {
            if (Game.snake.food.x === part.x && Game.snake.food.y === part.y) return Game.createFood();
        }
    },

    changeSnakeDir: (dir) => {
        if (dir === 'LEFT' && Game.snake.dx === 0) { Game.snake.dx = -Game.snake.boxSize; Game.snake.dy = 0; }
        else if (dir === 'UP' && Game.snake.dy === 0) { Game.snake.dx = 0; Game.snake.dy = -Game.snake.boxSize; }
        else if (dir === 'RIGHT' && Game.snake.dx === 0) { Game.snake.dx = Game.snake.boxSize; Game.snake.dy = 0; }
        else if (dir === 'DOWN' && Game.snake.dy === 0) { Game.snake.dx = 0; Game.snake.dy = Game.snake.boxSize; }
    },

    showMgResult: (score) => {
        Game.snake.running = false;
        let hGain = score * 50 * (1 + state.level * 0.1);
        let xGain = score * 25 * (1 + state.level * 0.1);
        state.honey += hGain;
        Game.addXP(xGain);
        document.getElementById("mgResultScore").textContent = score;
        document.getElementById("mgResultReward").innerHTML = `RECOMPENSA:<br>+${Utils.formatNum(hGain)} 🍯 | +${Utils.formatNum(xGain)} XP`;
        document.getElementById("mgResultScreen").style.display = "flex";
        UI.updateUI();
        Utils.executeSave();
    },

    closeMgResult: () => { document.getElementById("minigameOverlay").style.display = "none"; },
    exitSnakeGame: () => { Game.snake.running = false; document.getElementById("minigameOverlay").style.display = "none"; }
};
