# Local Development Setup Guide

## 🚀 Quick Start for Testing Checkout

Your Firebase Functions are implemented but need to be connected to the frontend. Follow these steps:

### 1. Configure Firebase Project

1. **Get your Firebase Project ID:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Copy the Project ID from the project settings

2. **Update the function URLs in your code:**
   - Replace `your-project-id` in the following files with your actual Firebase project ID:
     - `src/services/stripe.ts`
     - `src/services/clientShipping.ts`

### 2. Set Up Environment Variables

1. **In the `functions` directory:**
   ```bash
   cd functions
   cp .env.example .env
   ```

2. **Edit the `.env` file and add your API keys:**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   SHIPPO_API_KEY=your_shippo_api_key
   ```

3. **In the root directory, create/update `.env`:**
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

### 3. Start Firebase Emulators

1. **Install Firebase CLI (if not already installed):**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase project:**
   ```bash
   firebase use --add
   # Select your project and give it an alias like 'default'
   ```

4. **Start the emulators:**
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase emulators:start
   ```

### 4. Test the Checkout Flow

1. **Make sure your React app is running:**
   ```bash
   npm start
   ```

2. **Open your browser to `http://localhost:3000`**

3. **Add items to cart and proceed to checkout**

4. **The checkout should now work with the local Firebase functions**

## 🔧 Troubleshooting

### Common Issues:

1. **"Function not found" errors:**
   - Make sure you've replaced `your-project-id` with your actual Firebase project ID
   - Ensure Firebase emulators are running on port 5001

2. **CORS errors:**
   - The functions are configured with CORS enabled
   - Make sure you're accessing from `localhost:3000`

3. **Stripe errors:**
   - Verify your Stripe test keys are correct
   - Make sure you're using test mode keys (start with `pk_test_` and `sk_test_`)

4. **Emulator not starting:**
   - Run `firebase login` first
   - Make sure you have the correct project selected with `firebase use`
   - Check that ports 5001, 8080, 9099 are not in use

### Quick Test Commands:

```bash
# Test if functions are running
curl http://localhost:5001/your-project-id/us-central1/createCheckoutSessionV2

# Check emulator status
firebase emulators:start --only functions
```

## 📝 Next Steps

Once local testing works:
1. Deploy functions to Firebase: `firebase deploy --only functions`
2. Update the production URLs in your frontend code
3. Set up Stripe webhooks for production
4. Configure production environment variables

## 🆘 Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Check the Firebase emulator logs
3. Verify all environment variables are set correctly
4. Make sure your Stripe account is set up for Connect (if using multi-vendor features)