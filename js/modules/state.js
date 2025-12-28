export const GAME_VERSION = "4.0.8";
export const SAVE_KEY = "BeeRoyal_Balance_V2";
export const AUDIO_KEY = "BeeRoyal_Audio_V1";
export const MISSION_KEY = "BeeRoyal_Missions_V2";

export const state = {
    honey: 0,
    totalHoneyEver: 0,
    hPerClick: 1,
    clickCost: 10,
    level: 1,
    currentXP: 0,
    nextLevelXP: 1000,
    autoUnlocked: false,
    autoLevel: 1,
    autoCost: 100,
    clickLvl: 1,
    autoLvlLvl: 1,
    ownedCosmetics: ["Bee", "NoelBee"],
    equippedCosmetic: "NoelBee",
    equippedBackground: "BgPadrao",
    activeBoosts: { pepper: 0, energy: 0, flower: 0 },
    clickBuffer: [],
    gameLoaded: false,
    currentAchFilter: 'all',
    autoProduceInterval: null,
    gameTickInterval: null,
    dailyMissions: [],
    lastMissionReset: 0,
    audioSettings: { music: 50, click: 80 },
    achievements: []
};

export const soundMusic = new Audio('assets/Music.mp3');
export const soundClick = new Audio('assets/Click.mp3');
soundMusic.loop = true;

export const boostBases = { pepper: 500, energy: 800, flower: 1200 };
export const durations = [
    { label: "5 MIN", t: 300, m: 1 },
    { label: "15 MIN", t: 900, m: 2.5 },
    { label: "1 HORA", t: 3600, m: 8 }
];

export const achThemes = [
    {n:"Iniciante Real", i:"🌱"}, {n:"Coletor de Pólen", i:"🌸"}, {n:"Zumbido Operário", i:"🐝"},
    {n:"Pequena Colmeia", i:"🏠"}, {n:"Produção Doce", i:"🍯"}, {n:"Amigo das Flores", i:"🌻"},
    {n:"Guarda Real", i:"🛡️"}, {n:"Explorador de Jardins", i:"🗺️"}, {n:"Mestre do Mel", i:"👑"},
    {n:"Império Alado", i:"🏰"}, {n:"Lenda das Abelhas", i:"✨"}
];

export const updateHistory = [
    {
        version: "4.0.8",
        title: "🛠️ CORREÇÕES DE SISTEMA",
        changes: [
            { type: "fix", text: "Corrigido persistência de volume ao reiniciar." },
            { type: "fix", text: "Ativado Fullscreen automático ao entrar no jogo." },
            { type: "mod", text: "Melhorada a detecção de input de áudio inicial." }
        ]
    }
];
