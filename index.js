import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';

let logo


function generateRandomQuestion() {
    const subjects = [
        "chemicals", "sports", "galaxies", "political movements", "ancient civilizations", "artificial intelligence", "quantum particles",
        "sociology", "psychology", "biotechnology", "climate change", "renewable energy", "globalization", "internet privacy", "genetic engineering",
        "robotics", "sustainability", "virtual reality", "cryptocurrency", "oceanography", "neuroscience", "social media", "medieval history",
        "microorganisms", "supply chain management", "philosophy", "literature", "music theory", "visual arts", "food security", "urban planning",
        "public health", "sociopolitical theories", "space-time theory", "evolutionary biology", "cognitive science", "quantum computing",
        "machine learning", "nanotechnology", "smart cities", "cultural studies", "ethics in technology", "international relations", "human rights",
        "Web3 technologies", "decentralized finance (DeFi)", "blockchain applications", "cryptographic security", "digital assets", "fitness technology",
        "nutrition science", "sports analytics", "wearable tech", "telehealth solutions", "mental health apps", "team dynamics in sports"
    ];

    const verbs = [
        "affect", "influence", "interact with", "change", "disrupt", "improve", "challenge", "shape", "determine", "define", "transform",
        "enhance", "complicate", "facilitate", "hinder", "promote", "diminish", "revolutionize", "motivate", "inspire", "alter",
        "instigate", "trigger", "reflect", "project", "forecast", "model", "simulate", "predict", "explain", "depict", "illustrate",
        "contextualize", "evaluate", "assess", "critique", "validate", "test", "measure", "analyze", "examine", "investigate",
        "explore", "debate", "dissect", "reframe", "interpret", "negotiate", "navigate", "balance", "synthesize", "streamline",
        "digitize", "democratize", "secure", "optimize", "monitor", "enhance", "adapt", "leverage", "accelerate"
    ];

    const contexts = [
        "human behavior in extreme situations", "modern technological advancements", "the global economy", "climate patterns",
        "scientific research", "educational methodologies", "space exploration missions", "cultural dynamics", "economic inequality",
        "healthcare systems", "consumer behavior", "data privacy concerns", "environmental sustainability", "art movements",
        "historical events", "political ideologies", "social justice movements", "media influence", "interpersonal relationships",
        "workplace culture", "urbanization", "migration trends", "digital transformation", "cognitive development", "ethical dilemmas",
        "international conflicts", "public policy", "climate activism", "technological dependency", "artificial ecosystems",
        "behavioral economics", "social stratification", "virtual communities", "ecosystem resilience", "gender equality",
        "youth empowerment", "aging populations", "neighborhood development", "food distribution", "disaster management",
        "adoption of Web3 technologies", "impact of cryptocurrency on financial markets", "role of technology in personal health",
        "evolution of sports training methods", "effect of fitness apps on lifestyle choices", "mental health in competitive sports",
        "influence of blockchain on supply chains", "decentralized governance in organizations", "economic implications of NFTs",
        "trends in online fitness communities", "impact of telemedicine on healthcare access"
    ];

    const questionStarters = [
        "How do", "Why do", "What causes", "When do", "Where do", "What are the effects of", "In what ways do", "Can we understand how",
        "How might", "What impact does", "How is", "Why might", "In which contexts does", "What role does", "What implications does",
        "How can", "What trends exist regarding", "What relationships can be observed between", "How does", "What connections can be drawn",
        "What challenges arise from", "How should we approach", "What solutions exist for", "What lessons can we learn from",
        "How do we address", "What strategies can be employed to", "What questions arise when considering", "How might we improve",
        "What difficulties are presented by", "What opportunities are created by", "When might we see changes in", "What future predictions can be made about"
    ];

    const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const context = contexts[Math.floor(Math.random() * contexts.length)];

    const question = `${starter} ${subject} ${verb} ${context}?`;
    return question;
}

// Fetch all Gaia domains
async function fetchAllGaiaDomains() {
    try {
        const response = await axios.get('https://api.gaianet.ai/api/v1/network/domains/');
        if (response.data.code === 0 && response.data.data && response.data.data.objects) {
            return response.data.data.objects.map(domain => domain.fqdn);
        } else {
            console.error('Failed to fetch domains: Invalid response structure');
            return [];
        }
    } catch (error) {
        console.error('Failed to fetch domains:', error.message);
        return [];
    }
}

// Send chat completion request
async function sendChatRequest(domain, authToken, keyword) {
    const url = `https://${domain}/v1/chat/completions`;
    const data = {
        model: domain,
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: keyword },
        ],
    };

    const headers = {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        'Content-Type': 'application/json',
        'Origin': 'https://www.gaianet.ai',
        'Referer': 'https://www.gaianet.ai/',
        'Sec-CH-UA': '"Not A(Brand";v="8", "Chromium";v="132", "Brave";v="132"',
        'Sec-CH-UA-Mobile': '?0',
        'Sec-CH-UA-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36',
        
    };

    try {
        const response = await axios.post(url, data, { headers });
        return {
            domain,
            status: 'Completed',
            keyword,
            lastAnswer: response.data.choices[0].message.content.substring(0, 15), // Limit to 15 chars
        };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { domain, status: 'Unavailable', keyword, lastAnswer: '' };
        }
        console.error(chalk.red(`Error with domain ${domain}: ${error.message}`));
        return { domain, status: 'Error', keyword, lastAnswer: '' };
    }
}

