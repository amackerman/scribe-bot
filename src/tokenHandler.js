const fs = require("fs");

// Load token from file
function loadToken() {
    if (fs.existsSync("token.json")) {
        return JSON.parse(fs.readFileSync("token.json", "utf-8"));
    }
    return null;
}

// Save token to file
function saveToken(token) {
    fs.writeFileSync("token.json", JSON.stringify(token));
}

module.exports = {
    loadToken,
    saveToken,
};
