const localStorage = require('./local-storage-interface')
const spawn = require('child_process').spawn;
const store = require('./store')

class SpawnedProcess {
    constructor(path, id, event, args = [], openFunctions = [], exitFunctions = []) {
        if (path === undefined) throw new Error('Path must be specified');
        if (id === undefined) throw new Error('Game ID must be specified');
        if (event === undefined) throw new Error('Event must be specified');
        this.id = id;
        this.event = event;
        this.process = spawn(path, args);
        this.openFunctions = openFunctions;
        this.exitFunctions = exitFunctions;
        this.startDate = Date.now();
        store.addProcess(parseInt(this.id));
        this.initListeners();
    }

    addExitFunction(func) {
        exitFunctions.push(func)
    }

    initListeners() {
        this.openFunctions.forEach(f => f());
        this.process.on('exit', async () => {
            // Calculate playtimes
            const playtime = Date.now() - this.startDate;
            const game = await store.getGame(this.id);
            const newPlaytime = game.playTime + playtime;

            // Update client playtime
            this.event.reply('update-playtime', { id: this.id, newPlaytime })

            // Remove process from store
            store.removeProcess(this.id);

            // Update store playtime
            store.addPlaytime(this.id, playtime);

            // Update store last played
            store.setLastPlayed(this.id, Date.now())

            // Sync localStorage
            localStorage.updateStore()

            // Execute exit functions
            this.exitFunctions.forEach(f => f())
        });
    }
}

module.exports = SpawnedProcess;