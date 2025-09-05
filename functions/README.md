# Hearty Hounds Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the Hearty Hounds e-commerce platform, implementing Stripe payment processing with Stripe Connect, Shippo shipping integration, and order management.

## 🚀 Features

- **Stripe Checkout Integration**: Create and manage checkout sessions with Stripe Connect
- **Payment Processing**: Handle payments with 10% platform fee and automatic fund distribution
- **Shipping Integration**: Real-time shipping rates via Shippo API
- **Order Management**: Automated order creation and inventory updates
- **Error Handling**: Comprehensive error logging and monitoring
- **Security**: Firestore security rules and input validation

## 📁 Project Structure

```
functions/
├── src/
│   ├── stripe/
│   │   ├── createCheckoutSession.ts    # Create Stripe checkout sessions
│   │   └── getCheckoutSession.ts       # Retrieve session details
│   ├── shipping/
│   │   └── shippoRates.ts             # Shippo shipping rate calculations
│   ├── orders/
│   │   └── createOrder.ts             # Order creation and management
│   ├── utils/
│   │   └── errorHandler.ts            # Error handling utilities
│   └── index.ts                       # Main exports
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- Firebase CLI
- Stripe account with Connect enabled
- Shippo account

### Installation

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

3. **Set Firebase environment variables:**
   ```bash
   firebase functions:config:set stripe.secret_key="sk_test_..."
   firebase functions:config:set shippo.api_key="shippo_test_..."
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | ✅ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ✅ |
| `SHIPPO_API_KEY` | Shippo API key | ✅ |
| `PLATFORM_FEE_PERCENTAGE` | Platform fee (default: 10) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

## 🚀 Deployment

### Development

1. **Start emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Test functions locally:**
   ```bash
   # Functions will be available at http://localhost:5001
   ```

### Production

1. **Deploy to Firebase:**
   ```bash
   firebase deploy --only functions
   ```

2. **Deploy specific function:**
   ```bash
   firebase deploy --only functions:createCheckoutSessionV2
   ```

## 📡 API Endpoints

### Stripe Functions

#### Create Checkout Session
```
POST /createCheckoutSessionV2
```

**Request Body:**
```json
{
  "items": [
    {
      "id": "product_123",
      "name": "Dog Toy",
      "price": 2500,
      "quantity": 1
    }
  ],
  "customerEmail": "customer@example.com",
  "connectedAccountId": "acct_123",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "selectedShippingRate": {
    "id": "rate_123",
    "amount": 687,
    "display_name": "USPS Ground"
  }
}
```

#### Get Checkout Session
```
GET /getCheckoutSessionV2?sessionId=cs_test_123
```

### Shipping Functions

#### Get Shipping Rates
```
POST /getShippoRates
```

**Request Body:**
```json
{
  "fromAddress": {
    "name": "Seller Name",
    "street1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "country": "US"
  },
  "toAddress": {
    "name": "Customer Name",
    "street1": "456 Oak Ave",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "packages": [
    {
      "length": 10,
      "width": 8,
      "height": 6,
      "weight": 2,
      "distance_unit": "in",
      "mass_unit": "lb"
    }
  ]
}
```

### Order Functions

#### Create Order from Payment
```
POST /createOrderFromPaymentId
```

**Request Body:**
```json
{
  "sessionId": "cs_test_123"
}
```

#### Get Order
```
GET /getOrder?orderId=order_123
```

## 💰 Payment Flow

1. **Customer Checkout:**
   - Frontend calls `createCheckoutSessionV2`
   - Customer redirected to Stripe Checkout
   - Payment processed with 10% platform fee

2. **Fund Distribution:**
   - Platform fee (10%) retained
   - Remaining amount transferred to connected account
   - Stripe processing fees deducted

3. **Order Creation:**
   - `createOrderFromPaymentId` called after successful payment
   - Order stored in Firestore
   - Inventory updated
   - Email notifications sent

## 🔒 Security

- **Input Validation**: All inputs validated and sanitized
- **Error Handling**: Comprehensive error logging without exposing sensitive data
- **CORS**: Configured for specific origins
- **Firestore Rules**: Strict access control rules
- **API Keys**: Stored securely in Firebase environment

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Test with Stripe CLI
```bash
# Listen for webhooks
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

## 📊 Monitoring

- **Error Logs**: Stored in Firestore `errorLogs` collection
- **Firebase Console**: Function logs and metrics
- **Stripe Dashboard**: Payment and Connect account monitoring
- **Shippo Dashboard**: Shipping rate usage

## 🔧 Troubleshooting

### Common Issues

1. **Stripe Connect Account Not Found:**
   - Ensure connected account ID is valid
   - Check account status in Stripe Dashboard

2. **Shippo Rate Calculation Fails:**
   - Verify address format
   - Check package dimensions
   - Ensure Shippo API key is valid

3. **Order Creation Fails:**
   - Check Firestore security rules
   - Verify payment intent status
   - Review error logs in Firestore

### Debug Mode

Set `NODE_ENV=development` for detailed logging:

```bash
export NODE_ENV=development
firebase emulators:start
```

## 📝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include unit tests for new functions
4. Update documentation
5. Test with emulators before deployment

## 📄 License

This project is licensed under the MIT License.