document.addEventListener('DOMContentLoaded', () => {

        // Test connection with backend
        fetch('http://localhost:3001/api/hello')
        .then(response => response.json())
        .then(data => {
            console.log('Message from backend:', data.message);
        })
        .catch(err => console.error('Backend error:', err));

    // Mobile menu toggle with null checks
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Scroll animations with proper cleanup
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('animate', entry.isIntersecting);
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .delivery-card').forEach(element => {
        observer.observe(element);
    });

    // Enhanced smooth scroll with edge cases handled
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu after navigation
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Auto Slideshow with safety checks
    const slides = document.querySelectorAll('.slide');
    if (slides.length > 0) {
        let slideIndex = 0;
        const showSlides = () => {
            slides.forEach(slide => slide.style.opacity = 0);
            slides[slideIndex].style.opacity = 1;
            slideIndex = (slideIndex + 1) % slides.length;
            setTimeout(showSlides, 5000);
        };
        showSlides();
    }

    // Carousel with proper initialization checks
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        let currentIndex = 1;
        const items = document.querySelectorAll('.carousel-item');
        const totalItems = items.length;

        const updateCarousel = () => {
            items.forEach((item, index) => {
                item.classList.remove('active', 'previous', 'next');
                const position = 
                    index === currentIndex ? 'active' :
                    index === (currentIndex - 1 + totalItems) % totalItems ? 'previous' :
                    index === (currentIndex + 1) % totalItems ? 'next' : '';
                if (position) item.classList.add(position);
            });
        };

        const rotateCarousel = () => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        };

        let carouselInterval = setInterval(rotateCarousel, 4000);
        carouselWrapper.addEventListener('mouseenter', () => clearInterval(carouselInterval));
        carouselWrapper.addEventListener('mouseleave', () => {
            carouselInterval = setInterval(rotateCarousel, 4000);
        });
        updateCarousel();
    }

    // Cart functionality scoped to index page only
    if (!window.location.pathname.includes('login_signup.html')) {
        let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.querySelector('.cart-count');
        let itemToRemove = null;

        // Create cart elements
        const cartModal = document.createElement('div');
        cartModal.className = 'cart-modal';
        document.body.appendChild(cartModal);

        const removeConfirmation = document.createElement('div');
        removeConfirmation.className = 'remove-confirmation';
        removeConfirmation.innerHTML = `
            <p>Remove this item from cart?</p>
            <div class="confirm-buttons">
                <button class="confirm-btn confirm-remove">Remove</button>
                <button class="confirm-btn confirm-cancel">Cancel</button>
            </div>
        `;
        document.body.appendChild(removeConfirmation);

        // Quantity controls with input validation
        document.querySelectorAll('.quantity-controls').forEach(controls => {
            const plus = controls.querySelector('.plus');
            const minus = controls.querySelector('.minus');
            const quantity = controls.querySelector('.quantity');

            const updateQuantity = (newValue) => {
                quantity.textContent = Math.max(1, newValue);
            };

            plus?.addEventListener('click', () => updateQuantity(parseInt(quantity.textContent) + 1));
            minus?.addEventListener('click', () => updateQuantity(parseInt(quantity.textContent) - 1));
        });

        // Cart functions with price formatting
        const updateCartDisplay = () => {
            const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            cartModal.innerHTML = `
                <div class="cart-content">
                    <h3>Your Cart (${totalItems} items)</h3>
                    ${cartItems.map((item, index) => `
                        <div class="cart-item" data-index="${index}">
                            <span>${item.name} x${item.quantity}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            
            localStorage.setItem('cart', JSON.stringify(cartItems));
        };

        const addToCart = (event) => {
            const button = event.target;
            const parent = button.closest('.carousel-item');
            const quantity = parseInt(parent.querySelector('.quantity').textContent);
            const itemName = parent.querySelector('h3').textContent;
            const itemPrice = parseFloat(parent.querySelector('.price').textContent.replace('$', ''));

            const existingIndex = cartItems.findIndex(item => 
                item.name === itemName && item.price === itemPrice
            );

            if (existingIndex > -1) {
                cartItems[existingIndex].quantity += quantity;
            } else {
                cartItems.push({ name: itemName, price: itemPrice, quantity });
            }

            updateCartDisplay();
            
            // Show notification with safety checks
            const notification = document.getElementById('cartNotification');
            if (notification) {
                notification.querySelector('.notification-text').textContent = 
                    `${quantity} ${itemName} Added to Cart!`;
                notification.classList.add('show');
                setTimeout(() => notification.classList.remove('show'), 3000);
            }
        };

        // Event listeners with null checks
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });

        document.querySelector('.cart-icon')?.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-item')) {
                itemToRemove = parseInt(e.target.closest('.cart-item').dataset.index);
                removeConfirmation.classList.add('show');
            }
            
            if (e.target.classList.contains('confirm-cancel')) {
                removeConfirmation.classList.remove('show');
                itemToRemove = null;
            }
            
            if (e.target.classList.contains('confirm-remove')) {
                cartItems.splice(itemToRemove, 1);
                updateCartDisplay();
                removeConfirmation.classList.remove('show');
                itemToRemove = null;
            }
            
            if (!e.target.closest('.cart-icon') && !e.target.closest('.cart-modal')) {
                cartModal.style.display = 'none';
            }
        });

        updateCartDisplay();
    }
});

// Login/signup form toggle (global function)
function toggleForm(type) {
    const formTitle = document.getElementById('formTitle');
    const authForm = document.getElementById('authForm');
    const resetForm = document.getElementById('resetForm');

    if (!formTitle || !authForm || !resetForm) return;

    switch(type) {
        case 'signup':
            formTitle.textContent = 'Sign Up';
            authForm.innerHTML = `
                <input type="text" id="signupName" placeholder="Enter your Name" required>
                <input type="email" id="signupEmail" placeholder="Enter your Email" required>
                <input type="password" id="signupPassword" placeholder="Enter your Password" required>
                <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                <button type="submit">Sign Up</button>
                <p class="toggle">Already have an account? <a onclick="toggleForm('login')">Log In</a></p>
            `;
            attachSignupHandler();
            break;

        case 'forgot':
            formTitle.textContent = 'Reset Password';
            authForm.classList.add('hidden');
            resetForm.classList.remove('hidden');
            return;

        default: // login
            formTitle.textContent = 'Log In';
            authForm.innerHTML = `
                <input type="email" id="loginEmail" placeholder="Enter your Email" required>
                <input type="password" id="loginPassword" placeholder="Enter your Password" required>
                <button type="submit">Log In</button>
                <a class="forgot-password" onclick="toggleForm('forgot')">Forgot Password?</a>
                <p class="toggle">Don't have an account? <a onclick="toggleForm('signup')">Sign Up</a></p>
            `;
            attachLoginHandler();
    }

    resetForm.classList.add('hidden');
    authForm.classList.remove('hidden');
}

function attachLoginHandler() {
    const button = authForm.querySelector('button');
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        alert(data.message);
    });
}

function attachSignupHandler() {
    const button = authForm.querySelector('button');
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            return alert("Passwords do not match!");
        }

        const res = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        alert(data.message);
    });
}

// Initialize on page load
toggleForm('login');

//     resetForm.classList.add('hidden');
//     authForm.classList.remove('hidden');
// }