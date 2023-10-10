const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/drive"];

function loadToken() {
    if (fs.existsSync("token.json")) {
        return JSON.parse(fs.readFileSync("token.json", "utf-8"));
    }
    return null;
}

function saveToken(token) {
    fs.writeFileSync("token.json", JSON.stringify(token));
}

async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });
    console.log("🔗 Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question("🔑 Enter the code from that page here: ", async (code) => {
            rl.close();
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                console.log("✅ Successfully retrieved access token.");
                resolve(tokens);
            } catch (err) {
                console.error("❌ Error retrieving access token:", err);
                reject(err);
            }
        });
    });
}

async function refreshAccessToken(oAuth2Client) {
    try {
        const { credentials } = await oAuth2Client.refreshAccessToken();
        console.log("✅ Successfully refreshed access token.");
        saveToken(credentials);
        return credentials;
    } catch (error) {
        console.error("❌ Error during token refresh:", error);
        throw error;
    }
}

async function getAuthenticatedClient() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error(
            "❌ CLIENT_ID and CLIENT_SECRET must be set in environment variables!"
        );
        throw new Error("Missing CLIENT_ID or CLIENT_SECRET");
    }

    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        "urn:ietf:wg:oauth:2.0:oob"
    );

    let token = loadToken();

    if (!token) {
        console.warn("⚠️ No token found. Generating a new one...");
        token = await getNewToken(oAuth2Client);
        saveToken(token);
    }

    oAuth2Client.setCredentials(token);

    try {
        await oAuth2Client.getAccessToken();
        console.log("✅ Client authenticated.");
    } catch (error) {
        console.warn(
            "⚠️ Authentication failed. Trying to refresh the token..."
        );
        try {
            await refreshAccessToken(oAuth2Client);
        } catch (refreshError) {
            console.error("❌ Failed to refresh token:", refreshError);
            console.log("🔄 Initiating new token request...");
            token = await getNewToken(oAuth2Client);
            saveToken(token);
            oAuth2Client.setCredentials(token);
        }
    }

    return oAuth2Client;
}

async function initializeAuthenticatedClient() {
    let oAuth2Client;
    try {
        oAuth2Client = await getAuthenticatedClient();
        console.log("Authenticated successfully at startup!");
    } catch (error) {
        console.error("Failed to authenticate at startup:", error);
    }
    return oAuth2Client;
}

module.exports = {
    getAuthenticatedClient,
    refreshAccessToken,
    initializeAuthenticatedClient,
};
