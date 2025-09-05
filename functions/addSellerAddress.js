const admin = require('firebase-admin');

// Initialize Firebase Admin (uses default credentials)
admin.initializeApp();

const db = admin.firestore();

// Default seller address for Hearty Hounds
const sellerAddress = {
  name: "Hearty Hounds",
  street1: "123 Main Street",
  street2: "",
  city: "San Francisco",
  state: "CA",
  zip: "94102",
  country: "US",
  phone: "+1-555-123-4567",
  email: "shipping@heartyhounds.com",
  createdAt: admin.firestore.Timestamp.now(),
  updatedAt: admin.firestore.Timestamp.now()
};

async function addSellerAddress() {
  try {
    console.log('Adding seller address to Firestore...');
    
    // Add the seller address to the sellerAddresses collection
    await db.collection('sellerAddresses').doc('default').set(sellerAddress);
    
    console.log('✅ Seller address added successfully!');
    console.log('Address details:', sellerAddress);
    
    // Verify the document was created
    const doc = await db.collection('sellerAddresses').doc('default').get();
    if (doc.exists) {
      console.log('✅ Verification successful - document exists in Firestore');
    } else {
      console.log('❌ Verification failed - document not found');
    }
    
  } catch (error) {
    console.error('❌ Error adding seller address:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addSellerAddress();