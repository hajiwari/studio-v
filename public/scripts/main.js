// Studio V - Main Application Logic

// Global State Management
const AppState = {
    user: null,
    cart: [],
    products: [],
    currentPage: 1,
    productsPerPage: 8,
    currentFilter: 'all',
    isLoading: false
};

// Sample Product Data (In production, this would come from Firestore)
const sampleProducts = [
    {
        id: 'p1',
        name: 'Premium Cotton T-Shirt',
        category: 'men',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
        description: 'Comfortable premium cotton t-shirt for everyday wear',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Navy'],
        inStock: true,
        rating: 4.5
    },
    {
        id: 'p2',
        name: 'Designer Jeans',
        category: 'men',
        price: 289.99,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        description: 'Stylish designer jeans with perfect fit',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['Blue', 'Black', 'Grey'],
        inStock: true,
        rating: 4.7
    },
    {
        id: 'p3',
        name: 'Elegant Dress',
        category: 'women',
        price: 429.99,
        image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
        description: 'Beautiful elegant dress for special occasions',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'Red', 'Navy'],
        inStock: true,
        rating: 4.8
    },
    {
        id: 'p4',
        name: 'Casual Blouse',
        category: 'women',
        price: 245.99,
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
        description: 'Comfortable casual blouse for daily wear',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['White', 'Pink', 'Light Blue'],
        inStock: true,
        rating: 4.3
    },
    {
        id: 'p5',
        name: 'Leather Wallet',
        category: 'accessories',
        price: 559.99,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        description: 'Premium leather wallet with multiple compartments',
        colors: ['Brown', 'Black'],
        inStock: true,
        rating: 4.6
    },
    {
        id: 'p6',
        name: 'Designer Handbag',
        category: 'accessories',
        price: 1199.99,
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
        description: 'Stylish designer handbag for modern women',
        colors: ['Black', 'Brown', 'Beige'],
        inStock: true,
        rating: 4.9
    },
    {
        id: 'p7',
        name: 'Sports Hoodie',
        category: 'men',
        price: 269.99,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
        description: 'Comfortable sports hoodie for active lifestyle',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Grey', 'Black', 'Navy'],
        inStock: true,
        rating: 4.4
    },
    {
        id: 'p8',
        name: 'Summer Skirt',
        category: 'women',
        price: 39.99,
        image: 'https://plus.unsplash.com/premium_photo-1671379012427-ce867d9ac465?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        description: 'Light and breezy summer skirt',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Floral', 'Solid Blue', 'White'],
        inStock: true,
        rating: 4.2
    }
];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
    loadProducts();
    loadCartFromStorage();
    updateCartUI();
});

// Initialize Firebase and App
function initializeApp() {
    // Firebase will be initialized in firebase.js
    console.log('Studio V App Initialized');

    // Check if user is logged in
    if (window.firebase && window.firebase.auth) {
        window.firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                AppState.user = user;
                updateAuthUI(true);
                loadUserData();
            } else {
                AppState.user = null;
                updateAuthUI(false);
            }
        });
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.dataset.filter;
            setActiveFilter(this, filter);
            filterProducts(filter);
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Form submissions
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }

    // Scroll events
    window.addEventListener('scroll', handleScroll);
}

// Product Management
function loadProducts() {
    AppState.products = [...sampleProducts];
    renderProducts(AppState.products);
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const startIndex = (AppState.currentPage - 1) * AppState.productsPerPage;
    const endIndex = startIndex + AppState.productsPerPage;
    const productsToShow = products.slice(startIndex, endIndex);

    if (AppState.currentPage === 1) {
        grid.innerHTML = '';
    }

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        grid.appendChild(productCard);
    });

    // Show/hide load more button
    const loadMoreBtn = document.querySelector('.load-more-container');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = endIndex >= products.length ? 'none' : 'block';
    }
}


