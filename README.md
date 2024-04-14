# scribe-bot

Scribe Bot is a Discord bot designed to scrape messages from a thread into a Google Doc. Currently under active development, this bot offers modular code, easy setup, and a clean integration with Google Docs.

## Current Features

- Scrape Discord thread messages and insert them into a Google Doc.
- Multiple save folder options for Google Docs.
- Command-driven operations via Discord.
- Google Apps Script to format documents when Discord API returns markdown.

## Pre-requisites

- Node.js
- A Discord account and permissions to add bots to servers.
- A Google Cloud Platform account with Google Docs API enabled.

## Quick Start

For those familiar with Discord bot development and Google Cloud Platform setup, here's how to get Scribe Bot up and running:

1. Clone the repo: `git clone https://github.com/yourusername/scribe-bot.git`
2. Install dependencies: `cd scribe-bot && npm install`
3. Set up your `.env` file with Discord and Google API credentials.
4. Run the bot: `node index.js`

For detailed setup instructions, see the [Getting Started](#getting-started) section.


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
3. Create a Web Application credential and add http://localhost:3000/oauth2callback as your authorized redirect URI.
4. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to your .env file. The redirect URI should match the one set in your Google Cloud Platform credentials.

**Local Server Setup**
How to Handle the Windows Firewall Notification
Allow Access: If the firewall prompt appears, you should have the option to "Allow access" for Node.js. This will create a firewall rule that permits inbound connections to your OAuth server. It's safe to allow access if you're running the server locally and for development purposes.

Configure Firewall Manually: If you didn't allow access through the prompt or need to adjust settings later, you can manually configure the firewall:

Open "Windows Defender Firewall" from the Control Panel.
Go to "Advanced settings".
In "Inbound Rules", find rules related to Node.js or your application and ensure they are enabled and configured to allow connections on the port your server uses (e.g., port 3000 for your OAuth server).
Ensuring OAuth Server Functionality
After adjusting your firewall settings, your OAuth server should be accessible as intended. To verify:

Start your OAuth server by running your application.
Use a browser to navigate to the /start-auth route (e.g., http://localhost:3000/start-auth). This should trigger the OAuth flow and open the authorization URL in your browser.
If everything is configured correctly, you should be able to complete the authorization process without issues.

 **Environment Variables Explanation**

To configure Scribe Bot properly, you need to set up several environment variables. These variables are essential for the bot's operation, allowing it to interact with Discord and Google Cloud APIs securely. Below is a description of each variable required in the `.env` file:

- `DISCORD_TOKEN`: This is the token for your Discord bot, which allows your bot to log in and interact with the Discord API. You can obtain this token from the Discord Developer Portal where your bot application is registered.

- `DISCORD_GUILD_ID`: The unique identifier for your Discord server (guild). This ID helps the bot identify which server it's interacting with. You can find this ID by enabling Developer Mode in your Discord settings, right-clicking your server name, and clicking "Copy ID".

- `DISCORD_CLIENT_ID`: The client ID for your Discord application. This is also obtained from the Discord Developer Portal and is used to identify your application to the Discord API.

- `DISCORD_USER_ID`: Your Discord user ID. This can be used if the bot needs to identify or interact with your user specifically. Similar to the guild ID, you can obtain this by enabling Developer Mode and right-clicking your username.

- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: These are the credentials for your Google Cloud project that allow the bot to access the Google Docs API. You create these credentials in the Google Cloud Console under your project's "Credentials" section.

- `GOOGLE_REDIRECT_URI`: The URI to which Google will redirect after OAuth authentication. This should match one of the URIs set in your Google Cloud Console credentials.

- `OAUTH_SERVER_PORT`: The port number on which your local OAuth server will listen. This should match the port specified in your `GOOGLE_REDIRECT_URI`.

- `AOA_FOLDER_ID`, `KIDSVERSE_FOLDER_ID`, `TESTS_FOLDER_ID`: These are the Google Drive folder IDs where the bot will save documents related to specific universes or categories. You can find a folder's ID in the URL when viewing it in Google Drive.

**Example `.env` File:**

```plaintext
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=your_discord_guild_id_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_USER_ID=your_discord_user_id_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:your_oauth_server_port/oauth2callback
OAUTH_SERVER_PORT=your_oauth_server_port_here
AOA_FOLDER_ID=your_aoa_folder_id_here
KIDSVERSE_FOLDER_ID=your_kidsverse_folder_id_here
TESTS_FOLDER_ID=your_tests_folder_id_here
```
### 4. Run the Bot

```bash
node index.js
```

## Bot Commands

Scribe Bot supports a range of commands to manage document creation, updating, and deletion directly from Discord. Below is a list of available commands along with their descriptions:

- **Create Command**: Creates a Google Doc from a thread. Requires naming the document and selecting a folder.
- **Update Command**: Updates an existing document. Useful for adding new messages or edits to the document.
- **Delete Command**: Deletes a document. This action requires confirmation to prevent accidental deletion.
- **List Command**: Returns a list of links to documents currently in the storage list, along with their associated thread titles. Users must specify which universe to list: Age of Ashes or Kidsverse.
- **Generate Name Command**: Generates a randomly chosen name based on the specified gender.
- **Elvish Command**: Displays an embed of Elvish phrases and their meanings. For a framework of how these phrases are structured, refer to the `elvishPhrasesExample.json` file in the repository.
- **Add Elvish Command**: Allows users to add new Elvish phrases and their meanings to the list. To maintain formatting and consistency, please refer to the structure provided in `elvishPhrasesExample.json`. Enclose the meaning in square brackets ([]) for proper formatting.

To use these commands, simply type them into the Discord chat where Scribe Bot is active, following the syntax guidelines provided for each command.

## Data Structure and Examples

To ensure privacy while providing users with a clear understanding of data structures used by Scribe Bot, example JSON files are included in the repository. These files, such as `elvishPhrasesExample.json`, demonstrate the format and structure without revealing actual content used in specific universes or the made-up language.

### Elvish Phrases and How to Use Them

The `ElvishPhrasesExample.json` file provides a template for how Elvish phrases and their English meanings are structured within the bot. This example file is intended to guide you if you need to add phrases in a language either real or fictional that is different than the promary language you are speaking in.

Here’s how to use the example file:

- Each entry consists of an English phrase enclosed in square brackets `[]`, followed by its Elvish translation, enclosed in asterisks `*`.
- The key (English phrase) should be a brief description or the meaning of the Elvish phrase, while the value (Elvish translation) is the phrase itself in Elvish.  The astreiks are for later formating.  The words between astreks will later show up in discord as italics.

**Example:**

```json
{
  "[example phrase in English]": "*ExampleElvishTranslation*",
  "[another example phrase]": "*AnotherElvishTranslation*",
  "[more examples]": "*MoreExamplesInElvish*"
}
```

### docStorage.json Example and Explaination

The `docStorage.json` file plays a critical role in managing the association between Discord threads and Google Docs created by Scribe Bot. It includes vital information such as Google Doc IDs, titles, last message IDs, word counts, universe identifiers, and folder IDs where each document is stored.

Due to privacy and security considerations, the actual `docStorage.json` is not included in the repository. Instead, an example file named `docStorageExample.json` is provided to illustrate the expected structure and format.

**docStorageExample.json Example**

This example file demonstrates the required structure for linking Discord threads to their corresponding Google Docs. Each thread is identified by a unique ID (in this case, `exampleThreadId`), mapping to an object containing:

- `googleDocId`: The ID of the Google Doc associated with the Discord thread.
- `title`: A descriptive title for the document, typically including the date or event covered.
- `lastMessageId`: The ID of the last message from the Discord thread that was added to the Google Doc, useful for incremental updates.
- `wordCount`: The current word count of the Google Doc.
- `universe`: A tag indicating the fictional universe or context the document pertains to.
- `folderId`: The ID of the Google Drive folder where the document is stored.

Please replace the placeholder values with actual data relevant to your application while maintaining the privacy of your real `docStorage.json` file.

**Note**: It is crucial to maintain the privacy of your `docStorage.json` file to protect the integrity of your data and the privacy of your Discord community.

## Google Apps Utility Script

I have included a Google Apps utility script to format the document.  When the bot scrapes a thread, Discord takes any formatting, such as italics or bold, and turns it into markdown. This is what is initially inserted into the Google Doc. When this script is run, it will reformat the Google Doc.

### Using a Google Script

1.  **Open Google Apps Script:** Go to https://script.google.com/ and sign in with your Google account.
2.  **Create a New Project:** Click on New Project. You'll be taken to the script editor.
3.  **Replace the Placeholder Code:** In the script editor, you'll see some placeholder content. Delete this, and paste in the code you copied from GitHub.
4.  **Save and Name Your Project:** Give your project a meaningful name that relates to its function, such as "Formatting from Markdown".
  - You will need to replace `var DOC_ID` with the ID of the document you want to copy.  The example below shows where it is found.
  - `https://docs.google.com/document/d/THIS STRING OF LETTERS AND NUMBERS IS THE DOCUMENT ID/edit`
5.  **Click the play icon** (`▶`) to attempt to run the function.

6. **Grant Permissions**:
  - A dialog box will appear asking you to review permissions for the script. Click `Review Permissions`.
  - Select your account and continue.
  - If you encounter a screen that says "Google hasn’t verified this app," click `Advanced` and then `Go to (your project's name) (unsafe)` to proceed.
  - Review the list of permissions the script is requesting and click `Allow` to grant them.

**Note**: The script is considered "unsafe" only because it is not verified by Google, which is typical for custom scripts. As long as you trust the source of the script, it is safe to proceed.


## Contributing

While the bot is under active development, contributions are not currently accepted. However, feel free to open issues if you spot any!

## License
BSD 3-Clause License. See License file for more information.

