# scribe-bot

Scribe Bot is a Discord bot designed to transform messages from a thread into a Google Doc. Currently under active development, this bot offers modular code, easy setup, and a clean integration with Google Docs.

## Current Features

- Transform Discord thread messages into a Google Doc.
- Multiple save folder options for Google Docs.
- Command-driven operations via Discord.

## Pre-requisites

- Node.js
- A Discord account and permissions to add bots to servers.
- A Google Cloud Platform account with Google Docs API enabled.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/scribe-bot.git
cd scribe-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configuration

**Discord Setup**: Obtain your Discord bot token and add it to `.env`.

**Google Docs Setup**:
1. Set up a project on Google Cloud Platform.
2. Enable Google Docs API.
3. Download your `credentials.json` and place it in the root directory.
4. Note: For Google authentication, make sure to use the variable name GClient_ID to avoid conflicts with Discord's Client_ID. Ensure this variable is correctly set in your configuration or code.
5. Complete the local Google authorization process.

**Setting Up Folders**:
The bot uses predefined folder IDs to determine where to store Google Docs. Ensure you replace placeholders with actual folder IDs in the relevant command setup file.

### 4. Run the Bot

```bash
node index.js
```

## Important Notes

- **docStorage.json**: Ensure you maintain a local version of the `docStorage.json` file which contains actual Discord thread IDs, Google Doc IDs, and message IDs. Avoid publishing this file publicly for privacy concerns. An example `docStorage.example.json` is provided to understand the structure. Before running the bot, ensure the structure matches `docStorage.example.json` but with your actual data.

- **Local Hosting & Authorization**: The bot and Google authorization processes are designed to be handled locally. Ensure you have all necessary permissions and credentials before initiating the bot.

## Contributing

While the bot is under active development, contributions are not currently accepted. However, feel free to open issues if you spot any!

## License
BSD 3-Clause License. See License file for more information.

