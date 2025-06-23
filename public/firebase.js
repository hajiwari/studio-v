// Firebase Configuration for Studio V
// Firebase SDK Configuration
const firebaseConfig = {  
  apiKey: "AIzaSyBXsbxQ-uDmULoJNyvI-KJ6ODRngXUvy-s",
  authDomain: "online-shop-pos-cf4f8.firebaseapp.com",
  databaseURL: "https://online-shop-pos-cf4f8-default-rtdb.firebaseio.com",
  projectId: "online-shop-pos-cf4f8",
  storageBucket: "online-shop-pos-cf4f8.firebasestorage.app",
  messagingSenderId: "229498443813",
  appId: "1:229498443813:web:8fb4b24c7bea54141cc7cc",
  measurementId: "G-ETW62VRQ1C"
};

// Initialize Firebase
let app, auth, db, storage, analytics;

try {
  // Initialize Firebase App
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);

    // Initialize Firebase Services
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();

    // Initialize Analytics (optional)
    if (firebase.analytics && typeof firebase.analytics === 'function') {
      analytics = firebase.analytics();
    }

    console.log('Firebase initialized successfully');

    // Configure Firestore settings
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });

    // Enable offline persistence
    db.enablePersistence({ synchronizeTabs: true })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support persistence.');
        }
      });

  } else {
    console.error('Firebase SDK not loaded');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Authentication Service
class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];

    if (auth) {
      auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.notifyAuthStateChange(user);
      });
    }
  }

  // Add auth state listener
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    if (this.currentUser !== null) {
      callback(this.currentUser);
    }
  }

  // Notify all listeners of auth state change
  notifyAuthStateChange(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Sign up with email and password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Update user profile with display name
      await user.updateProfile({
        displayName: displayName
      });

      // Create user document in Firestore
      await this.createUserDocument(user, { displayName });

      return { success: true, user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      // Create or update user document
      await this.createUserDocument(user);

      return { success: true, user };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign in with GitHub
  async signInWithGitHub() {
    try {
      const provider = new firebase.auth.GithubAuthProvider();
      provider.addScope('user:email');

      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      // Create or update user document
      await this.createUserDocument(user);

      return { success: true, user };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Create user document in Firestore
  async createUserDocument(user, additionalData = {}) {
    if (!user) return;

    const userRef = db.collection('users').doc(user.uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
      const { displayName, email, photoURL } = user;
      const createdAt = new Date();

      try {
        await userRef.set({
          displayName,
          email,
          photoURL,
          createdAt,
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }

    return userRef;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }
}

// Firestore Database Service
class DatabaseService {
  constructor() {
    this.db = db;
  }

  // Products operations
  async getProducts(limit = 20, category = null) {
    try {
      let query = this.db.collection('products')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getProduct(productId) {
    try {
      const doc = await this.db.collection('products').doc(productId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Orders operations
  async createOrder(orderData) {
    try {
      const orderRef = await this.db.collection('orders').add({
        ...orderData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, orderId: orderRef.id };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserOrders(userId, limit = 10) {
    try {
      const snapshot = await this.db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      await this.db.collection('orders').doc(orderId).update({
        status,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  }

  // User profile operations
  async updateUserProfile(userId, profileData) {
    try {
      await this.db.collection('users').doc(userId).update({
        ...profileData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(userId) {
    try {
      const doc = await this.db.collection('users').doc(userId).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Addresses operations
  async addUserAddress(userId, addressData) {
    try {
      const addressRef = await this.db.collection('users').doc(userId)
        .collection('addresses').add({
          ...addressData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      return { success: true, addressId: addressRef.id };
    } catch (error) {
      console.error('Error adding address:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserAddresses(userId) {
    try {
      const snapshot = await this.db.collection('users').doc(userId)
        .collection('addresses')
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  async updateUserAddress(userId, addressId, addressData) {
    try {
      await this.db.collection('users').doc(userId)
        .collection('addresses').doc(addressId)
        .update({
          ...addressData,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      return { success: true };
    } catch (error) {
      console.error('Error updating address:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteUserAddress(userId, addressId) {
    try {
      await this.db.collection('users').doc(userId)
        .collection('addresses').doc(addressId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting address:', error);
      return { success: false, error: error.message };
    }
  }

  // Wishlist operations
  async addToWishlist(userId, productId) {
    try {
      await this.db.collection('users').doc(userId)
        .collection('wishlist').doc(productId).set({
          productId,
          addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: error.message };
    }
  }

  async removeFromWishlist(userId, productId) {
    try {
      await this.db.collection('users').doc(userId)
        .collection('wishlist').doc(productId).delete();
      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserWishlist(userId) {
    try {
      const snapshot = await this.db.collection('users').doc(userId)
        .collection('wishlist')
        .orderBy('addedAt', 'desc')
        .get();

      const wishlistItems = snapshot.docs.map(doc => doc.data().productId);

      if (wishlistItems.length === 0) return [];

      // Get product details for wishlist items
      const products = [];
      for (const productId of wishlistItems) {
        const product = await this.getProduct(productId);
        if (product) {
          products.push(product);
        }
      }

      return products;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  }
}

// Storage Service for file uploads
class StorageService {
  constructor() {
    this.storage = storage;
  }

  async uploadImage(file, path) {
    try {
      const storageRef = this.storage.ref().child(path);
      const snapshot = await storageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteImage(path) {
    try {
      const storageRef = this.storage.ref().child(path);
      await storageRef.delete();
      return { success: true };
    } catch (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }
  }
}

// Analytics Service
class AnalyticsService {
  constructor() {
    this.analytics = analytics;
  }

  logEvent(eventName, parameters = {}) {
    if (this.analytics) {
      this.analytics.logEvent(eventName, parameters);
    }
  }

  setUserProperties(properties) {
    if (this.analytics) {
      Object.keys(properties).forEach(key => {
        this.analytics.setUserProperties({ [key]: properties[key] });
      });
    }
  }

  logPurchase(transactionId, value, currency = 'USD', items = []) {
    this.logEvent('purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items
    });
  }

  logAddToCart(currency = 'USD', value, items = []) {
    this.logEvent('add_to_cart', {
      currency: currency,
      value: value,
      items: items
    });
  }

  logViewItem(currency = 'USD', value, items = []) {
    this.logEvent('view_item', {
      currency: currency,
      value: value,
      items: items
    });
  }
}

// Initialize services
const authService = new AuthService();
const databaseService = new DatabaseService();
const storageService = new StorageService();
const analyticsService = new AnalyticsService();

// Export services for global access
window.firebase = firebase;
window.authService = authService;
window.databaseService = databaseService;
window.storageService = storageService;
window.analyticsService = analyticsService;

// Export Firebase instances
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseStorage = storage;
window.firebaseAnalytics = analytics;

// Global error handler for Firebase operations
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.code && event.reason.code.includes('firebase')) {
    console.error('Firebase Error:', event.reason);
    // You can add custom error handling here
  }
});

console.log('Firebase services initialized:', {
  auth: !!auth,
  firestore: !!db,
  storage: !!storage,
  analytics: !!analytics
});