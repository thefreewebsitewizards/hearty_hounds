const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Seller address data
const sellerAddress = {
  name: "Hearty Hounds",
  company: "Hearty Hounds LLC",
  street: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  zip: "94102",
  country: "US",
  phone: "+1-555-123-4567",
  createdAt: new Date(),
  updatedAt: new Date()
};

async function createSellerAddress() {
  try {
    console.log('Creating seller address in Firestore...');
    
    // Delete any existing seller addresses first
    const existingAddresses = await db.collection('sellerAddresses').get();
    for (const doc of existingAddresses.docs) {
      await doc.ref.delete();
      console.log('Deleted existing address:', doc.id);
    }
    
    // Add the new seller address
    const docRef = await db.collection('sellerAddresses').add(sellerAddress);
    
    console.log('✅ Seller address created successfully!');
    console.log('Document ID:', docRef.id);
    console.log('Address details:', sellerAddress);
    
    // Verify the document was created
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('✅ Verification successful - document exists in Firestore');
      console.log('Retrieved data:', doc.data());
    } else {
      console.log('❌ Verification failed - document not found');
    }
    
  } catch (error) {
    console.error('❌ Error creating seller address:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createSellerAddress();