import { state } from './state.js';
import { Utils } from './utils.js';
import { UI } from './ui.js';

export const Shop = {
    buyBoostManual: (type, ticks, cost, label) => {
        if (state.honey >= cost) {
            state.honey -= cost;
            state.activeBoosts[type] += ticks;
            Utils.notify({ n: "Boost Ativado!", d: `+${label}` });
            UI.updateUI();
            Utils.executeSave();
        }
    },

    handleCosmetic: (id) => {
        state.equippedCosmetic = id;
        document.getElementById("mainBeeImg").src = `assets/${id}.png`;
        Utils.notify({ n: "Skin Trocada!" });
        UI.updateUI();
        Utils.executeSave();
    },

    handleBackground: (id) => {
        state.equippedBackground = id;
        // Lógica de troca de background se houver
        Utils.notify({ n: "Cenário Alterado!" });
        UI.updateUI();
        Utils.executeSave();
    },

    renderSkins: () => {
        const list = document.getElementById("skinList");
        if (!list) return;
        list.innerHTML = "";
        // Exemplo de skins (poderia vir do state)
        const skins = [
            { id: 'Bee', n: 'Abelha Comum', img: 'Bee.png' },
            { id: 'NoelBee', n: 'Abelha Noel', img: 'NoelBee.png' }
        ];
        
        skins.forEach(s => {
            const btn = document.createElement("button");
            btn.className = "buy-btn-small";
            btn.innerHTML = `<img src="assets/${s.img}" class="skin-preview"><br>${s.n}`;
            btn.onclick = () => Shop.handleCosmetic(s.id);
            list.appendChild(btn);
        });
    }
};
