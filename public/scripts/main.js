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

document.addEventListener('DOMContentLoaded', function () {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.onclick = function (e) {
            e.preventDefault();
            if (!AppState.user) {
                // showToast('Please sign in to view your cart.', 'warning');
                showAuthModal();
            } else {
                window.location.href = 'cart.html';
            }
        };
    }
});

// Update Auth UI based on user state
async function saveCartToFirestore() {
    if (!AppState.user) return;
    try {
        await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .collection('cart')
            .doc('cart')
            .set({ items: AppState.cart });
    } catch (e) {
        console.warn('Failed to save cart to Firestore:', e);
    }
}

async function loadCartFromFirestore() {
    if (!AppState.user) return;
    try {
        const doc = await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .collection('cart')
            .doc('cart')
            .get();
        if (doc.exists && doc.data().items) {
            AppState.cart = doc.data().items;
        } else {
            AppState.cart = [];
        }
    } catch (e) {
        AppState.cart = [];
    }
}

// Fade out effect for nav links and cart button
document.querySelectorAll('.nav-link, .cart-btn').forEach(el => {
    el.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href || this.classList.contains('cart-btn')) {
            e.preventDefault();
            if (this.classList.contains('cart-btn') && !AppState.user) {
                showToast('Please sign in to view your cart.', 'warning');
                showAuthModal();
                return; // Prevent redirect
            }
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
        window.firebase.auth().onAuthStateChanged(async function (user) {
            if (user) {
                AppState.user = user;
                updateAuthUI(true);
                loadUserData();
                // Load cart from Firestore on user sign-in, then update UI
                await loadCartFromFirestore();
                updateCartUI();
            } else {
                AppState.user = null;
                AppState.cart = [];
                updateCartUI();
                // Optionally clear localStorage cart as well
                localStorage.removeItem('studioV_cart');
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
    // Require sign-in before adding to cart
    if (!AppState.user) {
        showToast('Please sign in to add items to your cart.', 'warning');
        showAuthModal();
        return;
    }

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
    showCartCheck(product.name);
    saveCartToFirestore();
}

// Add to Cart Check Animation
function showCartCheck(productName) {
    const overlay = document.getElementById('cartCheckOverlay');
    const caption = document.getElementById('cartCheckCaption');
    if (!overlay || !caption) return;

    caption.textContent = `${productName} is added to your cart`;
    overlay.classList.add('show');

    // Restart SVG animation
    const checkmark = overlay.querySelector('.cart-checkmark');
    const circle = overlay.querySelector('.cart-checkmark-circle');
    const check = overlay.querySelector('.cart-checkmark-check');
    if (circle && check) {
        circle.style.strokeDashoffset = 166;
        check.style.strokeDashoffset = 48;
        // Force reflow for restart
        void circle.offsetWidth;
        void check.offsetWidth;
        circle.style.animation = 'cartCheckCircle 0.4s ease-in-out forwards';
        check.style.animation = 'cartCheckCheck 0.3s 0.35s cubic-bezier(.65,.05,.36,1) forwards';
    }

    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2400);
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
    saveCartToFirestore();
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
    saveCartToFirestore();
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
    if (cartCount) {
        if (!AppState.user) {
            cartCount.style.display = 'none';
        } else {
            cartCount.style.display = '';
            cartCount.textContent = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    }
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

async function populateCheckoutUserInfo() {
    if (!AppState.user || !window.firebase?.firestore) return;

    // Get profile info
    const userDoc = await window.firebase.firestore().collection('users').doc(AppState.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    document.getElementById('checkoutFullName').textContent = userData.name || AppState.user.displayName || '';
    document.getElementById('checkoutEmail').textContent = AppState.user.email || userData.email || '';

    // Delivery preferences
    const delivery = userData.deliveryOptions || {};
    document.getElementById('checkoutPreferredTime').textContent =
        delivery.time ? delivery.time.charAt(0).toUpperCase() + delivery.time.slice(1) : '';
    document.getElementById('checkoutInstructions').textContent = delivery.instructions || '';

    // Load addresses
    const addressSelect = document.getElementById('checkoutAddress');
    addressSelect.innerHTML = '<option>Loading...</option>';
    const addressesSnap = await window.firebase.firestore()
        .collection('users').doc(AppState.user.uid)
        .collection('addresses').orderBy('createdAt', 'desc').get();

    if (addressesSnap.empty) {
        addressSelect.innerHTML = '<option value="">No address found. Please add one in Account Settings.</option>';
    } else {
        addressSelect.innerHTML = '';
        addressesSnap.docs.forEach(doc => {
            const addr = doc.data();
            const label = `${addr.label || ''} ${addr.region || ''}, ${addr.city || ''}, ${addr.barangay || ''}`;
            addressSelect.innerHTML += `<option value="${doc.id}" data-lat="${addr.lat || ''}" data-lng="${addr.lng || ''}">${label}</option>`;
        });
    }

    // Show map for selected address
    addressSelect.onchange = () => showAddressMap(addressesSnap, addressSelect.value);
    if (addressesSnap.docs.length > 0) {
        showAddressMap(addressesSnap, addressSelect.value || addressesSnap.docs[0].id);
    }
}
// Show map using Leaflet for the selected address
async function showAddressMap(addressesSnap, selectedId) {
    const addrDoc = addressesSnap.docs.find(doc => doc.id === selectedId);
    if (!addrDoc) return;
    const addr = addrDoc.data();

    // Build location string using only province, city, barangay
    const locationParts = [
        addr.barangay || '',
        addr.city || '',
        addr.province || '',
        addr.region || '',
        'Philippines'
    ].filter(Boolean);
    const locationQuery = locationParts.join(', ');

    let lat = addr.lat, lng = addr.lng;
    if (!lat || !lng) {
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}`);
            const data = await resp.json();
            if (data && data[0]) {
                lat = parseFloat(data[0].lat);
                lng = parseFloat(data[0].lon);
                // Optionally save to Firestore for future
                window.firebase.firestore().collection('users').doc(AppState.user.uid)
                    .collection('addresses').doc(addrDoc.id).set({ lat, lng }, { merge: true });
            }
        } catch (e) { /* ignore */ }
    }

    // Choose zoom level: 15 for barangay, 13 for city, 10 for province
    let zoom = 13;
    if (addr.barangay) zoom = 15;
    else if (addr.city) zoom = 13;
    else if (addr.province) zoom = 10;

    // Initialize or update Leaflet map
    if (!window.checkoutMap) {
        window.checkoutMap = L.map('addressMap').setView([lat || 13, lng || 122], zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.checkoutMap);
        window.checkoutMapMarker = L.marker([lat, lng]).addTo(window.checkoutMap);
    } else {
        window.checkoutMap.setView([lat || 13, lng || 122], zoom);
        if (window.checkoutMapMarker) window.checkoutMap.removeLayer(window.checkoutMapMarker);
        window.checkoutMapMarker = L.marker([lat, lng]).addTo(window.checkoutMap);
    }
}

// When showing checkout modal, populate info
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
        populateCheckoutUserInfo();
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
                // If on cart.html, redirect to index.html after logout
                if (window.location.pathname.endsWith('cart.html')) {
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 800); // Give time for toast/modal to show
                }
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
    showLoading(true);
    try {
        const result = await authService.signUp(email, password, fullName);
        if (result.success) {
            showToast('Account created successfully!', 'success');
            if (result.warning) {
                showToast(result.warning, 'warning');
            }
            // Reload user to get updated displayName
            await window.firebase.auth().currentUser.reload();
            AppState.user = window.firebase.auth().currentUser;
            updateAuthUI(true); // Update UI with new displayName
            hideAuthModal();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function signInUser(email, password) {
    showLoading(true);
    try {
        const result = await authService.signIn(email, password);
        if (result.success) {
            showToast('Signed in successfully!', 'success');
            hideAuthModal();
        } else {
            showToast(result.error, 'error');
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
            // Scroll to top/landing when logged out
            const landing = document.getElementById('landing');
            if (landing) {
                landing.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
    const addressSelect = document.getElementById('checkoutAddress');
    const selectedAddressId = addressSelect.value;
    let shippingInfo = {};
    if (selectedAddressId) {
        const addrDoc = await window.firebase.firestore()
            .collection('users').doc(AppState.user.uid)
            .collection('addresses').doc(selectedAddressId).get();
        if (addrDoc.exists) {
            const addr = addrDoc.data();
            // Map to required fields for Firestore rules
            shippingInfo = {
                firstName: AppState.user.displayName?.split(' ')[0] || 'N/A',
                lastName: AppState.user.displayName?.split(' ').slice(1).join(' ') || 'N/A',
                address: `${addr.houseNumber || ''} ${addr.street || ''}`.trim(),
                city: addr.city || '',
                zipCode: addr.zip || '',
                // Optionally include all address fields for reference
                ...addr
            };
        }
    }

    const orderData = {
        userId: AppState.user.uid,
        items: AppState.cart,
        shippingInfo,
        subtotal: AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 9.99,
        total: AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 9.99,
        status: 'pending',
        createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
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

// Load user profile, addresses, and delivery options on modal open or refresh
async function loadUserData() {
    if (!AppState.user) return;

    // Load profile info
    const profileEmail = document.getElementById('profileEmail');
    const profileName = document.getElementById('profileName');
    const profilePhone = document.getElementById('profilePhone');
    if (profileEmail) profileEmail.value = AppState.user.email || '';
    if (profileName) profileName.value = AppState.user.displayName || '';
    if (profilePhone) profilePhone.value = '';

    try {
        const userDoc = await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            if (profileName) profileName.value = userData.name || AppState.user.displayName || '';
            if (profileEmail) profileEmail.value = AppState.user.email || userData.email || '';
            if (profilePhone) {
                // Remove +63 if present, show only the rest
                let phone = userData.phone || '';
                if (phone.startsWith('+63')) phone = phone.slice(3);
                profilePhone.value = phone;
            }
            // Load delivery options
            loadDeliveryOptions(userData.deliveryOptions || {});
        } else {
            if (profilePhone) profilePhone.value = '';
            if (profileName) profileName.value = AppState.user.displayName || '';
            if (profileEmail) profileEmail.value = AppState.user.email || '';
            loadDeliveryOptions({});
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }

    // Load addresses
    await loadUserAddresses();
}

// Save profile info (name, phone, delivery options)
async function handleProfileSubmit(e) {
    e.preventDefault();

    const profileName = document.getElementById('profileName').value.trim();
    let profilePhone = document.getElementById('profilePhone').value.trim();

    // Validate phone: must be 10 digits
    profilePhone = profilePhone.replace(/\D/g, '');

    if (!/^[0-9]{10}$/.test(profilePhone)) {
        showToast('Please enter a valid 10-digit phone number.', 'error');
        return;
    }

    if (!AppState.user) {
        showToast('You must be signed in to update your profile.', 'error');
        return;
    }

    showLoading(true);

    try {
        // Save delivery options
        const deliveryOptions = getDeliveryOptionsFromForm();

        // Update Firestore user document
        await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .set({
                name: profileName,
                phone: profilePhone,
                deliveryOptions
            }, { merge: true });

        // Update Firebase Auth displayName if changed
        if (AppState.user.displayName !== profileName) {
            await AppState.user.updateProfile({ displayName: profileName });
        }

        showToast('Profile updated successfully!', 'success');
        await window.firebase.auth().currentUser.reload();
        AppState.user = window.firebase.auth().currentUser;
        loadUserData();
    } catch (error) {
        showToast('Failed to update profile: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// --- DELIVERY OPTIONS ---
function getDeliveryOptionsFromForm() {
    const time = document.querySelector('input[name="deliveryTime"]:checked')?.value || '';
    const instructions = document.getElementById('deliveryInstructions')?.value || '';
    return { time, instructions };
}

function loadDeliveryOptions(options) {
    if (options.time) {
        const radio = document.querySelector(`input[name="deliveryTime"][value="${options.time}"]`);
        if (radio) radio.checked = true;
    }
    if (options.instructions !== undefined) {
        const textarea = document.getElementById('deliveryInstructions');
        if (textarea) textarea.value = options.instructions;
    }
}

async function saveDeliveryOptions() {
    if (!AppState.user) return;
    showLoading(true);
    try {
        const deliveryOptions = getDeliveryOptionsFromForm();
        await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .set({ deliveryOptions }, { merge: true });
        showToast('Delivery preferences saved!', 'success');
    } catch (error) {
        showToast('Failed to save delivery options: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// --- ADDRESSES MANAGEMENT ---

// Render addresses list and allow add/edit/delete
async function loadUserAddresses() {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList || !AppState.user) return;

    addressesList.innerHTML = '<p>Loading addresses...</p>';
    try {
        const snapshot = await window.firebase.firestore()
            .collection('users')
            .doc(AppState.user.uid)
            .collection('addresses')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            addressesList.innerHTML = '<p>No addresses found. Add your first address!</p>';
            return;
        }

        addressesList.innerHTML = snapshot.docs.map(doc => {
            const addr = doc.data();
            return `
                <div class="address-card" data-id="${doc.id}">
                    <div class="address-info">
                        <div class="address-label">${addr.label || 'Home/Work'}</div>
                        <div class="address-details">
                            ${addr.region || ''}, ${addr.city || ''}, ${addr.barangay || ''}<br>
                            ${addr.street || ''} ${addr.houseNumber || ''}<br>
                            ZIP: ${addr.zip || ''}
                        </div>
                    </div>
                    <div class="address-actions">
                        <button class="btn-outline edit-address-btn" onclick="editAddress('${doc.id}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-outline delete-address-btn" onclick="deleteAddress('${doc.id}')"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        addressesList.innerHTML = '<p>Error loading addresses.</p>';
    }
}

// --- Inline Address Form with Dynamic Dropdowns ---

// Helper: Fetch PSGC API
async function fetchPSGC(endpoint) {
    const url = `https://psgc.gitlab.io/api/${endpoint}`;
    const res = await fetch(url);
    return res.json();
}

// Show inline address form (add or edit)
window.showInlineAddressForm = async function (addressId = null, data = {}) {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;

    // Hide address list and add button
    addressesList.style.display = 'none';
    const addBtn = document.querySelector('#addresses .btn-outline');
    if (addBtn) addBtn.style.display = 'none';

    // Remove any existing form
    let formDiv = document.getElementById('inlineAddressForm');
    if (formDiv) formDiv.remove();

    // Insert form after addressesList
    formDiv = document.createElement('div');
    formDiv.id = 'inlineAddressForm';
    formDiv.style.margin = '30px 0';

    // Initial values
    const selectedRegion = data.regionCode || '';
    const selectedProvince = data.provinceCode || '';
    const selectedCity = data.cityCode || '';
    const selectedBarangay = data.barangayCode || '';

    formDiv.innerHTML = `
        <form id="addressForm" style="padding: 0px 32px 28px 0px;">
            <div class="form-row">
                <div class="form-group" style="flex:1;">
                    <label for="regionSelect">Region</label>
                    <select id="regionSelect" required></select>
                </div>
                <div class="form-group" style="flex:1;">
                    <label for="provinceSelect">Province</label>
                    <select id="provinceSelect" required></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1;">
                    <label for="citySelect">City/Municipality</label>
                    <select id="citySelect" required></select>
                </div>
                <div class="form-group" style="flex:1;">
                    <label for="barangaySelect">Barangay</label>
                    <select id="barangaySelect" required></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group" style="flex:1;">
                    <label for="street">Street</label>
                    <input type="text" id="street" value="${data.street || ''}" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label for="houseNumber">House Number</label>
                    <input type="text" id="houseNumber" value="${data.houseNumber || ''}" required>
                </div>
                <div class="form-group" style="flex:1;">
                    <label for="zip">ZIP</label>
                    <input type="text" id="zip" value="${data.zip || ''}" required>
                </div>
            </div>
            <div style="margin-top:18px;display:flex;gap:12px;">
                <button type="submit" class="btn-primary">${addressId ? 'Update' : 'Add'} Address</button>
                <button type="button" class="btn-secondary" id="cancelAddressBtn">Cancel</button>
            </div>
        </form>
    `;
    addressesList.parentNode.insertBefore(formDiv, addressesList.nextSibling);

    // PSGC Dropdown logic
    const regionSelect = formDiv.querySelector('#regionSelect');
    const provinceSelect = formDiv.querySelector('#provinceSelect');
    const citySelect = formDiv.querySelector('#citySelect');
    const barangaySelect = formDiv.querySelector('#barangaySelect');

    // Load regions
    const regions = await fetchPSGC('regions/');
    regionSelect.innerHTML = `<option value="">Select Region</option>` +
        regions.map(r => `<option value="${r.code}" ${r.code === selectedRegion ? 'selected' : ''}>${r.name}</option>`).join('');

    // Load provinces when region changes
    regionSelect.onchange = async function () {
        provinceSelect.innerHTML = `<option value="">Loading...</option>`;
        const provinces = await fetchPSGC(`regions/${regionSelect.value}/provinces/`);
        provinceSelect.innerHTML = `<option value="">Select Province</option>` +
            provinces.map(p => `<option value="${p.code}" ${p.code === selectedProvince ? 'selected' : ''}>${p.name}</option>`).join('');
        provinceSelect.dispatchEvent(new Event('change'));
    };

    // Load cities/municipalities when province changes
    provinceSelect.onchange = async function () {
        citySelect.innerHTML = `<option value="">Loading...</option>`;
        const cities = await fetchPSGC(`provinces/${provinceSelect.value}/cities-municipalities/`);
        citySelect.innerHTML = `<option value="">Select City/Municipality</option>` +
            cities.map(c => `<option value="${c.code}" ${c.code === selectedCity ? 'selected' : ''}>${c.name}</option>`).join('');
        citySelect.dispatchEvent(new Event('change'));
    };

    // Load barangays when city changes
    citySelect.onchange = async function () {
        barangaySelect.innerHTML = `<option value="">Loading...</option>`;
        const barangays = await fetchPSGC(`cities-municipalities/${citySelect.value}/barangays/`);
        barangaySelect.innerHTML = `<option value="">Select Barangay</option>` +
            barangays.map(b => `<option value="${b.code}" ${b.code === selectedBarangay ? 'selected' : ''}>${b.name}</option>`).join('');
    };

    // Pre-select if editing
    if (selectedRegion) {
        regionSelect.value = selectedRegion;
        await regionSelect.onchange();
        if (selectedProvince) {
            provinceSelect.value = selectedProvince;
            await provinceSelect.onchange();
            if (selectedCity) {
                citySelect.value = selectedCity;
                await citySelect.onchange();
                if (selectedBarangay) {
                    barangaySelect.value = selectedBarangay;
                }
            }
        }
    }

    // Submit handler
    formDiv.querySelector('#addressForm').onsubmit = async function (e) {
        e.preventDefault();
        if (!AppState.user) return;

        // Get selected text for display
        const regionText = regionSelect.options[regionSelect.selectedIndex]?.text || '';
        const provinceText = provinceSelect.options[provinceSelect.selectedIndex]?.text || '';
        const cityText = citySelect.options[citySelect.selectedIndex]?.text || '';
        const barangayText = barangaySelect.options[barangaySelect.selectedIndex]?.text || '';

        const addressData = {
            region: regionText,
            regionCode: regionSelect.value,
            province: provinceText,
            provinceCode: provinceSelect.value,
            city: cityText,
            cityCode: citySelect.value,
            barangay: barangayText,
            barangayCode: barangaySelect.value,
            street: formDiv.querySelector('#street').value,
            houseNumber: formDiv.querySelector('#houseNumber').value,
            zip: formDiv.querySelector('#zip').value,
            updatedAt: new Date()
        };

        showLoading(true);
        try {
            const ref = window.firebase.firestore()
                .collection('users')
                .doc(AppState.user.uid)
                .collection('addresses');
            if (addressId) {
                await ref.doc(addressId).set(addressData, { merge: true });
                showToast('Address updated!', 'success');
            } else {
                addressData.createdAt = new Date();
                await ref.add(addressData);
                showToast('Address added!', 'success');
            }
            hideInlineAddressForm();
            loadUserAddresses();
        } catch (error) {
            showToast('Failed to save address: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    };

    // Cancel button
    formDiv.querySelector('#cancelAddressBtn').onclick = hideInlineAddressForm;
};

// Hide inline form and restore address list
window.hideInlineAddressForm = function () {
    const addressesList = document.getElementById('addressesList');
    if (addressesList) addressesList.style.display = '';
    const addBtn = document.querySelector('#addresses .btn-outline');
    if (addBtn) addBtn.style.display = '';
    const formDiv = document.getElementById('inlineAddressForm');
    if (formDiv) formDiv.remove();
};

// Override add/edit address buttons to use inline form
window.addNewAddress = function () {
    window.showInlineAddressForm();
};
window.editAddress = async function (addressId) {
    if (!AppState.user) return;
    const doc = await window.firebase.firestore()
        .collection('users')
        .doc(AppState.user.uid)
        .collection('addresses')
        .doc(addressId)
        .get();
    if (doc.exists) {
        window.showInlineAddressForm(doc.id, doc.data());
    }
};

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

// Product Preview Modal
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
                    <div id="sizeWarning" style="color:#e74c3c;font-size:0.78rem;display:none;margin-top:4px;"></div>
                </div>
                ` : ''}
                ${product.colors ? `
                <div style="margin-bottom:12px;">
                    <div style="margin-bottom:4px;font-weight:500;">Available Colors:</div>
                    <div class="product-sizes" id="modalColors">
                        ${product.colors.map(color => `<span class="size-tag" data-color="${color}">${color}</span>`).join('')}
                    </div>
                    <div id="colorWarning" style="color:#e74c3c;font-size:0.78rem;display:none;margin-top:4px;"></div>
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
    const sizeWarning = document.getElementById('sizeWarning');
    if (sizesDiv) {
        sizesDiv.querySelectorAll('.size-tag').forEach(tag => {
            tag.onclick = function () {
                sizesDiv.querySelectorAll('.size-tag').forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = this.getAttribute('data-size');
                if (sizeWarning) sizeWarning.style.display = 'none';
            };
        });
    }

    // Highlight selected color
    const colorsDiv = document.getElementById('modalColors');
    const colorWarning = document.getElementById('colorWarning');
    if (colorsDiv) {
        colorsDiv.querySelectorAll('.size-tag').forEach(tag => {
            tag.onclick = function () {
                colorsDiv.querySelectorAll('.size-tag').forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
                selectedColor = this.getAttribute('data-color');
                if (colorWarning) colorWarning.style.display = 'none';
            };
        });
    }

    // Add to Cart button logic
    document.getElementById('modalAddToCartBtn').onclick = function () {
        let hasError = false;
        if (product.sizes && !selectedSize) {
            if (sizeWarning) {
                sizeWarning.textContent = 'Please select a size.';
                sizeWarning.style.display = 'block';
            }
            hasError = true;
        }
        if (product.colors && !selectedColor) {
            if (colorWarning) {
                colorWarning.textContent = 'Please select a color.';
                colorWarning.style.display = 'block';
            }
            hasError = true;
        }
        if (hasError) return;

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