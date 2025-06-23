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

// Zoom cover
document.addEventListener('DOMContentLoaded', function () {
    const firstHero = document.querySelector('.hero-bg-slide.active');
    if (firstHero) {
        firstHero.classList.add('hero-zoom-blur-init');
        setTimeout(() => {
            firstHero.classList.remove('hero-zoom-blur-init');
        }, 1700); // match animation duration
    }
});

// Fade out effect for nav links and cart button
document.querySelectorAll('.nav-link, .cart-btn').forEach(el => {
    el.addEventListener('click', function (e) {
        // For <a> tags, get href; for button, check class
        const href = this.getAttribute('href');
        if (href || this.classList.contains('cart-btn')) {
            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => {
                if (this.classList.contains('cart-btn')) {
                    window.location.href = 'cart.html';
                } else if (href) {
                    window.location.href = href;
                }
            }, 400);
        }
    });
});

window.addEventListener('DOMContentLoaded', function () {
    document.body.classList.remove('fade-out');
    document.body.classList.add('fade-in');
});
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
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    addToCartBtn.onclick = (e) => {
        e.stopPropagation();

        // If product requires size or color, force modal selection
        if ((product.sizes && product.sizes.length) || (product.colors && product.colors.length)) {
            showToast('Please select a size and color before adding to cart.', 'warning');
            viewProduct(product.id);
            return;
        }

        addToCart(product.id);

        // Click effect animation
        const effect = addToCartBtn.querySelector('.cart-click-effect');
        if (effect) {
            effect.style.animation = 'none';
            void effect.offsetWidth;
            effect.style.animation = 'cartClickEffect 1s';
        }
    };

    // Make the whole card clickable for quick view
    card.onclick = (e) => {
        if (e.target.closest('.add-to-cart-btn')) return;
        viewProduct(product.id);
    };

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
    // Show confirmation modal before deleting
    showConfirmModal({
        message: "Are you sure you want to delete this item?",
        onConfirm: () => {
            AppState.cart.splice(index, 1);
            updateCartUI();
            saveCartToStorage();
            showToast('Product removed from cart', 'info');
        }
    });
}

// --- Confirmation Modal Utility ---
function showConfirmModal({ message, onConfirm }) {
    // Remove existing confirm modal if any
    let modal = document.getElementById('confirmModal');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
        <div class="modal" style="max-width: 350px; text-align: center;">
            <div class="modal-header" style="justify-content: center;">
                <h3 style="margin:0;font-size:1.2rem;">Confirm</h3>
            </div>
            <div class="modal-body" style="padding: 24px 20px; min-height: 0px">
                <p style="font-size:1.08rem; color:#333; margin-bottom: 24px;">${message}</p>
                <div style="display:flex; gap:16px; justify-content:center;">
                    <button class="btn-primary" id="confirmYesBtn" style="min-width:90px;">Yes</button>
                    <button class="btn-secondary" id="confirmNoBtn" style="min-width:90px;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    document.getElementById('confirmYesBtn').onclick = () => {
        hideConfirmModal();
        if (typeof onConfirm === 'function') onConfirm();
    };
    document.getElementById('confirmNoBtn').onclick = hideConfirmModal;

    // ESC or click outside closes modal
    function closeOnEsc(e) {
        if (e.key === "Escape") hideConfirmModal();
    }
    function closeOnClickOutside(e) {
        if (e.target === modal) hideConfirmModal();
    }
    modal.addEventListener('mousedown', closeOnClickOutside);
    window.addEventListener('keydown', closeOnEsc);

    modal._removeListeners = function () {
        modal.removeEventListener('mousedown', closeOnClickOutside);
        window.removeEventListener('keydown', closeOnEsc);
    };
}

function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) modal.parentNode.removeChild(modal);
            document.body.style.overflow = 'auto';
        }, 200);
        if (modal._removeListeners) modal._removeListeners();
    }
}

