#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    log(`✅ ${description} completed successfully`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

function checkEnvironment() {
  log('\n🔍 Checking environment...', 'yellow');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log('⚠️  .env file not found. Please copy .env.example to .env and configure your API keys.', 'yellow');
  }
  
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    log('✅ Firebase CLI is installed', 'green');
  } catch (error) {
    log('❌ Firebase CLI not found. Please install it: npm install -g firebase-tools', 'red');
    process.exit(1);
  }
  
  // Check if logged in to Firebase
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    log('✅ Firebase authentication verified', 'green');
  } catch (error) {
    log('❌ Not logged in to Firebase. Please run: firebase login', 'red');
    process.exit(1);
  }
}

function setEnvironmentVariables() {
  log('\n🔧 Setting up environment variables...', 'yellow');
  
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log('⚠️  Skipping environment variable setup - .env file not found', 'yellow');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  // Set critical environment variables
  const criticalVars = [
    'STRIPE_SECRET_KEY',
    'SHIPPO_API_KEY',
    'NODE_ENV'
  ];
  
  criticalVars.forEach(varName => {
    if (envVars[varName]) {
      try {
        const configKey = varName.toLowerCase().replace('_', '.');
        execSync(`firebase functions:config:set ${configKey}="${envVars[varName]}"`, { stdio: 'pipe' });
        log(`✅ Set ${varName}`, 'green');
      } catch (error) {
        log(`⚠️  Failed to set ${varName}`, 'yellow');
      }
    }
  });
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';
  
  log('🚀 Hearty Hounds Firebase Functions Deployment Script', 'bright');
  log('=' .repeat(60), 'blue');
  
  switch (command) {
    case 'setup':
      checkEnvironment();
      execCommand('npm install', 'Installing dependencies');
      setEnvironmentVariables();
      execCommand('npm run build', 'Building TypeScript');
      log('\n🎉 Setup completed! You can now run: npm run deploy', 'green');
      break;
      
    case 'build':
      execCommand('npm run build', 'Building TypeScript');
      break;
      
    case 'deploy':
      checkEnvironment();
      execCommand('npm run build', 'Building TypeScript');
      execCommand('firebase deploy --only functions', 'Deploying to Firebase');
      log('\n🎉 Deployment completed successfully!', 'green');
      break;
      
    case 'deploy-single':
      const functionName = args[1];
      if (!functionName) {
        log('❌ Please specify a function name: npm run deploy-single <functionName>', 'red');
        process.exit(1);
      }
      checkEnvironment();
      execCommand('npm run build', 'Building TypeScript');
      execCommand(`firebase deploy --only functions:${functionName}`, `Deploying ${functionName}`);
      log(`\n🎉 ${functionName} deployed successfully!`, 'green');
      break;
      
    case 'emulator':
      checkEnvironment();
      execCommand('npm run build', 'Building TypeScript');
      log('\n🔥 Starting Firebase emulators...', 'yellow');
      execSync('firebase emulators:start', { stdio: 'inherit' });
      break;
      
    case 'test':
      execCommand('npm test', 'Running tests');
      break;
      
    case 'logs':
      const logFunction = args[1] || '';
      const logCommand = logFunction 
        ? `firebase functions:log --only ${logFunction}`
        : 'firebase functions:log';
      execSync(logCommand, { stdio: 'inherit' });
      break;
      
    case 'config':
      log('\n📋 Current Firebase configuration:', 'yellow');
      execSync('firebase functions:config:get', { stdio: 'inherit' });
      break;
      
    case 'help':
    default:
      log('\n📖 Available commands:', 'yellow');
      log('  setup        - Initial setup (install deps, set config, build)', 'cyan');
      log('  build        - Build TypeScript only', 'cyan');
      log('  deploy       - Build and deploy all functions', 'cyan');
      log('  deploy-single <name> - Deploy a single function', 'cyan');
      log('  emulator     - Start Firebase emulators', 'cyan');
      log('  test         - Run tests', 'cyan');
      log('  logs [name]  - View function logs', 'cyan');
      log('  config       - Show current configuration', 'cyan');
      log('  help         - Show this help', 'cyan');
      log('\n📝 Examples:', 'yellow');
      log('  node deploy.js setup', 'green');
      log('  node deploy.js deploy', 'green');
      log('  node deploy.js deploy-single createCheckoutSessionV2', 'green');
      log('  node deploy.js emulator', 'green');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, checkEnvironment, setEnvironmentVariables };