// Main interactive CLI function
async function start() {
    console.clear()
    try {
        const response = await fetch('https://repo.tukangnode.com/logo');
        logo = await response.text();
    } catch (error) {
        console.error('Failed to fetch logo:', error.message);
    }

    console.log(logo)

    const authToken = await inquirer
        .prompt({
            type: 'input',
            name: 'authToken',
            message: 'Enter your token (leave empty for no token):',
        })
        .then(answers => answers.authToken.trim() || null);

    let selectedDomains = [];
    let allDomains = [];
    const failedDomains = new Set();

    if (authToken) {
        allDomains = await fetchAllGaiaDomains();
        if (allDomains.length === 0) {
            console.error('No domains found.');
            return;
        }
    }

    const domainChoice = await inquirer.prompt({
        type: 'list',
        name: 'domainOption',
        message: 'Choose domain option:',
        choices: [
            { name: `Use all domains (${allDomains.length} Domains)`, value: 'all' },
            { name: 'Use custom domains', value: 'custom' },
        ],
        when: () => !!authToken,
    });

    if (domainChoice?.domainOption === 'all') {
        const threadCount = await inquirer
            .prompt({
                type: 'input',
                name: 'threads',
                message: 'Enter the number of threads (max 10 threads):',
                default: 3,
                validate: input => {
                    const num = parseInt(input);
                    if (isNaN(num) || num < 1) {
                        return 'Please enter a valid number greater than 0';
                    }
                    if (num > 10) {
                        return 'Please enter a number no greater than 10';
                    }
                    return true;
                },
            })
            .then(answers => parseInt(answers.threads));

        selectedDomains = Array(threadCount).fill(null).map(() => {
            const domain = allDomains[Math.floor(Math.random() * allDomains.length)];
            return domain;
        });
    } else {
        const customDomainsInput = await inquirer.prompt({
            type: 'input',
            name: 'customDomains',
            message: 'Enter custom subdomains (comma-separated):',
        });
        selectedDomains = customDomainsInput.customDomains
            .split(',')
            .map(subdomain => `${subdomain.trim()}.gaia.domains`);
    }

    const { interval } = await inquirer.prompt({
        type: 'input',
        name: 'interval',
        message: 'Enter interval in seconds between requests:',
        default: 2,
        validate: input => (isNaN(input) || input < 1 ? 'Please enter a valid number' : true),
    });

    let successCount = 0;
    let errorCount = 0;

    const domainStatus = selectedDomains.map(domain => ({
        domain,
        status: 'Idle',
        prompt: null,
        lastAnswer: '',
    }));

    const printStatus = () => {
        console.clear();
      

        domainStatus.forEach(({ domain, status, prompt, lastAnswer }) => {
            let coloredStatus;

            if (status === 'Processing') {
                coloredStatus = chalk.gray('Processing');
            } else if (status === 'Completed') {
                coloredStatus = chalk.green('Completed');
            } else if (status === 'Idle') {
                coloredStatus = chalk.yellow('Idle - Domain or Node not available');
            } else {
                coloredStatus = chalk.white(status); // Default color for any other status
            }

            console.log(
                chalk.blue(
                    `Domain: ${domain} | Current Prompt: ${prompt} | Last Answer: ${lastAnswer} | Status: ${coloredStatus}`
                )
            );
        });
        console.log(`\nSuccess: ${chalk.green(successCount)} | Error: ${chalk.red(errorCount)}`);
    };

    const processDomain = async (domainIndex) => {
        const domainEntry = domainStatus[domainIndex];
        if (failedDomains.has(domainEntry.domain)) {
            if (domainChoice?.domainOption === 'all') {
                // Replace failed domain with a new random one
                const availableDomains = allDomains.filter(domain => !failedDomains.has(domain));
                if (availableDomains.length > 0) {
                    domainEntry.domain = availableDomains[Math.floor(Math.random() * availableDomains.length)];
                }
            } else {
                domainEntry.status = 'Idle';
                printStatus();
                return;
            }
        }

        const keyword = generateRandomQuestion();
        domainEntry.status = 'Processing';
        domainEntry.prompt = keyword.substring(0, 15);
        printStatus();

        const result = await sendChatRequest(domainEntry.domain, authToken, keyword);
        if (result.status === 'Unavailable' || !result.status === "Completed") {
            errorCount++;
            failedDomains.add(result.domain);
        } else {
            successCount++;
        }

        domainEntry.status = result.status;
        domainEntry.lastAnswer = result.lastAnswer;
        printStatus();

        setTimeout(() => processDomain(domainIndex), interval * 1000);
    };

    domainStatus.forEach((_, index) => processDomain(index));
}

start().catch(console.error);
