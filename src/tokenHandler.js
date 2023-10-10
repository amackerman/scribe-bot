const fs = require("fs");
const { google } = require("googleapis");
const open = require("open");
require("dotenv").config();

function loadClientSecrets() {
    if (fs.existsSync("credentials.json")) {
        return JSON.parse(fs.readFileSync("credentials.json", "utf-8"));
    }
    throw new Error("Error loading client secret file:");
}

function loadToken() {
    if (fs.existsSync("token.json")) {
        return JSON.parse(fs.readFileSync("token.json", "utf-8"));
    }
    return null;
}

function saveToken(token) {
    fs.writeFileSync("token.json", JSON.stringify(token));
}

async function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["YOUR_REQUIRED_SCOPES_HERE"],
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    open(authUrl);

    // Consider implementing a solution for automatic code capture.
}

async function getAuthenticatedClient() {
    const { client_secret, client_id, redirect_uris } =
        loadClientSecrets().installed;

    const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID || client_id,
        process.env.GOOGLE_CLIENT_SECRET || client_secret,
        redirect_uris[0]
    );

    let token = loadToken();
    if (!token) {
        token = await getAccessToken(oAuth2Client);
        saveToken(token);
    } else {
        oAuth2Client.setCredentials(token);
        if (new Date().getTime() > token.expiry_date) {
            await refreshAccessToken(oAuth2Client);
        }
    }
    return oAuth2Client;
}

async function refreshAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        oAuth2Client.refreshAccessToken((err, token) => {
            if (err) {
                reject(new Error("Error refreshing access token", err));
                return;
            }
            oAuth2Client.setCredentials(token);
            console.log("Token refreshed successfully");
            saveToken(token);
            resolve(token);
        });
    });
}

module.exports = {
    getAuthenticatedClient,
    saveToken,
};
