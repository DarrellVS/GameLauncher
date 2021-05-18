const { ipcRenderer } = require('electron')
// resetStore();
ipcRenderer.send('localstorage-announce', localStorage.getItem('store'))


ipcRenderer.on('localstorage-update', (event, data) => {
    localStorage.setItem('store', JSON.stringify(data))
})

function resetStore() {
    localStorage.removeItem('store');
    setTimeout(() => {
        localStorage.setItem('store', JSON.stringify({
            user: {
                username: 'DarrellVS'
            },
            games: [
                {
                    id: 0,
                    name: 'Cyberpunk 2077',
                    isFavorite: false,
                    playTime: 64327,
                    lastPlayed: 1619872989891,
                    covers: {
                        small: 'https://images.igdb.com/igdb/image/upload/t_cover_small/co2mjs.jpg',
                        large: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2mjs.jpg'
                    },
                    screenshots: [
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/quphnww1axg2mmsvxfux.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/jmi4y3q12o4uitdcaf7i.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/c6ruovzsugjlnlcmm8b0.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/ydyq0pixly7vt29fnzci.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/lelfskpwy4slftl3qdeb.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/c7usjg7gpo8rs0bfjkph.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/ybliaszwqkwui7djaou4.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/ts8wtae3t6aghttvtt2s.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/vnv5cd9kvonsjvazpotx.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/w4plqrhe04byymfksmux.jpg',
                        'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/ubbe5gewccx5ig3xy30t.jpg'
                    ],
                    storyline: 'In 2077, following an economic collapse sometime during the early 21st century, the United States is forced to rely on large corporations to survive. These corporations deal in a wide range of areas, such as weapons, robotics, cybernetics, pharmaceuticals, communications and biotechnology, and many of these companies operate above the law. The world in between is where decadence, sex and pop culture mix with violent crime, extreme poverty and the unattainable promise of the American Dream. You play as V, a mercenary outlaw deeply embedded in the crime-ridden city of Night City, going after a one-of-a-kind implant that is the key to immortality.',
                    summary: 'Cyberpunk 2077 is a role-playing video game developed and published by CD Projekt. Adapted from the Cyberpunk franchise, the game is an open world, non-linear RPG with an FPS style in which players are able to heavily customize their character to suit their play style. Gun play, exploration, player choice and activities such as hacking are to feature heavily throughout the game with missions, quests and objectives being completed in a variety of different ways. The world will have dynamic weather and a day/night cycle to make it truly immersive.',
                    rating: 77.3680145623332,
                    startup: {
                        path: 'D:\\Cyberpunk 2077\\bin\\x64\\Cyberpunk2077.exe',
                        arguments: ''
                    },
                    websites: {
                        igdb: 'https://www.igdb.com/games/cyberpunk-2077',
                        developer: 'http://cyberpunk.net/',
                        steam: 'https://store.steampowered.com/app/1091500/Cyberpunk_2077/',
                        epicgames: 'https://www.epicgames.com/store/product/cyberpunk-2077/home',
                        youtube: 'https://www.youtube.com/user/CyberPunkGame',
                        twitter: 'https://twitter.com/CyberpunkGame',
                        instagram: 'https://www.instagram.com/cyberpunkgame'
                    },
                    isPlaying: true
                }
            ]
        }))

        setTimeout(() => {
            ipcRenderer.send('localstorage-announce', localStorage.getItem('store'))
        }, 200)
    }, 200)
}