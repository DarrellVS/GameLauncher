let store = {}
let processes = []
let storeBackup = {
    user: {
        username: 'DarrellVS'
    },

    games: [{
        id: 0,
        name: 'Cyberpunk 2077',
        isFavorite: true,
        playTime: 245678000,
        lastPlayed: Date.now(),
        covers: {
            small: `https://images.igdb.com/igdb/image/upload/t_cover_small/co2mjs.jpg`,
            large: `https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjs.jpg`
        },
        startup: {
            path: `D:/Cyberpunk 2077/bin/x64/CyberPunk2077.exe`,
            arguments: ``
        }
    },
    {
        id: 1,
        name: 'Forza Horizon 4',
        isFavorite: true,
        playTime: 245678000,
        lastPlayed: Date.now(),
        covers: {
            small: `https://images.igdb.com/igdb/image/upload/t_cover_small/co2ec4.jpg`,
            large: `https://images.igdb.com/igdb/image/upload/t_cover_big/co2ec4.jpg`
        },
        startup: {
            path: ``,
            arguments: ``
        }
    },
    {
        id: 2,
        name: 'Alien: Isolation',
        isFavorite: true,
        playTime: 245678000,
        lastPlayed: null,
        covers: {
            small: `https://images.igdb.com/igdb/image/upload/t_cover_small/co1vzu.jpg`,
            large: `https://images.igdb.com/igdb/image/upload/t_cover_big/co1vzu.jpg`
        },
        startup: {
            path: ``,
            arguments: ``
        }
    },
    {
        id: 3,
        name: 'Scrap Mechanic',
        isFavorite: true,
        playTime: 245678000,
        lastPlayed: Date.now(),
        covers: {
            small: `https://images.igdb.com/igdb/image/upload/t_cover_small/co1u5k.jpg`,
            large: `https://images.igdb.com/igdb/image/upload/t_cover_big/co1u5k.jpg`
        },
        startup: {
            path: ``,
            arguments: ``
        }
    }]
}

module.exports = {
    // Getters
    getStore: () => store,
    getUser: () => store.user,
    getGames: () => store.games,
    getGame: id => {
        const game = store.games.filter(g => g.id == id)[0];
        game.isPlaying = processes.includes(id)
        return game;
    },
    getFavoriteGames: () => store.games.filter(g => g.isFavorite),
    getFilepath: id => store.games.filter(g => g.id == id)[0].startup.path,

    // Setters
    setStore: s => store = s,
    setLastPlayed: (id, ms) => store.games.filter(g => g.id == id)[0].lastPlayed = ms,

    // Other functions
    contains: name => store.games.filter(g => g.name === name).length >= 1,
    addPlaytime: (id, playtime) => store.games.filter(g => g.id == id)[0].playTime += playtime,
    addGame: game => {
        if (game.name == undefined || game.filePath === undefined || game.covers === undefined) throw new Error(`You must include a game's name, filepath and covers object when saving a new game to the store.`)
        let lastID = store.games[store.games.length - 1].id || 0;
        store.games.push({
            id: lastID + 1,
            name: game.name,
            isFavorite: false,
            playTime: 0,
            lastPlayed: null,
            covers: game.covers,
            screenshots: game.screenshots || [],
            storyline: game.storyline,
            summary: game.summary,
            rating: game.rating,
            startup: {
                path: game.filePath,
                arguments: ``
            },
            websites: game.websites
        })
        return lastID + 1;
    },
    toggleFavorite: id => {
        const game = store.games.filter(g => g.id == id)[0];
        game.isFavorite = !game.isFavorite;
    },
    removeGame: id => {
        const newStore = store.games.filter(g => g.id != id)
        store.games = newStore;
        console.log(store);
    },
    isGameRunning: id => processes.includes(id),





    // Processes array
    getProcesses: () => processes,
    addProcess: id => processes.push(id),
    removeProcess: id => {
        const index = processes.indexOf(id);
        if (index > -1) processes.splice(index, 1);
    },
}