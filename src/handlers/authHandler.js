const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const TOKEN_PATH = 'token.json';
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const USER_ID_FOR_NOTIFICATIONS = 'YOUR_DISCORD_USER_ID'; // Replace with the actual user ID

// Function to load the stored token
function loadToken() {
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        console.log("Loaded token:", token);
        return token;
    }
    return null;
}

// Function to save the token to a file
function saveToken(token) {
    console.log("Saving tokens:", token);
    if (!token.refresh_token) {
        console.log('Warning: No refresh token is included in the token data.');
    }
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
}

// Function to create an OAuth2 client
function createOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

// Function to generate the authorization URL
function generateAuthUrl(oAuth2Client) {
    return oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}

// Function to exchange the authorization code for tokens
async function exchangeCodeForToken(code) {
    const oAuth2Client = createOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);
    saveToken(tokens);  // Save the received tokens, including the refresh token if present
    return tokens;
}

// Main function to check token validity and notify if needed
async function checkTokenAndNotifyIfNeeded(interaction) {
    let token = loadToken();

    if (!token || new Date(token.expiry_date) <= new Date()) {
        console.log('Token is expired or missing. Initiating manual refresh process.');
        // Notify the user or log to the console about the need to refresh
        if (interaction) {
            await interaction.reply({
                content: `<@${USER_ID_FOR_NOTIFICATIONS}>, the bot's token for Google API has expired. Please refresh it manually by clicking the link below.`,
                ephemeral: true
            });
        }
        
        // Log the auth URL to the console for manual refresh
        const authUrl = generateAuthUrl(createOAuth2Client());
        console.log(`Authorize this app by visiting this URL: ${authUrl}`);
        
        return null;
    }

    // If the token is valid, return the authenticated client
    const oAuth2Client = createOAuth2Client();
    oAuth2Client.setCredentials(token);
    
    if (oAuth2Client.isTokenExpiring()) {
        console.log('Access token is expiring soon. Please refresh manually.');
        const authUrl = generateAuthUrl(createOAuth2Client());
        console.log(`Refresh your access by visiting this URL: ${authUrl}`);
    }
    
    return oAuth2Client;
}

module.exports = {
    checkTokenAndNotifyIfNeeded,
    saveToken, // Exporting for use after manually exchanging the code
    exchangeCodeForToken, // Exporting for use in OAuth callback handling
};
