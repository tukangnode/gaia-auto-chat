import axios from 'axios';
import fs from 'fs';
import { SocksProxyAgent } from 'socks-proxy-agent';

// Read dynamic node URLs from command-line arguments
const URLS = process.argv.slice(2); // Start reading from the 3rd argument (e.g., "node auto.js llama qwen zypher")

if (URLS.length === 0) {
    console.error("Please provide at least one node ID as an argument (e.g., `node auto.js llama qwen zypher`).");
    process.exit(1);
}
const HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};
const KEYWORDS_FILE = 'keywords.txt';
const PROXY_LIST = [
    '80.76.38.144:7218:ftwywdqd:h63ogpa7r5fn',
    '80.76.39.61:6635:ftwywdqd:h63ogpa7r5fn',
    '80.76.39.11:6585:ftwywdqd:h63ogpa7r5fn',
];
const INTERVAL = 1000; // Interval in milliseconds

const state = URLS.reduce((acc, id) => {
    acc[id] = { currentQuestion: null, previousAnswer: null, status: 'Idle', totalChats: 0 };
    return acc;
}, {});

let logo 

function getRandomKeyword() {
    const keywords = fs.readFileSync(KEYWORDS_FILE, 'utf-8').split('\n');
    const randomIndex = Math.floor(Math.random() * keywords.length);
    return keywords[randomIndex].trim();
}

function getRandomProxy() {
    const randomIndex = Math.floor(Math.random() * PROXY_LIST.length);
    return PROXY_LIST[randomIndex];
}

async function sendRequest(nodeId) {
    while (true) {
        const keyword = getRandomKeyword();
        let proxy = getRandomProxy();

        state[nodeId].currentQuestion = keyword.substring(0, 10);
        state[nodeId].status = 'Sending';
        printState();

        const url = `https://${nodeId}.gaia.domains/v1/chat/completions`;
        const data = {
            model: `${nodeId}.gaia.domains`,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: keyword },
            ],
        };

        const [host, port, username, password] = proxy.split(':');
        const torProxyAgent = new SocksProxyAgent(`socks://${username}:${password}@${host}:${port}`);

        try {
            const response = await axios.post(url, data, {
                headers: HEADERS,
                httpsAgent: torProxyAgent,
                httpAgent: torProxyAgent,
            });

            const content = response.data.choices[0]?.message?.content || 'No content available';

            state[nodeId].previousAnswer = content.substring(0, 10);
            state[nodeId].status = 'Idle';
            state[nodeId].totalChats += 1;
        } catch (error) {
            console.error(`Error: No response from ${nodeId} using proxy socks5://${proxy}.`);
            state[nodeId].status = 'Error';
            proxy = getRandomProxy();
            console.log(`Retrying ${nodeId} with a new proxy: socks5://${proxy}`);
        } finally {
            printState();
            await new Promise(resolve => setTimeout(resolve, INTERVAL));
        }
    }
}

function printState() {
    console.clear();
    console.log(logo); 
    const formattedData = Object.entries(state).map(([key, value]) => ({
        Domain: `${key}.gaia.domains`,
        currentQuestion: value.currentQuestion,
        previousAnswer: value.previousAnswer,
        status: value.status,
        totalChats: value.totalChats,
    }));
    console.table(formattedData);
}

async function main() {
    try {
        const response = await fetch('https://repo.tukangnode.com/logo');
        logo = await response.text();
    } catch (error) {
        console.error('Failed to fetch logo:', error.message);
    }

    // Start sending requests for each node
    URLS.forEach(nodeId => {
        sendRequest(nodeId);
    });
}

main();
