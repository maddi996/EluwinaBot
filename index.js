async function run() {

    const Discord = require('discord.js');
    const Puppeteer = require("puppeteer");

    const client = new Discord.Client();
    const browser = await Puppeteer.launch({
        headless: true
    });

    const refreshAfter = 2;
    const nicknameChannelID = '681494406620119050';
    const page = await browser.newPage();
    let messages = [];
    let players = [];

    await client.login('NjgxNDQyMDU5Mzc4NjIyNDc3.XlOghQ.L-Aw_15gdqlbTjIK7ZDqKdJZNzY');
    let currentIteration = 0;

    const getPlayers = async (_players = []) => {
        messages = [];
        messages = await client.channels.get(nicknameChannelID).fetchMessages();
        messages.forEach(message => {
            if (!_players.find(p => p.nickname === message.content)) {
                console.log("Added: ", message.content);
                _players.push({
                    author: message.author,
                    nickname: message.content,
                    lastDeath: 'unknown'
                })
            }
        });

        let toRemove = [];
        for (const player of _players) {
            if (!messages.find(m => m.content === player.nickname)) {
                toRemove.push(player.nickname);
            }
        }

        if (toRemove.length > 0) {
            console.log("To remove: ", toRemove);
        }

        _players = _players.filter(i => !toRemove.find(x => x === i.nickname));
        return _players;
    };

    const checkPlayers = async () => {
        for (const player of players) {
            const lastDeath = await getLastDeath(player.nickname, page);

            if (player.lastDeath === "unknown") {
                console.log("Setting up: ", player.nickname);
                player.lastDeath = lastDeath;
            } else {
                console.log("Checking... ", player.nickname);
            }

            if (player.lastDeath !== lastDeath) {

                const message = player.nickname + ", dentka lamusie!";
                const globalMessage = player.nickname + ", zdechł, HAAAAAAAAAAAAAAAAAAA";
                client.channels.get("681438691779936325").send(globalMessage);
                player.author.send(message);
                player.lastDeath = lastDeath;
            }
        }
    };




    players = await getPlayers();
    if (players.length < 1) {
        console.log("Players list is empty.");
    }

    while (1) {
        await checkPlayers();
        currentIteration++;
        if (currentIteration % refreshAfter) {
            console.log("getting new players...");
            players = await getPlayers(players);
        }
        await new Promise((resolve) => setTimeout(resolve, players.length * 1500));
    }
};

async function getLastDeath(character, page) {

    try {

        await page.goto("https://evolunia.net/?characters");
        await page.click("input[name='name']");
        await page.keyboard.type(character);
        await page.click(".ButtonText");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        let options = await page.$$eval('tr', options => options.map(option => option.textContent));
        options = options.filter(i => i.length < 500 && i.includes("Killed at level"));
        return options[0];
    } catch (e) {
        console.log(e);
    }
}

run();
