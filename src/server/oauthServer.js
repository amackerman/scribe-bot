const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
require('dotenv').config();

const TOKEN_PATH = 'token.json';

function generateAuthUrl(oAuth2Client) {
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.file'],
    });
}

// New function to save tokens to a file
function saveToken(tokens) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    console.log(`Token stored to ${TOKEN_PATH}`);
}

function startOAuthServer(port) {
    const app = express();
    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `http://localhost:${port}/oauth2callback`
    );

    app.get('/start-auth', (req, res) => {
        const authUrl = generateAuthUrl(oAuth2Client);
        console.log(`Please open the following URL in your browser to authorize: ${authUrl}`);
        res.send('Authorization URL generated. Please check the console and open the URL in your browser to complete the authorization.');
    });

    app.get('/oauth2callback', async (req, res) => {
        const { code } = req.query;
        console.log(`Received authorization code: ${code}`);
        try {
            // Exchange the authorization code for tokens
            const { tokens } = await oAuth2Client.getToken(code);
            saveToken(tokens); // Save the tokens for future use
            res.send('Authorization successful. Tokens received and saved.');
        } catch (error) {
            console.error('Error exchanging authorization code for tokens:', error);
            res.status(500).send('Failed to exchange the authorization code for tokens.');
        }
    });

    app.listen(port, () => {
        console.log(`OAuth server listening on port ${port}`);
    });
}

module.exports = { startOAuthServer };
