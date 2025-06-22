# StylePOS - Clothing Point of Sale System

A modern, responsive Point of Sale system for clothing stores built with HTML, CSS, JavaScript, and Firebase.

## Features

- 🔐 User Authentication (Email/Password)
- 🛍️ Product Catalog with Categories
- 🛒 Shopping Cart Management
- 💳 Checkout Process
- 👥 User Account Management
- 📊 Sales Dashboard
- 📱 Responsive Design
- 🔥 Firebase Integration

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Hosting**: Vercel
- **Version Control**: Git/GitHub

## Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd clothing-pos-system
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore database
5. Copy configuration to your project

### 3. Configuration
1. Replace Firebase config in `public/firebase.js`
2. Set up Vercel environment variables
3. Configure Firestore security rules

### 4. Deployment

#### Vercel Deployment
```bash
npm install -g vercel
vercel
```

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

## Project Structure

```
clothing-pos-system/
├── public/
│   ├── index.html          # Main application
│   ├── style.css
│   ├── firebase.js         # Firebase configuration and services
│   ├── assets/
│   │   └── images/         # Product images
│   └── scripts/
│       └── main.js         # Main application logic
├── package.json            # Dependencies and scripts
├── firebase.json           # Firebase configuration
├── firestore.rules         # Security rules
├── firestore.indexes.json  # Database indexes
├── vercel.json             # Vercel configuration
├── .gitignore              # Git ignore file
└── README.md               # Documentation
```

## Database Schema

### Users Collection
```javascript
{
  uid: string,
  email: string,
  fullName: string,
  phone: string,
  address: string,
  deliveryOption: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Products Collection
```javascript
{
  id: string,
  name: string,
  price: number,
  category: string,
  image: string,
  stock: number,
  description: string,
  createdAt: timestamp
}
```

### Orders Collection
```javascript
{
  userId: string,
  items: array,
  total: number,
  paymentMethod: string,
  status: string,
  deliveryAddress: string,
  createdAt: timestamp
}
```

## Environment Variables

```bash
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your_app_id
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details