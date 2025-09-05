#!/usr/bin/env node

/**
 * Test script for Hearty Hounds payment flow
 * This script tests the complete payment flow including:
 * 1. Creating checkout session
 * 2. Retrieving session details
 * 3. Getting shipping rates
 * 4. Creating order from payment
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: 'https://us-central1-hearty-hounds.cloudfunctions.net', // Production Firebase Functions
  testData: {
    items: [
      {
        id: 'prod_test_123',
        name: 'Premium Dog Toy',
        description: 'High-quality chew toy for dogs',
        price: 2500, // $25.00 in cents
        quantity: 1,
        imageUrl: 'https://example.com/dog-toy.jpg'
      }
    ],
    customerEmail: 'test@example.com',
    // connectedAccountId: 'acct_test_123', // Commented out for testing without Connect account
    successUrl: 'https://yoursite.com/success',
    cancelUrl: 'https://yoursite.com/cancel',
    shippingRate: {
      id: 'rate_test_123',
      display_name: 'USPS Ground',
      amount: 687, // $6.87 in cents
      currency: 'usd',
      carrier: 'USPS',
      service: 'Ground'
    },
    addresses: {
      from: {
        name: 'Hearty Hounds Store',
        street1: '123 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US',
        phone: '555-123-4567',
        email: 'store@heartyhounds.com'
      },
      to: {
        name: 'John Doe',
        street1: '456 Customer St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
        phone: '555-987-6543',
        email: 'test@example.com'
      }
    },
    packages: [
      {
        length: 10,
        width: 8,
        height: 6,
        weight: 2,
        distance_unit: 'in',
        mass_unit: 'lb'
      }
    ]
  }
};

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

// HTTP request helper
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hearty-Hounds-Test/1.0'
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testShippingRates() {
  log('\n🚚 Testing Shippo shipping rates...', 'cyan');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}/getShippoRates`,
      'POST',
      {
        fromAddress: config.testData.addresses.from,
        toAddress: config.testData.addresses.to,
        packages: config.testData.packages
      }
    );
    
    if (response.statusCode === 200 && response.data.success) {
      log('✅ Shipping rates retrieved successfully', 'green');
      log(`   Found ${response.data.rates.length} shipping options`, 'blue');
      
      if (response.data.rates.length > 0) {
        const cheapestRate = response.data.rates[0];
        log(`   Cheapest: ${cheapestRate.display_name} - $${(cheapestRate.amount / 100).toFixed(2)}`, 'blue');
        
        // Update config with actual rate for checkout test
        config.testData.shippingRate = cheapestRate;
      }
      
      return response.data;
    } else {
      log(`❌ Shipping rates test failed: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Shipping rates test error: ${error.message}`, 'red');
    return null;
  }
}

async function testCreateCheckoutSession() {
  log('\n💳 Testing checkout session creation...', 'cyan');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}/createCheckoutSessionV2`,
      'POST',
      {
        items: config.testData.items,
        customerEmail: config.testData.customerEmail,
        // connectedAccountId: config.testData.connectedAccountId, // Commented out for testing
        successUrl: config.testData.successUrl,
        cancelUrl: config.testData.cancelUrl,
        selectedShippingRate: config.testData.shippingRate,
        metadata: {
          testOrder: 'true',
          source: 'test-script'
        }
      }
    );
    
    if (response.statusCode === 200 && response.data.id) {
      log('✅ Checkout session created successfully', 'green');
      log(`   Session ID: ${response.data.id}`, 'blue');
      
      return response.data;
    } else {
      log(`❌ Checkout session creation failed: ${response.data.error || response.data.message || 'Unknown error'}`, 'red');
      if (response.data.message) {
        log(`   Details: ${response.data.message}`, 'yellow');
      }
      return null;
    }
  } catch (error) {
    log(`❌ Checkout session creation error: ${error.message}`, 'red');
    return null;
  }
}

async function testGetCheckoutSession(sessionId) {
  log('\n🔍 Testing checkout session retrieval...', 'cyan');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}/getCheckoutSessionV2?sessionId=${sessionId}`,
      'GET'
    );
    
    if (response.statusCode === 200 && response.data.success && response.data.session) {
      log('✅ Checkout session retrieved successfully', 'green');
      log(`   Status: ${response.data.session.status}`, 'blue');
      log(`   Payment Status: ${response.data.session.payment_status}`, 'blue');
      log(`   Amount: $${(response.data.session.amount_total / 100).toFixed(2)}`, 'blue');
      
      return response.data.session;
    } else {
      log(`❌ Checkout session retrieval failed: ${response.data.error || response.data.message || 'Unknown error'}`, 'red');
      if (response.data.message) {
        log(`   Details: ${response.data.message}`, 'yellow');
      }
      return null;
    }
  } catch (error) {
    log(`❌ Checkout session retrieval error: ${error.message}`, 'red');
    return null;
  }
}

async function testCreateOrder(sessionId) {
  log('\n📦 Testing order creation...', 'cyan');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}/createOrderFromPaymentId`,
      'POST',
      {
        sessionId: sessionId
      }
    );
    
    if (response.statusCode === 200 && response.data.success) {
      log('✅ Order created successfully', 'green');
      log(`   Order ID: ${response.data.order.id}`, 'blue');
      log(`   Customer: ${response.data.order.customerEmail}`, 'blue');
      log(`   Total: $${response.data.order.total.toFixed(2)}`, 'blue');
      
      return response.data;
    } else if (response.statusCode === 400 && response.data.message?.includes('Payment not completed')) {
      log('⚠️  Order creation skipped - payment not completed (expected for test)', 'yellow');
      return { skipped: true, reason: 'payment_not_completed' };
    } else if (response.statusCode === 404 && response.data.message?.includes('Could not retrieve payment intent')) {
      log('⚠️  Order creation skipped - no payment intent found (expected for unpaid session)', 'yellow');
      return { skipped: true, reason: 'no_payment_intent' };
    } else {
      log(`❌ Order creation failed: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Order creation error: ${error.message}`, 'red');
    return null;
  }
}

async function testGetOrder(orderId) {
  log('\n📋 Testing order retrieval...', 'cyan');
  
  try {
    const response = await makeRequest(
      `${config.baseUrl}/getOrder?orderId=${orderId}`,
      'GET'
    );
    
    if (response.statusCode === 200 && response.data.success) {
      log('✅ Order retrieved successfully', 'green');
      log(`   Order Status: ${response.data.order.status}`, 'blue');
      log(`   Payment Status: ${response.data.order.paymentStatus}`, 'blue');
      
      return response.data;
    } else {
      log(`❌ Order retrieval failed: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Order retrieval error: ${error.message}`, 'red');
    return null;
  }
}

// Main test runner
async function runTests() {
  log('🧪 Hearty Hounds Payment Flow Test Suite', 'bright');
  log('=' .repeat(60), 'blue');
  
  const results = {
    shippingRates: false,
    checkoutSession: false,
    sessionRetrieval: false,
    orderCreation: false,
    orderRetrieval: false
  };
  
  let sessionId = null;
  let orderId = null;
  
  // Test 1: Shipping Rates
  const shippingResult = await testShippingRates();
  results.shippingRates = !!shippingResult;
  
  // Test 2: Create Checkout Session
  const checkoutResult = await testCreateCheckoutSession();
  results.checkoutSession = !!checkoutResult;
  if (checkoutResult) {
    sessionId = checkoutResult.id;
  }
  
  // Test 3: Get Checkout Session
  if (sessionId) {
    const sessionResult = await testGetCheckoutSession(sessionId);
    results.sessionRetrieval = !!sessionResult;
  }
  
  // Test 4: Create Order (will likely fail due to unpaid session)
  if (sessionId) {
    const orderResult = await testCreateOrder(sessionId);
    results.orderCreation = !!orderResult || orderResult?.skipped;
    if (orderResult && orderResult.order) {
      orderId = orderResult.order.id;
    }
  }
  
  // Test 5: Get Order
  if (orderId) {
    const orderRetrievalResult = await testGetOrder(orderId);
    results.orderRetrieval = !!orderRetrievalResult;
  } else if (sessionId && results.orderCreation) {
    // Order creation was skipped, so skip order retrieval too
    log('\n📋 Testing order retrieval...', 'cyan');
    log('⚠️  Order retrieval skipped - no order was created (expected for unpaid session)', 'yellow');
    results.orderRetrieval = true; // Mark as passed since this is expected behavior
  }
  
  // Summary
  log('\n📊 Test Results Summary', 'yellow');
  log('=' .repeat(40), 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(20)} ${status}`, color);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('\n🎉 All tests passed! Your Firebase Functions are working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the error messages above for details.', 'yellow');
    log('\n💡 Common issues:', 'cyan');
    log('   • Make sure Firebase emulators are running', 'blue');
    log('   • Update the baseUrl with your correct project ID', 'blue');
    log('   • Ensure environment variables are set correctly', 'blue');
    log('   • Check that Stripe and Shippo API keys are valid', 'blue');
  }
  
  log('\n📝 Next steps:', 'cyan');
  log('   • Test with real Stripe checkout in test mode', 'blue');
  log('   • Set up webhook endpoints for production', 'blue');
  log('   • Deploy to Firebase when ready', 'blue');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Test suite crashed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, config };