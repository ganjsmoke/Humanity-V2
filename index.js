const fs = require('fs');
const axios = require('axios');

// Configure axios to always use Bearer token
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${config.token}`;
  return config;
});

const API_BASE = 'https://testnet.humanity.org/api';
const CYCLE_HOURS = 24;
const TOKEN_DELAY_SECONDS = [30, 60]; // Min and max delay between tokens
const MAX_RETRIES = 5; // Maximum retry attempts for API calls
const BASE_DELAY_MS = 10000; // Base delay for exponential backoff (1 second)

async function withRetry(requestFn, operationName) {
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      return await requestFn();
    } catch (error) {
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        attempt++;
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        
        console.log(`⏳ ${operationName} timeout (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${MAX_RETRIES} retries`);
}

async function getUserInfo(token) {
  return withRetry(async () => {
    const response = await axios.post(
      `${API_BASE}/user/userInfo`,
      {},
      { token, timeout: 10000 }
    );
    return response.data;
  }, 'User info');
}

async function claimDailyReward(token) {
  return withRetry(async () => {
    const response = await axios.post(
      `${API_BASE}/rewards/daily/claim`,
      {},
      { token, timeout: 10000 }
    );
    return response.data;
  }, 'Claim reward');
}

function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function getRandomDelay() {
  const [min, max] = TOKEN_DELAY_SECONDS;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function processToken(token) {
  console.log(`\nProcessing token: ${token.slice(0, 8)}...`);

  try {
    // Get user info with retry
    const userInfo = await getUserInfo(token);
    console.log(`✅ User: ${userInfo.data.nickName}`);
    console.log(`💰 Total Rewards: ${userInfo.data.totalRewards}`);

    // Skip token if daily reward not available
    if (!userInfo.data.daily_reward.available) {
      console.log('⏭ Daily reward not available - skipping token');
      return;
    }

    // Claim daily reward with retry
    console.log('🎯 Daily reward available - claiming...');
    const claimResult = await claimDailyReward(token);
    console.log(`🎉 Claimed ${claimResult.amount} tokens!`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function processAllTokens() {
  // Read tokens from file
  let tokens;
  try {
    tokens = fs.readFileSync('token.txt', 'utf-8')
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  } catch (err) {
    console.error('❌ Error reading token file:', err.message);
    return;
  }

  if (tokens.length === 0) {
    console.log('No tokens found in token.txt');
    return;
  }

  console.log(`Processing ${tokens.length} tokens...`);

  // Process tokens sequentially with random delays
  for (const [index, token] of tokens.entries()) {
    await processToken(token);
    
    // Add random delay between tokens
    if (index < tokens.length - 1) {
      const waitSeconds = getRandomDelay();
      console.log(`⏱ Waiting ${waitSeconds} seconds before next token...`);
      await delay(waitSeconds);
    }
  }
}

async function main() {
  console.log('🚀 Starting daily reward claimer...');
  console.log(`⏳ Tokens will be processed every ${CYCLE_HOURS} hours`);
  
  // Convert hours to milliseconds
  const cycleDurationMs = CYCLE_HOURS * 60 * 60 * 1000;
  
  while (true) {
    const cycleStart = Date.now();
    const startTime = new Date(cycleStart);
    
    console.log(`\n⏰ Cycle started at: ${startTime.toLocaleString()}`);
    await processAllTokens();
    
    const cycleEnd = Date.now();
    const cycleTime = (cycleEnd - cycleStart) / 1000;
    console.log(`⏱ Cycle completed in ${cycleTime.toFixed(1)} seconds`);
    
    // Calculate next cycle start time (24 hours from start)
    const nextCycleTime = new Date(cycleStart + cycleDurationMs);
    console.log(`⏰ Next cycle will start at: ${nextCycleTime.toLocaleString()}`);
    
    // Calculate remaining sleep time
    const sleepTime = Math.max(0, (cycleStart + cycleDurationMs) - Date.now());
    const sleepHours = sleepTime / (1000 * 60 * 60);
    
    console.log(`💤 Sleeping for ${sleepHours.toFixed(2)} hours until next cycle...`);
    
    // Sleep until next cycle time
    await delay(sleepTime / 1000);
  }
}

main().catch(console.error);