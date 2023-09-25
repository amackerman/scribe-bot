const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const readline = require("readline");
const { loadToken, saveToken } = require("./tokenHandler");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/drive"];

function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    console.log("Authorize this app by visiting this url:", authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, reject) => {
        rl.question("Enter the code from that page here: ", (code) => {
            rl.close();

            oAuth2Client.getToken(code, (err, token) => {
                if (err) {
                    return reject("Error retrieving access token", err);
                }

                resolve(token);
            });
        });
    });
}

async function getAuthenticatedClient() {
    const GCLIENT_ID = process.env.GCLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;

    const oAuth2Client = new OAuth2(
        GCLIENT_ID,
        CLIENT_SECRET,
        "urn:ietf:wg:oauth:2.0:oob"
    );

    const token = loadToken();
    if (token) {
        oAuth2Client.setCredentials(token);
    } else {
        // If no token is found, obtain a new one
        const newToken = await getNewToken(oAuth2Client);
        saveToken(newToken);
        oAuth2Client.setCredentials(newToken);
    }

    return oAuth2Client;
}

module.exports = {
    getAuthenticatedClient,
};