// Cart Management Continued
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
            if (emptyCart) {
                emptyCart.style.display = 'flex';
                emptyCart.style.justifyContent = 'center';
                emptyCart.style.alignItems = 'center';
                emptyCart.style.gap = '10px';
                emptyCart.style.padding = '20px';
            }
        } else {
            cartItems.style.display = 'flex';
            if (emptyCart) emptyCart.style.display = 'none';

            cartItems.innerHTML = AppState.cart.map((item, index) => {
                // Get product options from AppState.products
                const product = AppState.products.find(p => p.id === item.id);
                const sizeOptions = product?.sizes || [];
                const colorOptions = product?.colors || [];

                return `
                <div class="cart-item-card">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-variation product-sizes">
                            ${sizeOptions.length ? `
                                <label>Size:</label>
                                <select onchange="changeCartVariation(${index}, 'size', this.value)">
                                    ${sizeOptions.map(size => `<option value="${size}" ${item.size === size ? 'selected' : ''}>${size}</option>`).join('')}
                                </select>
                            ` : ''}
                            ${colorOptions.length ? `
                                <label>Color:</label>
                                <select onchange="changeCartVariation(${index}, 'color', this.value)">
                                    ${colorOptions.map(color => `<option value="${color}" ${item.color === color ? 'selected' : ''}>${color}</option>`).join('')}
                                </select>
                            ` : ''}
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-qty">
                            <button onclick="updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
                        </div>
                        <div class="cart-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
                        <button onclick="removeFromCart(${index})" class="cart-item-delete" title="Remove">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <hr class="cart-item-divider">
                `;
            }).join('');
            // Remove last divider
            if (cartItems.lastElementChild && cartItems.lastElementChild.tagName === 'HR') {
                cartItems.removeChild(cartItems.lastElementChild);
            }
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


function toggleMobileMenu() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.toggle('mobile-active');
    }
    // Optional: close menu when clicking outside
    if (navbar && navbar.classList.contains('mobile-active')) {
        document.addEventListener('mousedown', closeMenuOnClickOutside);
    } else {
        document.removeEventListener('mousedown', closeMenuOnClickOutside);
    }
}
function closeMenuOnClickOutside(e) {
    const navbar = document.querySelector('.navbar');
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    if (
        navbar &&
        navMenu &&
        hamburger &&
        !navbar.contains(e.target)
    ) {
        navbar.classList.remove('mobile-active');
        document.removeEventListener('mousedown', closeMenuOnClickOutside);
    }
}

// Scroll Functions
function scrollToLanding() {
    const landingSection = document.getElementById('landing');
    if (landingSection) {
        landingSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}
function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
}
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
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
        loadUserData(); // <-- Ensure this is called
    }
}

function hideAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function logoutUser() {
    if (window.firebase && window.firebase.auth) {
        window.firebase.auth().signOut()
            .then(() => {
                showToast('You have been logged out.', 'success');
                hideAccountModal();
                updateAuthUI(false);
            })
            .catch((error) => {
                showToast('Logout failed: ' + error.message, 'error');
            });
    }
}
window.logoutUser = logoutUser;

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
    const getStartedBtn = document.getElementById('getStartedBtn');
    const userIcon = document.getElementById('userIcon');

    if (authBtn && authText) {
        if (isSignedIn) {
            authText.textContent = AppState.user?.displayName || 'Account';
            authBtn.onclick = showAccountModal;
            if (getStartedBtn) getStartedBtn.style.display = 'none';
            if (userIcon) userIcon.style.display = 'none';
        } else {
            authText.textContent = 'Sign In';
            authBtn.onclick = showAuthModal;
            if (getStartedBtn) getStartedBtn.style.display = '';
            if (userIcon) userIcon.style.display = '';
        }
    }
}

// document.addEventListener('DOMContentLoaded', function () {
//     // Hide auth button until Firebase checks auth state
//     const authBtn = document.querySelector('.auth-btn');
//     if (authBtn) authBtn.classList.add('hidden');

