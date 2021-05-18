const fetch = require('node-fetch')

class IGDB {
    constructor(client_id, client_secret) {
        if (client_id === undefined || client_secret === undefined) throw new Error('Provide both a client ID and client Secret');
        this.client_id = client_id;
        this.isInitialized = false;
        this.eventListeners = {
            initialized: []
        }

        // Get API token
        this.#getApiToken(client_id, client_secret);
    }

    async getGameInfo(game) {
        if (game === undefined) throw new Error('No game specified');
        if (this.client_id === undefined) throw new Error('No client ID registered');
        if (this.access_token === undefined) throw new Error('No access token registered')

        const parentResult = await this.#fetchFromIGDB(`fields *; search "${game}"; where version_parent = null;`)

        // Validate
        if (parentResult.length === 0) return { code: 404, error: 'Could not find game in IGDB.' }

        // Fetch cover
        let covers = await this.#fetchFromIGDB(`fields *; where game = ${parentResult[0].id};`, 'covers');
        let cover_base_url = covers[0].url.replace('//', 'https://');

        let web_id = parentResult[0].websites[0];
        let websites = web_id ? await this.#fetchFromIGDB(`fields *; where id = (${parentResult[0].websites.join(', ')});`, 'websites') : undefined;

        return {
            code: 200,
            covers: {
                small: cover_base_url.replace('t_thumb', `t_cover_small`),
                large: cover_base_url.replace('t_thumb', `t_cover_big`)
            },
            name: parentResult[0]?.name,
            summary: parentResult[0]?.summary,
            storyline: parentResult[0]?.storyline,
            rating: parentResult[0]?.rating,
            websites: {
                igdb: parentResult[0]?.url,
                developer: websites.filter(w => w.category === 1)[0]?.url || undefined,
                steam: websites.filter(w => w.category === 13)[0]?.url || undefined,
                epicgames: websites.filter(w => w.category === 16)[0]?.url || undefined,
                youtube: websites.filter(w => w.category === 9)[0]?.url || undefined,
                twitter: websites.filter(w => w.category === 5)[0]?.url || undefined,
                instagram: websites.filter(w => w.category === 8)[0]?.url || undefined,
            }
        }
    }

    async getGameCovers(game) {
        if (game === undefined) throw new Error('No game specified');
        if (this.client_id === undefined) throw new Error('No client ID registered');
        if (this.access_token === undefined) throw new Error('No access token registered')

        const parentResult = await this.#fetchFromIGDB(`fields *; search "${game}"; where version_parent = null;`)

        // Validate
        if (parentResult.length === 0) return { code: 404, error: 'Could not find game in IGDB.' }

        let covers_arr = [];

        // Fetch cover
        let covers = await this.#fetchFromIGDB(`fields *; where game = ${parentResult[0].id};`, 'covers');
        let cover_base_url = covers[0].url.replace('//', 'https://');
        covers_arr.push({
            small: cover_base_url.replace('t_thumb', `t_cover_small`),
            large: cover_base_url.replace('t_thumb', `t_cover_big`)
        })

        // Fetch screenshots
        let screenshots = await this.#fetchFromIGDB(`fields screenshots.*; where id = ${parentResult[0].id};`);
        if (screenshots[0]?.screenshots !== undefined) screenshots[0].screenshots.forEach(i => {
            const url = i.url.replace('//', 'https://')
            covers_arr.push({
                small: url.replace('t_thumb', `t_cover_small`),
                large: url.replace('t_thumb', `t_cover_big`)
            })
        })

        return {
            code: 200,
            covers: covers_arr
        }
    }

    on(event, callback) {
        switch (event) {
            case 'initialized':
                this.eventListeners['initialized'].push(callback)
                break;

            default:
                break;
        }
    }

    async #getApiToken(client_id, client_secret) {
        const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`, {
            method: 'POST'
        });
        const res = await response.json();
        if (res.status === 400) throw new Error(`Error while fetching IGDB API token: ${res.message}`)
        this.access_token = res.access_token;

        // Refresh token upon expiring
        setTimeout(() => { this.#getApiToken(client_id, client_secret) }, res.expires_in);

        if (this.isInitialized) return;
        this.isInitialized = true;
        this.#callEventListeners('initialized')
    }

    async #fetchFromIGDB(query, endpoint = 'games') {
        // Wait for response
        const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
            method: 'POST',
            headers: {
                'Client-ID': this.client_id,
                'Authorization': `Bearer ${this.access_token}`
            },
            body: query
        });
        const res = await response.json();
        return res;
    }

    #callEventListeners(event) {
        this.eventListeners[event]?.forEach(f => f());
    }
}

module.exports = IGDB;