function createProductCard(product) {
    const template = document.getElementById('productCardTemplate');
    if (!template) return document.createElement('div');

    const card = template.firstElementChild.cloneNode(true);

    // Set image
    const img = card.querySelector('.product-image img');
    img.src = product.image;
    img.alt = `Premium clothing product. ${product.name} is ${product.description}. Category: ${product.category}. Sizes: ${product.sizes ? product.sizes.join(', ') : 'N/A'}. Colors: ${product.colors ? product.colors.join(', ') : 'N/A'}. Rated ${product.rating} out of 5. Product displayed on a clean white background.`;
    img.onerror = function () {
        this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f0f0f0"/><text x="50" y="150" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">Image unavailable</text></svg>';
    };

    // Set name, category, rating, price
    card.querySelector('.product-name').textContent = product.name;
    card.querySelector('.product-category').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
    card.querySelector('.product-rating').innerHTML = generateStars(product.rating) + `<span class="rating-text">(${product.rating})</span>`;
    card.querySelector('.product-price').textContent = `₱${product.price.toFixed(2)}`;

    // Sizes
    const sizesDiv = card.querySelector('.product-sizes');
    if (product.sizes) {
        sizesDiv.innerHTML = product.sizes.map(size => `<span class="size-tag">${size}</span>`).join('');
        sizesDiv.style.display = '';
    } else {
        sizesDiv.style.display = 'none';
    }

    // Add to Cart button
    card.querySelector('.add-to-cart-btn').onclick = () => addToCart(product.id);
    // Quick View button
    card.querySelector('.quick-view-btn').onclick = () => viewProduct(product.id);

    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Filter and Search
function setActiveFilter(button, filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    AppState.currentFilter = filter;
    AppState.currentPage = 1;
}

function filterProducts(filter) {
    let filteredProducts = AppState.products;

    if (filter !== 'all') {
        filteredProducts = AppState.products.filter(product => product.category === filter);
    }

    renderProducts(filteredProducts);
}

function loadMoreProducts() {
    AppState.currentPage++;
    let filteredProducts = AppState.products;

    if (AppState.currentFilter !== 'all') {
        filteredProducts = AppState.products.filter(product => product.category === AppState.currentFilter);
    }

    renderProducts(filteredProducts);
}

// Cart Management
function addToCart(productId, size = null, color = null) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    const cartItem = {
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        color: color,
        quantity: 1
    };

    const existingItem = AppState.cart.find(item =>
        item.id === productId && item.size === size && item.color === color
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        AppState.cart.push(cartItem);
    }

    updateCartUI();
    saveCartToStorage();
    showToast('Product added to cart!', 'success');
}

function removeFromCart(index) {
    AppState.cart.splice(index, 1);
    updateCartUI();
    saveCartToStorage();
    showToast('Product removed from cart', 'info');
}

function updateCartQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(index);
        return;
    }

    AppState.cart[index].quantity = newQuantity;
    updateCartUI();
    saveCartToStorage();
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const emptyCart = document.getElementById('emptyCart');

    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = totalPrice.toFixed(2);

    if (cartItems) {
        if (AppState.cart.length === 0) {
            cartItems.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
        } else {
            cartItems.style.display = 'block';
            if (emptyCart) emptyCart.style.display = 'none';

            cartItems.innerHTML = AppState.cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                        ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                        <div class="cart-item-quantity">
                            <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        <button onclick="removeFromCart(${index})" class="remove-item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
}

function saveCartToStorage() {
    localStorage.setItem('studioV_cart', JSON.stringify(AppState.cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('studioV_cart');
    if (savedCart) {
        AppState.cart = JSON.parse(savedCart);
    }
}

// UI Functions
// function toggleCart() {
//     const cartSidebar = document.getElementById('cartSidebar');
//     if (cartSidebar) {
//         cartSidebar.classList.toggle('active');
//     }
// }

function toggleMobileMenu() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('mobile-active');
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Modal Functions
function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showCheckoutModal() {
    if (AppState.cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateCheckoutSummary();
    }
}

function hideCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        showTab('profile');
    }
}

function hideAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Authentication Functions
function toggleAuthMode() {
    const title = document.getElementById('authTitle');
    const submit = document.getElementById('authSubmit');
    const nameGroup = document.getElementById('nameGroup');
    const switchText = document.getElementById('authSwitchText');

    const isSignIn = title.textContent === 'Sign In';

    if (isSignIn) {
        title.textContent = 'Sign Up';
        submit.textContent = 'Sign Up';
        nameGroup.style.display = 'block';
        switchText.innerHTML = 'Already have an account? <span class="auth-link" onclick="toggleAuthMode()">Sign In</span>';
    } else {
        title.textContent = 'Sign In';
        submit.textContent = 'Sign In';
        nameGroup.style.display = 'none';
        switchText.innerHTML = 'Don\'t have an account? <span class="auth-link" onclick="toggleAuthMode()">Sign Up</span>';
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName').value;
    const isSignUp = document.getElementById('authTitle').textContent === 'Sign Up';

    showLoading(true);

    if (isSignUp) {
        signUpUser(email, password, fullName);
    } else {
        signInUser(email, password);
    }
}

async function signUpUser(email, password, fullName) {
    try {
        if (window.firebase && window.firebase.auth) {
            const userCredential = await window.firebase.auth().createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: fullName });

            // Save user data to Firestore
            if (window.firebase.firestore) {
                await window.firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                    name: fullName,
                    email: email,
                    createdAt: new Date()
                });
            }

            showToast('Account created successfully!', 'success');
            hideAuthModal();
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function signInUser(email, password) {
    try {
        if (window.firebase && window.firebase.auth) {
            await window.firebase.auth().signInWithEmailAndPassword(email, password);
            showToast('Signed in successfully!', 'success');
            hideAuthModal();
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function signInWithGoogle() {
    try {
        if (window.firebase && window.firebase.auth) {
            const provider = new window.firebase.auth.GoogleAuthProvider();
            await window.firebase.auth().signInWithPopup(provider);
            showToast('Signed in with Google!', 'success');
            hideAuthModal();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function signInWithGitHub() {
    try {
        if (window.firebase && window.firebase.auth) {
            const provider = new window.firebase.auth.GithubAuthProvider();
            await window.firebase.auth().signInWithPopup(provider);
            showToast('Signed in with GitHub!', 'success');
            hideAuthModal();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function signOut() {
    try {
        if (window.firebase && window.firebase.auth) {
            await window.firebase.auth().signOut();
            showToast('Signed out successfully!', 'success');
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function updateAuthUI(isSignedIn) {
    const authBtn = document.querySelector('.auth-btn');
    const authText = document.querySelector('.auth-text');

    if (authBtn && authText) {
        if (isSignedIn) {
            authText.textContent = AppState.user?.displayName || 'Account';
            authBtn.onclick = showAccountModal;
        } else {
            authText.textContent = 'Sign In';
            authBtn.onclick = showAuthModal;
        }
    }
}

// Checkout Functions
function proceedToCheckout() {
    if (!AppState.user) {
        showToast('Please sign in to continue', 'error');
        // toggleCart();
        showAuthModal();
        return;
    }

    // toggleCart();
    showCheckoutModal();
}

function updateCheckoutSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const finalTotal = document.getElementById('finalTotal');

    const subtotalAmount = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingAmount = 9.99;
    const total = subtotalAmount + shippingAmount;

    if (summaryItems) {
        summaryItems.innerHTML = AppState.cart.map(item => `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    if (subtotal) subtotal.textContent = subtotalAmount.toFixed(2);
    if (shipping) shipping.textContent = shippingAmount.toFixed(2);
    if (finalTotal) finalTotal.textContent = total.toFixed(2);
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    placeOrder();
}

async function placeOrder() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);

    const orderData = {
        userId: AppState.user?.uid,
        items: AppState.cart,
        shippingInfo: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            zipCode: document.getElementById('zipCode').value,
            phone: document.getElementById('phone').value
        },
        subtotal: AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 9.99,
        total: AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 9.99,
        status: 'pending',
        createdAt: new Date()
    };

    showLoading(true);

    try {
        if (window.firebase && window.firebase.firestore) {
            await window.firebase.firestore().collection('orders').add(orderData);
            AppState.cart = [];
            updateCartUI();
            saveCartToStorage();
            hideCheckoutModal();
            showToast('Order placed successfully!', 'success');
        }
    } catch (error) {
        showToast('Failed to place order. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Account Management
function showTab(tabName) {
    // Remove active class from all tabs and panes
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // Add active class to selected tab and pane
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Load specific tab content
    if (tabName === 'orders') {
        loadUserOrders();
    } else if (tabName === 'addresses') {
        loadUserAddresses();
    }
}

async function loadUserData() {
    if (!AppState.user || !window.firebase?.firestore) return;

    try {
        const userDoc = await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            // Populate profile form
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profilePhone = document.getElementById('profilePhone');

            if (profileName) profileName.value = userData.name || '';
            if (profileEmail) profileEmail.value = userData.email || '';
            if (profilePhone) profilePhone.value = userData.phone || '';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadUserOrders() {
    if (!AppState.user || !window.firebase?.firestore) return;

    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    try {
        const orders = await window.firebase.firestore()
            .collection('orders')
            .where('userId', '==', AppState.user.uid)
            .orderBy('createdAt', 'desc')
            .get();

        if (orders.empty) {
            ordersList.innerHTML = '<p>No orders found.</p>';
            return;
        }

        ordersList.innerHTML = orders.docs.map(doc => {
            const order = doc.data();
            return `
                <div class="order-item">
                    <div class="order-header">
                        <h4>Order #${doc.id.substring(0, 8)}</h4>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <div class="order-details">
                        <p>Total: $${order.total.toFixed(2)}</p>
                        <p>Date: ${order.createdAt.toDate().toLocaleDateString()}</p>
                        <p>Items: ${order.items.length}</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        ordersList.innerHTML = '<p>Error loading orders.</p>';
    }
}

function loadUserAddresses() {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;

    // This would typically load from Firestore
    addressesList.innerHTML = `
        <div class="address-item">
            <h4>Home Address</h4>
            <p>123 Main Street<br>City, State 12345</p>
            <div class="address-actions">
                <button class="btn-outline">Edit</button>
                <button class="btn-outline">Delete</button>
            </div>
        </div>
    `;
}

function handleProfileSubmit(e) {
    e.preventDefault();
    // Update user profile
    showToast('Profile updated successfully!', 'success');
}

// Hero Background Carousel
(function heroBgCarousel() {
    const slides = document.querySelectorAll('.hero-bg-slide');
    if (!slides.length) return;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
})();

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-content i');

    if (!toast || !toastMessage || !toastIcon) return;

    // Set message and icon based on type
    toastMessage.textContent = message;

    switch (type) {
        case 'success':
            toastIcon.className = 'fas fa-check-circle';
            toast.className = 'toast toast-success';
            break;
        case 'error':
            toastIcon.className = 'fas fa-exclamation-circle';
            toast.className = 'toast toast-error';
            break;
        case 'info':
            toastIcon.className = 'fas fa-info-circle';
            toast.className = 'toast toast-info';
            break;
    }

    toast.classList.add('show');

    setTimeout(() => {
        hideToast();
    }, 3000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
}

function handleScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// Product View Functions
function viewProduct(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    // This would typically open a product detail modal
    showToast(`Viewing ${product.name}`, 'info');
}

// Additional utility functions
function addNewAddress() {
    showToast('Add new address functionality would be implemented here', 'info');
}

function saveDeliveryOptions() {
    showToast('Delivery options saved!', 'success');
}

// Export functions for global access
window.AppState = AppState;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
// window.toggleCart = toggleCart;
window.toggleMobileMenu = toggleMobileMenu;
window.showAuthModal = showAuthModal;