//     // Wait for Firebase Auth to check user state
//     if (window.firebase && window.firebase.auth) {
//         window.firebase.auth().onAuthStateChanged(function (user) {
//             // Update UI based on user
//             updateAuthUI(!!user);
//             // Show the button after auth state is known
//             if (authBtn) authBtn.classList.remove('hidden');
//         });
//     } else {
//         // If Firebase not loaded, show button anyway
//         if (authBtn) authBtn.classList.remove('hidden');
//     }
// });

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
    const shippingAmount = 100.00;
    const total = subtotalAmount + shippingAmount;

    if (summaryItems) {
        summaryItems.innerHTML = AppState.cart.map(item => `
            <div class="summary-item">
                <span>${item.name} x${item.quantity}</span>
                <span>₱${(item.price * item.quantity).toFixed(2)}</span>
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
    if (!AppState.user) return;

    // Get the email from Firebase Auth user
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) {
        profileEmail.value = AppState.user.email || '';
    }

    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.value = AppState.user.displayName || '';
    }

    try {
        const userDoc = await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .get();

        // Always use the current Firebase Auth email
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');

        if (userDoc.exists) {
            const userData = userDoc.data();
            if (profileName) profileName.value = userData.name || AppState.user.displayName || '';
            if (profileEmail) profileEmail.value = AppState.user.email || userData.email || '';
            if (profilePhone) profilePhone.value = userData.phone || '';
        } else {
            // If no Firestore doc, fallback to Auth
            if (profileName) profileName.value = AppState.user.displayName || '';
            if (profileEmail) profileEmail.value = AppState.user.email || '';
            if (profilePhone) profilePhone.value = '';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Handle profile update
async function handleProfileSubmit(e) {
    e.preventDefault();

    const profileName = document.getElementById('profileName').value.trim();
    const profileEmail = document.getElementById('profileEmail').value.trim();
    const profilePhone = document.getElementById('profilePhone').value.trim();

    if (!AppState.user) {
        showToast('You must be signed in to update your profile.', 'error');
        return;
    }

    showLoading(true);

    try {
        // Update Firestore user document
        await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .set({
                name: profileName,
                email: profileEmail,
                phone: profilePhone
            }, { merge: true });

        // Update Firebase Auth email if changed
        if (AppState.user.email !== profileEmail) {
            await AppState.user.updateEmail(profileEmail);
        }
        // Update Firebase Auth displayName if changed
        if (AppState.user.displayName !== profileName) {
            await AppState.user.updateProfile({ displayName: profileName });
        }

        showToast('Profile updated successfully!', 'success');
        // Reload user data to reflect changes
        await window.firebase.auth().currentUser.reload();
        AppState.user = window.firebase.auth().currentUser;
        loadUserData();
    } catch (error) {
        showToast('Failed to update profile: ' + error.message, 'error');
    } finally {
        showLoading(false);
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
    <div class="address-card">
        <div class="address-info">
            <div class="address-label">Home Address</div>
            <div class="address-details">
                123 Main Street<br>
                City, State 12345
            </div>
        </div>
        <div class="address-actions">
            <button class="btn-outline edit-address-btn"><i class="fas fa-edit"></i> Edit</button>
            <button class="btn-outline delete-address-btn"><i class="fas fa-trash"></i> Delete</button>
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

// Toast Notifications
let toastCounter = 0;
const toastDuration = 7000;

function showToast(message, type = 'success') {
    // Create unique toast element
    const toastId = `toast-${++toastCounter}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type} show`;

    // Get icon class based on type
    let iconClass;
    switch (type) {
        case 'success':
            iconClass = 'fas fa-check-circle';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            iconClass = 'fas fa-exclamation-triangle';
            break;
        case 'info':
            iconClass = 'fas fa-info-circle';
            break;
        default:
            iconClass = 'fas fa-check-circle';
    }

    // Create toast HTML
    toast.innerHTML = `
        <div class="toast-content">
            <i class="${iconClass}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="hideToast('${toastId}')" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="toast-timer-bar">
            <div class="toast-timer-bar-inner" id="${toastId}-timer"></div>
        </div>
    `;

    // Position toasts (stack them)
    const existingToasts = document.querySelectorAll('.toast.show');
    let bottomOffset = 30;
    existingToasts.forEach(existingToast => {
        bottomOffset += existingToast.offsetHeight + 15;
    });
    toast.style.bottom = `${bottomOffset}px`;

    // Add to page
    document.body.appendChild(toast);

    // Get timer bar
    const timerBar = document.getElementById(`${toastId}-timer`);

    // Animate timer bar
    setTimeout(() => {
        timerBar.style.transition = `width ${toastDuration}ms linear`;
        timerBar.style.width = '0%';
    }, 10);

    // Auto-hide timer
    const autoHideTimeout = setTimeout(() => {
        hideToast(toastId);
    }, toastDuration);

    // Pause/resume on hover
    let pauseStart, pauseDuration = 0;

    toast.onmouseenter = () => {
        pauseStart = Date.now();
        timerBar.style.animationPlayState = 'paused';
        clearTimeout(autoHideTimeout);
    };

    toast.onmouseleave = () => {
        if (pauseStart) {
            pauseDuration += Date.now() - pauseStart;
            const remaining = toastDuration - pauseDuration;
            if (remaining > 0) {
                setTimeout(() => hideToast(toastId), remaining);
            }
        }
    };

    // Store timeout for cleanup
    toast.toastTimeout = autoHideTimeout;
}

function hideToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        // Clear timeout
        if (toast.toastTimeout) {
            clearTimeout(toast.toastTimeout);
        }

        // Remove toast
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            // Reposition remaining toasts
            repositionToasts();
        }, 300);
    }
}

function repositionToasts() {
    const toasts = document.querySelectorAll('.toast.show');
    let bottomOffset = 30;
    toasts.forEach(toast => {
        toast.style.bottom = `${bottomOffset}px`;
        bottomOffset += toast.offsetHeight + 15;
    });
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
// function viewProduct(productId) {
//     const product = AppState.products.find(p => p.id === productId);
//     if (!product) return;

//     // Create or select the modal
//     let modal = document.getElementById('productPreviewModal');
//     if (!modal) {
//         modal = document.createElement('div');
//         modal.id = 'productPreviewModal';
//         modal.className = 'modal-overlay show';
//         modal.innerHTML = `
//             <div class="modal modal-large" style="position:relative;">
//                 <button class="close-modal" style="position:absolute;top:18px;right:18px;z-index:2;" onclick="hideProductPreview()">
//                     <i class="fas fa-times"></i>
//                 </button>
//                 <div class="modal-body" id="previewBody"></div>
//             </div>
//         `;
//         document.body.appendChild(modal);
//     } else {
//         modal.style.display = 'flex';
//         modal.classList.add('show');
//     }
//     document.body.style.overflow = 'hidden';

//     // Fill modal content
//     document.getElementById('previewBody').innerHTML = `
//         <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start;">
//             <img src="${product.image}" alt="${product.name}" style="width:320px;max-width:100%;border-radius:12px;box-shadow:0 2px 12px rgba(102,126,234,0.08);background:#f8f9fa;">
//             <div style="flex:1;min-width:220px;">
//                 <h2 id="previewTitle" style="font-size:2rem;font-weight:700;margin-bottom:10px;">${product.name}</h2>
//                 <div style="margin-bottom:10px;">
//                     <span class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
//                 </div>
//                 <div style="margin-bottom:10px;">
//                     <span class="product-rating">${generateStars(product.rating)} <span class="rating-text">(${product.rating})</span></span>
//                 </div>
//                 <div style="margin-bottom:18px;">
//                     <span class="product-price" style="font-size:1.3rem;font-weight:700;color:#764ba2;">₱${product.price.toFixed(2)}</span>
//                 </div>
//                 <div style="margin-bottom:18px;">
//                     <div style="margin-bottom:6px;font-weight:500;">Description:</div>
//                     <div style="color:#444;">${product.description}</div>
//                 </div>
//                 ${product.sizes ? `
//                 <div style="margin-bottom:12px;">
//                     <div style="margin-bottom:4px;font-weight:500;">Available Sizes:</div>
//                     <div class="product-sizes">
//                         ${product.sizes.map(size => `<span class="size-tag">${size}</span>`).join('')}
//                     </div>
//                 </div>
//                 ` : ''}
//                 ${product.colors ? `
//                 <div style="margin-bottom:12px;">
//                     <div style="margin-bottom:4px;font-weight:500;">Available Colors:</div>
//                     <div class="product-sizes">
//                         ${product.colors.map(color => `<span class="size-tag">${color}</span>`).join('')}
//                     </div>
//                 </div>
//                 ` : ''}
//                 <button class="btn-primary" style="margin-top:18px;" onclick="addToCart('${product.id}')">
//                     <i class="fas fa-shopping-cart"></i> Add to Cart
//                 </button>
//             </div>
//         </div>
//     `;

//     // Close modal on ESC or click outside
//     function closeOnEsc(e) {
//         if (e.key === "Escape") hideProductPreview();
//     }
//     function closeOnClickOutside(e) {
//         if (e.target === modal) hideProductPreview();
//     }
//     modal.addEventListener('mousedown', closeOnClickOutside);
//     window.addEventListener('keydown', closeOnEsc);

//     // Remove listeners when modal closes
//     modal._removeListeners = function() {
//         modal.removeEventListener('mousedown', closeOnClickOutside);
//         window.removeEventListener('keydown', closeOnEsc);
//     };
// }
function viewProduct(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    let modal = document.getElementById('productPreviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productPreviewModal';
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal modal-large" style="position:relative;">
                <button class="close-modal" style="position:absolute;top:18px;right:18px;z-index:2;" onclick="hideProductPreview()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body" id="previewBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.style.display = 'flex';
        modal.classList.add('show');
    }
    document.body.style.overflow = 'hidden';

    // Fill modal content with selectable size and color tags
    document.getElementById('previewBody').innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start;">
            <img src="${product.image}" alt="${product.name}" style="width:320px;max-width:100%;border-radius:12px;box-shadow:0 2px 12px rgba(102,126,234,0.08);background:#f8f9fa;">
            <div style="flex:1;min-width:220px;">
                <h2 id="previewTitle" style="font-size:2rem;font-weight:700;margin-bottom:10px;">${product.name}</h2>
                <div style="margin-bottom:10px;">
                    <span class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                </div>
                <div style="margin-bottom:10px;">
                    <span class="product-rating">${generateStars(product.rating)} <span class="rating-text">(${product.rating})</span></span>
                </div>
                <div style="margin-bottom:18px;">
                    <span class="product-price" style="font-size:1.3rem;font-weight:700;color:#764ba2;">₱${product.price.toFixed(2)}</span>
                </div>
                <div style="margin-bottom:18px;">
                    <div style="margin-bottom:6px;font-weight:500;">Description:</div>
                    <div style="color:#444;">${product.description}</div>
                </div>
                ${product.sizes ? `
                <div style="margin-bottom:12px;">
                    <div style="margin-bottom:4px;font-weight:500;">Available Sizes:</div>
                    <div class="product-sizes" id="modalSizes">
                        ${product.sizes.map(size => `<span class="size-tag" data-size="${size}">${size}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                ${product.colors ? `
                <div style="margin-bottom:12px;">
                    <div style="margin-bottom:4px;font-weight:500;">Available Colors:</div>
                    <div class="product-sizes" id="modalColors">
                        ${product.colors.map(color => `<span class="size-tag" data-color="${color}">${color}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                <button class="btn-primary" id="modalAddToCartBtn" style="margin-top:18px;">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    // Selection logic
    let selectedSize = null;
    let selectedColor = null;

    // Highlight selected size
    const sizesDiv = document.getElementById('modalSizes');
    if (sizesDiv) {
        sizesDiv.querySelectorAll('.size-tag').forEach(tag => {
            tag.onclick = function () {
                sizesDiv.querySelectorAll('.size-tag').forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = this.getAttribute('data-size');
            };
        });
    }

    // Highlight selected color
    const colorsDiv = document.getElementById('modalColors');
    if (colorsDiv) {
        colorsDiv.querySelectorAll('.size-tag').forEach(tag => {
            tag.onclick = function () {
                colorsDiv.querySelectorAll('.size-tag').forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
                selectedColor = this.getAttribute('data-color');
            };
        });
    }

    // Add to Cart button logic
    document.getElementById('modalAddToCartBtn').onclick = function () {
        // Require selection
        if (product.sizes && !selectedSize) {
            showToast('Please select a size.', 'warning');
            return;
        }
        if (product.colors && !selectedColor) {
            showToast('Please select a color.', 'warning');
            return;
        }
        addToCart(product.id, selectedSize, selectedColor);
        hideProductPreview();
    };

    // Close modal on ESC or click outside
    function closeOnEsc(e) {
        if (e.key === "Escape") hideProductPreview();
    }
    function closeOnClickOutside(e) {
        if (e.target === modal) hideProductPreview();
    }
    modal.addEventListener('mousedown', closeOnClickOutside);
    window.addEventListener('keydown', closeOnEsc);

    modal._removeListeners = function () {
        modal.removeEventListener('mousedown', closeOnClickOutside);
        window.removeEventListener('keydown', closeOnEsc);
    };
}

function hideProductPreview() {
    const modal = document.getElementById('productPreviewModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        if (modal._removeListeners) modal._removeListeners();
    }
}

// Refresh logic for landing page
if (!window.location.pathname.endsWith('cart.html')) {
    window.addEventListener('DOMContentLoaded', function () {
        // Detect if this is a reload (refresh)
        let isReload = false;
        if (performance.getEntriesByType) {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav && nav.type === 'reload') isReload = true;
        } else if (performance.navigation) {
            // Fallback for older browsers
            isReload = performance.navigation.type === 1;
        }

        setTimeout(function () {
            if (isReload) {
                // On reload, always scroll to landing and remove hash
                history.replaceState(null, '', window.location.pathname);
                const landing = document.getElementById('landing');
                if (landing) landing.scrollIntoView({ behavior: 'auto' });
            } else if (window.location.hash) {
                // On normal navigation, scroll to the hash section
                const section = document.getElementById(window.location.hash.substring(1));
                if (section) section.scrollIntoView({ behavior: 'auto' });
            } else {
                // No hash, scroll to landing
                const landing = document.getElementById('landing');
                if (landing) landing.scrollIntoView({ behavior: 'auto' });
            }
        }, 0);

        // Prevent browser from restoring scroll position
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    });
}

// Export functions for global access
window.AppState = AppState;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
// window.toggleCart = toggleCart;
window.toggleMobileMenu = toggleMobileMenu;
window.showAuthModal = showAuthModal;
window.viewProduct = viewProduct;
window.hideProductPreview = hideProductPreview;