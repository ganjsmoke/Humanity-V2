
# Auto Daily Humanity - Token Claimer

## Overview

This script is designed to automatically claim daily rewards from a platform called Humanity. It processes a list of tokens sequentially, claiming rewards where available, and then waits for a random delay before processing the next token. The script runs every 24 hours and processes the tokens from a file (`token.txt`).

## Features
- Automatically claims daily rewards for each token.
- Supports random delays between token processing to mimic human behavior.
- Runs every 24 hours, processing all tokens from `token.txt`.
- Provides logging and feedback for each step of the process.

## Setup

### Prerequisites
- Node.js (>= 14.0.0)
- npm (>= 6.0.0)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ganjsmoke/Humanity-V2.git
   cd Humanity-V2
   ```

2. Install the necessary dependencies:
   ```bash
   npm install axios
   ```

3. Prepare the `token.txt` file:
   - Create a file called `token.txt` in the root directory of the project.
   - Add each token on a new line, like this:
     ```
     token1
     token2
     token3
     ```

4. Run the script:
   ```bash
   node index.js
   ```

The script will start processing the tokens and claiming the daily rewards. It will continue running every 24 hours to repeat the process.

## File Structure

- `index.js`: The main script that processes the tokens and claims rewards.
- `token.txt`: A file that contains the list of tokens to be processed.
- `package.json`: Node.js dependencies and configuration.
- `README.md`: This file.

## Error Handling

- If there is an issue with claiming the daily reward, the error message will be logged, and the script will continue to the next token.
- If the `token.txt` file is missing or empty, an error message will be shown.

## License

This project is open-source and available under the [MIT License](LICENSE).

## Created by

[Airdrop With Meh](https://t.me/airdropwithmeh)

