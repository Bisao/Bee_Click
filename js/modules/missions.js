import { state } from './state.js';
import { Utils } from './utils.js';
import { UI } from './ui.js';
import { Game } from './game.js';

export const Missions = {
    missionTypes: [
        { id: 'clicks', n: 'Dedo de Ouro', d: 'Faça {t} cliques', target: 500, reward: 1000 },
        { id: 'honey_gain', n: 'Produção em Massa', d: 'Colete {t} de mel', target: 5000, reward: 2000 },
        { id: 'xp_gain', n: 'Sabedoria Real', d: 'Ganhe {t} de XP', target: 2000, reward: 1500 },
        { id: 'buy_upgrade', n: 'Investidor Real', d: 'Compre {t} melhorias', target: 5, reward: 3000 },
        { id: 'target_clicks', n: 'Mira de Elite', d: 'Acerte o alvo {t} vezes', target: 20, reward: 2500 }
    ],

    checkMissionReset: () => {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        if (now - state.lastMissionReset > oneDay || state.dailyMissions.length === 0) {
            Missions.generateDailyMissions();
            state.lastMissionReset = now;
            Utils.executeSave();
        }
    },

    generateDailyMissions: () => {
        state.dailyMissions = [];
        const shuffled = [...Missions.missionTypes].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);
        
        selected.forEach(m => {
            const multiplier = 1 + (state.level * 0.2);
            state.dailyMissions.push({
                ...m,
                target: Math.floor(m.target * multiplier),
                reward: Math.floor(m.reward * multiplier),
                progress: 0,
                completed: false,
                claimed: false
            });
        });
    },

    updateMissionProgress: (type, amt) => {
        state.dailyMissions.forEach(m => {
            if (m.id === type && !m.completed) {
                m.progress += amt;
                if (m.progress >= m.target) {
                    m.progress = m.target;
                    m.completed = true;
                    Utils.notify({ n: "Missão Concluída!", d: m.n });
                }
            }
        });
    },

    renderMissions: () => {
        const container = document.getElementById("missionList");
        if (!container) return;
        container.innerHTML = "";
        
        state.dailyMissions.forEach((m, index) => {
            const progressPercent = (m.progress / m.target) * 100;
            const card = document.createElement("div");
            card.className = "event-item";
            card.style.flexDirection = "column";
            card.style.alignItems = "stretch";
            
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <div class="event-info">
                        <div class="event-name">${m.n}</div>
                        <div class="event-reward">${m.d.replace('{t}', Utils.formatNum(m.target))}</div>
                    </div>
                    <div style="font-weight:900; color:var(--accent);">${Utils.formatNum(m.reward)} 🍯</div>
                </div>
                <div class="xp-bg" style="height:8px; margin-bottom:10px;">
                    <div class="xp-fill" style="width:${progressPercent}%; background:var(--accent);"></div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:11px; font-weight:800;">${Utils.formatNum(m.progress)} / ${Utils.formatNum(m.target)}</span>
                    <button class="btn-play-event" style="width:100px; margin:0;" 
                        ${m.completed && !m.claimed ? '' : 'disabled'} 
                        onclick="Missions.claimMission(${index})">
                        ${m.claimed ? 'COLETADO' : (m.completed ? 'COLETAR' : 'EM ANDAMENTO')}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    },

    claimMission: (index) => {
        const m = state.dailyMissions[index];
        if (m.completed && !m.claimed) {
            m.claimed = true;
            state.honey += m.reward;
            state.totalHoneyEver += m.reward;
            Game.addXP(m.reward / 2);
            Utils.notify({ n: "Recompensa Coletada!", d: `+${Utils.formatNum(m.reward)} 🍯` });
            UI.updateUI();
            Missions.renderMissions();
            Utils.executeSave();
        }
    }
};
