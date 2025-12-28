import { state, SAVE_KEY, MISSION_KEY, AUDIO_KEY, soundMusic, soundClick, updateHistory } from './state.js';

export const Utils = {
    formatNum: (n) => {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
        if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
        if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
        return Math.floor(n).toString();
    },

    formatTime: (s) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    },

    openModal: (id) => {
        document.getElementById(id).style.display = 'flex';
        if (id === 'missionsModal') window.Missions.renderMissions();
    },

    closeModal: (id) => {
        document.getElementById(id).style.display = 'none';
    },

    openChangelog: () => {
        Utils.openModal('changelogModal');
        Utils.renderChangelog();
    },

    renderChangelog: () => {
        const container = document.getElementById("changelogContent");
        if (!container) return;
        container.innerHTML = "";
        const recentUpdates = updateHistory.slice(0, 5);
        recentUpdates.forEach(update => {
            let blockHtml = `<div class="changelog-block"><div class="changelog-section-title">v${update.version} - ${update.title}</div><div class="changelog-list">`;
            update.changes.forEach(change => {
                let icon = "🔹";
                if (change.type === "add") icon = "🟢";
                if (change.type === "rem") icon = "🔴";
                if (change.type === "fix") icon = "🔵";
                if (change.type === "mod") icon = "🟡";
                blockHtml += `<div class="changelog-item"><span class="changelog-icon">${icon}</span><span>${change.text}</span></div>`;
            });
            blockHtml += `</div></div>`;
            container.innerHTML += blockHtml;
        });
    },

    executeSave: () => {
        const data = {
            honey: state.honey,
            totalHoneyEver: state.totalHoneyEver,
            hPerClick: state.hPerClick,
            clickCost: state.clickCost,
            level: state.level,
            currentXP: state.currentXP,
            nextLevelXP: state.nextLevelXP,
            autoUnlocked: state.autoUnlocked,
            autoLevel: state.autoLevel,
            autoCost: state.autoCost,
            activeBoosts: state.activeBoosts,
            equippedCosmetic: state.equippedCosmetic,
            equippedBackground: state.equippedBackground,
            clickLvl: state.clickLvl,
            autoLvlLvl: state.autoLvlLvl,
            achs: state.achievements.map(a => a.u),
            timestamp: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        const missionData = { dailyMissions: state.dailyMissions, lastMissionReset: state.lastMissionReset };
        localStorage.setItem(MISSION_KEY, JSON.stringify(missionData));
        
        const indicator = document.getElementById("saveIndicator");
        if (indicator) {
            indicator.classList.add("visible");
            setTimeout(() => indicator.classList.remove("visible"), 1000);
        }
    },

    updateVolume: (type) => {
        Utils.tryPlayMusic();
        if (type === 'music') {
            state.audioSettings.music = document.getElementById('musicVol').value;
            document.getElementById('musicVolLabel').textContent = state.audioSettings.music + '%';
            soundMusic.volume = state.audioSettings.music / 100;
        } else {
            state.audioSettings.click = document.getElementById('clickVol').value;
            document.getElementById('clickVolLabel').textContent = state.audioSettings.click + '%';
            soundClick.volume = state.audioSettings.click / 100;
        }
        localStorage.setItem(AUDIO_KEY, JSON.stringify(state.audioSettings));
    },

    applyAudioSettings: () => {
        soundMusic.volume = state.audioSettings.music / 100;
        soundClick.volume = state.audioSettings.click / 100;
        const mVol = document.getElementById('musicVol');
        const cVol = document.getElementById('clickVol');
        if (mVol) {
            mVol.value = state.audioSettings.music;
            document.getElementById('musicVolLabel').textContent = state.audioSettings.music + '%';
        }
        if (cVol) {
            cVol.value = state.audioSettings.click;
            document.getElementById('clickVolLabel').textContent = state.audioSettings.click + '%';
        }
    },

    tryPlayMusic: () => {
        if (soundMusic.paused) {
            soundMusic.play().then(() => {
                window.removeEventListener('click', Utils.tryPlayMusic);
                window.removeEventListener('touchstart', Utils.tryPlayMusic);
            }).catch(() => {});
        }
    },

    playClickSound: () => {
        soundClick.currentTime = 0;
        soundClick.play().catch(() => {});
    },

    requestFullscreen: () => {
        const doc = window.document;
        const docEl = doc.documentElement;
        const request = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        if (request && !doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            request.call(docEl).catch(err => { console.warn(err.message); });
        }
    },

    spawnFlake: (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        flake.style.left = (Math.random() * 95) + 'vw';
        flake.style.opacity = Math.random();
        flake.style.animationDuration = (Math.random() * 3 + 3) + 's';
        container.appendChild(flake);
        setTimeout(() => flake.remove(), 6000);
    },

    notify: (a) => {
        const container = document.getElementById("notifContainer");
        const div = document.createElement("div");
        div.className = `popup`;
        div.textContent = `${a.n} ${a.d ? '(' + a.d + ')' : ''}`;
        container.innerHTML = "";
        container.appendChild(div);
        div.style.animation = "slideInNotif 4s ease-in-out forwards";
        setTimeout(() => { if (div) div.remove(); }, 4000);
    }
};
