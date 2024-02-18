const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
require('dotenv').config();

const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

function loadToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    }
    return null;
}

function saveToken(token) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    console.error('Error while trying to retrieve access token', err);
                    reject(err);
                }
                resolve(token);
            });
        });
    });
}

async function getAuthenticatedClient() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error('Missing Google API client credentials');
    }

    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
    );

    let token = loadToken();

    if (token) {
        oAuth2Client.setCredentials(token);
    } else {
        console.warn('No token found. Generating a new one...');
        token = await getNewToken(oAuth2Client).catch(console.error);
        if (token) {
            saveToken(token);
            oAuth2Client.setCredentials(token);
        } else {
            throw new Error('Failed to authenticate Google API client');
        }
    }

    return oAuth2Client;
}

async function checkTokenValidity(discordClient, interaction) {
    const oAuth2Client = await getAuthenticatedClient();
    try {
        await google.drive({ version: 'v3', auth: oAuth2Client }).files.list({
            pageSize: 1,
        });
        // If the call succeeds, the token is valid
        return oAuth2Client;
    } catch (error) {
        console.error('Token validation failed:', error);
        // Notify in the channel where the command was called
        const funnyMessage = "Oops! My connection to the Google brain is experiencing hiccups. 🤖💔🧠 Could someone give it a gentle kick? 🦶";
        await interaction.reply({ content: `<@689247771936555023>, ${funnyMessage}`, ephemeral: false });
        return null;
    }
}

module.exports = {
    getAuthenticatedClient,
    checkTokenValidity,
};

