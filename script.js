// ===== FUNCIONES AUXILIARES PARA PRODUCTO =====  

// Cambiar cantidad del producto
function changeQuantity(change) {
    var quantityInput = document.getElementById('quantity-selector');
    if (quantityInput) {
        var currentValue = parseInt(quantityInput.value) || 1;
        var newValue = currentValue + change;
        
        if (newValue >= 1 && newValue <= 10) {
            quantityInput.value = newValue;
        }
    }
}

// Validar cantidad del producto
function validateQuantity() {
    var quantityInput = document.getElementById('quantity-selector');
    if (quantityInput) {
        var value = parseInt(quantityInput.value) || 1;
        if (value < 1) {
            quantityInput.value = 1;
        } else if (value > 10) {
            quantityInput.value = 10;
        }
    }
}

// Agregar producto desde vista individual
function addProductToCart() {
    if (!currentProduct) return;
    
    var quantityInput = document.getElementById('quantity-selector');
    var quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    addToCart(currentProduct.product.id, quantity);
    
    if (quantityInput) {
        quantityInput.value = 1;
    }
}

// Volver a la categoría
function goBackToCategory() {
    var existingModal = document.getElementById('cart-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.style.overflow = '';
    
    if (currentProduct) {
        showCategory(currentProduct.category);
    } else if (currentCategory) {
        showCategory(currentCategory);
    } else {
        showHome();
    }
}


// ===== FUNCIONES DE BÚSQUEDA =====

// Buscar productos
function searchProducts(query) {
    var results = [];
    var queryLower = query.toLowerCase();
    
    Object.keys(products).forEach(function(category) {
        products[category].forEach(function(product) {
            if (product.name.toLowerCase().includes(queryLower) || 
                category.toLowerCase().includes(queryLower)) {
                results.push({
                    product: product,
                    category: category,
                    type: 'product'
                });
            }
        });
    });
    
    Object.keys(products).forEach(function(category) {
        if (category.toLowerCase().includes(queryLower)) {
            results.push({
                category: category,
                type: 'category'
            });
        }
    });
    
    return results;
}

// Crear dropdown de búsqueda
function createSearchDropdown() {
    var dropdown = document.createElement('div');
    dropdown.id = 'search-dropdown';
    dropdown.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ddd; border-top: none; border-radius: 0 0 1rem 1rem; max-height: 300px; overflow-y: auto; z-index: 1000; display: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';
    
    return dropdown;
}

// Mostrar sugerencias de búsqueda
function showSuggestions(results, dropdown, input) {
    dropdown.innerHTML = '';
    
    if (results.length === 0) {
        dropdown.style.display = 'none';
        return;
    }
    
    results.slice(0, 8).forEach(function(result) {
        var item = document.createElement('div');
        item.style.cssText = 'padding: 1rem; cursor: pointer; border-bottom: 1px solid #eee; font-size: 1.4rem; transition: background-color 0.2s; touch-action: manipulation;';
        
        if (result.type === 'product') {
            item.innerHTML = '<strong>' + result.product.name + '</strong><br><small style="color: #666;">en ' + result.category.charAt(0).toUpperCase() + result.category.slice(1) + ' - ' + result.product.price + ' Bs</small>';
            item.onclick = function() {
                showProduct(result.product.id);
                dropdown.style.display = 'none';
                input.value = '';
            };
        } else {
            item.innerHTML = '<strong>Ver todos los ' + result.category.charAt(0).toUpperCase() + result.category.slice(1) + '</strong><br><small style="color: #666;">Categoría</small>';
            item.onclick = function() {
                showCategory(result.category);
                dropdown.style.display = 'none';
                input.value = '';
            };
        }
        
        item.onmouseover = function() { this.style.backgroundColor = '#f5f5f5'; };
        item.onmouseout  = function() { this.style.backgroundColor = 'white'; };
        
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}

// Realizar búsqueda
function performSearch(query) {
    if (query.trim() === '') {
        showHome();
        return;
    }
    
    var results = searchProducts(query);
    
    var existingModal = document.getElementById('cart-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.style.overflow = '';
    
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('category-view').classList.remove('hidden');
    document.getElementById('product-view').classList.add('hidden');
    
    document.getElementById('category-breadcrumb').textContent = 'Resultados de búsqueda';
    document.getElementById('category-title').textContent = 'Resultados para: "' + query + '"';
    
    var categoryContainer = document.getElementById('category-products');
    var searchHTML = '';
    
    var productResults = results.filter(function(r) { return r.type === 'product'; });
    
    if (productResults.length === 0) {
        searchHTML = '<div style="text-align: center; padding: 3rem; font-size: 1.6rem; color: #666;">No se encontraron productos que coincidan con tu búsqueda.</div>';
    } else {
        productResults.forEach(function(result) {
            searchHTML += generateProductHTML(result.product);
        });
    }
    
    categoryContainer.innerHTML = searchHTML;
    currentCategory = 'search';
}

// ===== FUNCIONES DE OPTIMIZACIÓN =====

// Prevenir zoom accidental en iOS
function preventDoubleZoom() {
    var lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Mejorar performance en dispositivos móviles
function optimizePerformance() {
    if (isMobile && 'IntersectionObserver' in window) {
        var imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        setTimeout(function() {
            var images = document.querySelectorAll('.container-img img');
            images.forEach(function(img) {
                if (img.src.startsWith('data:')) {
                    imageObserver.observe(img);
                }
            });
        }, 1000);
    }
}

// ===== Asegurar layout del header (centrar FRAGOLE y agrandar carrito) =====
function enforceHeaderLayout() {
    var logo = document.querySelector('.container-logo');
    if (logo) {
        if (window.innerWidth > 768) {
            logo.style.position = 'absolute';
            logo.style.left = '50%';
            logo.style.transform = 'translateX(-50%)';
        } else {
            logo.style.position = '';
            logo.style.left = '';
            logo.style.transform = '';
        }
    }

    var cartIcon = document.querySelector('.navbar-right button[aria-label="Ver carrito de compras"] i');
    if (cartIcon) {
        cartIcon.style.fontSize = '2.2rem';
        cartIcon.style.lineHeight = '1';
    }
}

/* =========================================================
   === NUEVO: HAMBURGUESA + DRAWER (BARRA LATERAL) =========
   ========================================================= */

function injectMenuStyles() {
    if (document.getElementById('menu-inline-styles')) return;
    var style = document.createElement('style');
    style.id = 'menu-inline-styles';
    style.textContent = `
    /* Overlay */
    .drawer-overlay {
        position: fixed; inset: 0;
        background: rgba(0,0,0,.45);
        opacity: 0; pointer-events: none;
        transition: opacity .2s ease;
        z-index: 9998;
        backdrop-filter: blur(2px);
    }
    .drawer-overlay.show { opacity: 1; pointer-events: auto; }

    /* Drawer */
    .side-drawer {
        position: fixed; top: 0; left: 0;
        height: 100vh; width: 280px; max-width: 86vw;
        background: #fff; color: var(--dark-color, #222);
        box-shadow: 0 10px 30px rgba(0,0,0,.25);
        transform: translateX(-100%);
        transition: transform .22s ease;
        z-index: 9999;
        display: flex; flex-direction: column;
        border-right: 1px solid #eee;
    }
    .side-drawer.open { transform: translateX(0); }

    .drawer-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 1.2rem 1.4rem; border-bottom: 1px solid #eee;
        font-weight: 700; letter-spacing: .3px;
    }
    #drawer-close-btn {
        background: #f1f1f1; border: none; width: 32px; height: 32px;
        border-radius: 50%; font-size: 1.6rem; cursor: pointer; color: #666;
    }
    #drawer-close-btn:hover { background:#e7e7e7; }

    .drawer-section-title {
        font-size: .95rem; color: #999; padding: .8rem 1.4rem; text-transform: uppercase;
        letter-spacing: .08em;
    }
    .drawer-list {
        display: flex; flex-direction: column; padding: .6rem 0 1rem;
    }
    .drawer-list a {
        display: block; padding: .9rem 1.4rem; text-decoration: none;
        color: inherit; font-size: 1.05rem;
    }
    .drawer-list a:hover { background: #f7f7f7; }

    /* Botón Hamburguesa */
    #hamburger-btn {
        position: fixed; top: 12px; left: 12px; z-index: 10000;
        width: 42px; height: 42px; background: rgba(255,255,255,.85);
        border: 1px solid #e6e6e6; border-radius: 10px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,.12);
        backdrop-filter: blur(3px);
    }
    #hamburger-btn:active { transform: scale(.97); }
    #hamburger-btn span {
        display: block; width: 22px; height: 2px; background: var(--dark-color, #222);
        margin: 3px 0; border-radius: 2px;
    }
    @media (min-width: 769px) {
        #hamburger-btn { top: 16px; left: 18px; }
    }
    .no-scroll { overflow: hidden !important; }
    `;
    document.head.appendChild(style);
}

// Crear (una sola vez) el drawer y eventos
function setupCategoryDrawer() {
    injectMenuStyles();
    if (document.querySelector('.side-drawer')) return; // ya existe

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'drawer-overlay';
    overlay.id = 'drawer-overlay';

    // Panel
    var drawer = document.createElement('aside');
    drawer.className = 'side-drawer';
    drawer.id = 'side-drawer';

    // Contenido del drawer
    drawer.innerHTML =
        '<div class="drawer-header">' +
            '<span>Menú</span>' +
            '<button type="button" aria-label="Cerrar" title="Cerrar" id="drawer-close-btn">×</button>' +
        '</div>' +
        '<div class="drawer-section-title">Navegación</div>' +
        '<nav class="drawer-list" id="drawer-nav">' +
            '<a href="#" data-action="home">Inicio</a>' +
            '<a href="#" data-action="all">Mostrar todo</a>' +
            '<a href="#" data-action="about">Sobre Nosotros</a>' +
        '</nav>' +
        '<div class="drawer-section-title">Categorías</div>' +
        '<nav class="drawer-list" id="drawer-cats">' +
            '<a href="#" data-cat="aretes">Aretes</a>' +
            '<a href="#" data-cat="argollas">Argollas</a>' +
            '<a href="#" data-cat="pulseras">Pulseras</a>' +
            '<a href="#" data-cat="collares">Collares</a>' +
        '</nav>';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    // Cerrar al hacer clic en overlay
    overlay.addEventListener('click', closeCategoryDrawer);

    // Cerrar con botón X
    var closeBtn = document.getElementById('drawer-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeCategoryDrawer();
        });
    }

    // Click en navegación
    drawer.querySelectorAll('#drawer-nav a').forEach(function(a) {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            var action = this.getAttribute('data-action');
            if (action === 'home') showHome();
            if (action === 'all') showAllProducts();
            if (action === 'about') showAbout();
            closeCategoryDrawer();
        });
    });

    // Click en categorías
    drawer.querySelectorAll('#drawer-cats a').forEach(function(a) {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            var cat = this.getAttribute('data-cat') || '';
            if (cat) showCategory(cat);
            closeCategoryDrawer();
        });
    });

    // Soporte de legado si existe .dropdown-toggle
    var legacyToggle = document.querySelector('.dropdown-toggle');
    if (legacyToggle) {
        legacyToggle.onclick = function(e) {
            e.preventDefault();
            openCategoryDrawer();
            return false;
        };
    }
}

function createHamburgerButton() {
    injectMenuStyles();
    if (document.getElementById('hamburger-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'hamburger-btn';
    btn.setAttribute('aria-label', 'Abrir menú');
    btn.innerHTML = '<span></span><span></span><span></span>';
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        openCategoryDrawer();
    });

    // Intenta ponerlo dentro de la navbar si existe; si no, al body (fixed)
    var navbar = document.querySelector('.navbar') || document.body;
    navbar.appendChild(btn);
}

function openCategoryDrawer() {
    var overlay = document.getElementById('drawer-overlay');
    var drawer = document.getElementById('side-drawer');
    if (!overlay || !drawer) return;

    overlay.classList.add('show');
    drawer.classList.add('open');
    document.body.classList.add('no-scroll');
}

function closeCategoryDrawer() {
    var overlay = document.getElementById('drawer-overlay');
    var drawer = document.getElementById('side-drawer');
    if (!overlay || !drawer) return;

    overlay.classList.remove('show');
    drawer.classList.remove('open');
    document.body.classList.remove('no-scroll');
}

/* ========= NUEVO: utilidades búsqueda móvil (garantiza foco/escritura) ========= */
function ensureSearchFixStyles() {
    if (document.getElementById('search-fix-styles')) return;
    var st = document.createElement('style');
    st.id = 'search-fix-styles';
    st.textContent = `
      /* Estilos para búsqueda móvil expandida */
      .mobile-view .search-form.search-open { 
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        height: auto !important;
        z-index: 10001 !important;
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(10px) !important;
        border-bottom: 1px solid #eee !important;
        padding: 1rem !important;
        margin: 0 !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        border-radius: 0 !important;
        animation: searchExpand 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      }
      
      .mobile-view .search-form.search-open input {
        opacity: 1 !important;
        pointer-events: auto !important;
        width: calc(100% - 60px) !important;
        display: block !important;
        font-size: 18px !important;
        padding: 15px 20px !important;
        border: 2px solid var(--primary-color, #c4a484) !important;
        border-radius: 12px !important;
        background: white !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        margin-right: 10px !important;
      }
      
      .mobile-view .search-form.search-open input:focus {
        outline: none !important;
        border-color: var(--primary-color, #c4a484) !important;
        box-shadow: 0 0 0 3px rgba(196, 164, 132, 0.2) !important;
      }
      
      .mobile-view .search-form.search-open button {
        background: var(--primary-color, #c4a484) !important;
        color: white !important;
        border: none !important;
        padding: 15px 20px !important;
        border-radius: 12px !important;
        font-size: 16px !important;
        min-width: 50px !important;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
        transition: all 0.2s ease !important;
      }
      
      .mobile-view .search-form.search-open button:hover {
        background: var(--primary-dark, #b8956f) !important;
        transform: translateY(-1px) !important;
      }
      
      /* Overlay para ocultar el resto del navbar */
      .mobile-view .search-form.search-open::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: -1;
        animation: fadeIn 0.3s ease;
      }
      
      /* Ocultar otros elementos del navbar cuando la búsqueda está activa */
      .mobile-view .navbar.search-active .container-logo,
      .mobile-view .navbar.search-active .navbar-right > *:not(.search-form),
      .mobile-view .navbar.search-active .menu,
      .mobile-view .navbar.search-active #hamburger-btn {
        opacity: 0 !important;
        pointer-events: none !important;
        transition: opacity 0.2s ease !important;
      }
      
      /* Animaciones */
      @keyframes searchExpand {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      /* Dropdown ajustado para búsqueda expandida */
      .mobile-view .search-form.search-open #search-dropdown {
        position: fixed !important;
        top: 80px !important;
        left: 1rem !important;
        right: 1rem !important;
        width: auto !important;
        max-height: calc(100vh - 120px) !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
      }
    `;
    document.head.appendChild(st);
}

function openMobileSearch(searchForm, searchInput) {
    if (!searchForm || !searchInput) return;
    ensureSearchFixStyles();
    
    // Agregar clase al navbar para ocultar otros elementos
    var navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.add('search-active');
    
    searchForm.classList.add('search-open');
    searchInput.removeAttribute('disabled');
    searchInput.readOnly = false;
    searchInput.style.pointerEvents = 'auto';
    searchInput.style.display = 'block';
    searchInput.style.width = '100%';
    searchInput.style.fontSize = '18px';
    
    if (!searchForm.dataset.prevZ) searchForm.dataset.prevZ = getComputedStyle(searchForm).zIndex || '';
    searchForm.style.zIndex = '10001';
    
    try {
        searchInput.focus();
        var len = searchInput.value.length;
        searchInput.setSelectionRange(len, len);
    } catch (_) {}
}

function closeMobileSearch(searchForm, searchInput) {
    if (!searchForm || !searchInput) return;
    
    // Remover clase del navbar
    var navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.remove('search-active');
    
    searchForm.classList.remove('search-open');
    searchInput.blur();
    searchInput.style.width = '';
    searchInput.style.pointerEvents = '';
    searchInput.style.display = '';
    searchForm.style.zIndex = searchForm.dataset.prevZ || '';
}

function attachMobileSearchActivator(searchForm, searchInput, dropdown) {
    if (!searchForm || !searchInput) return;
    ensureSearchFixStyles();

    var triggers = [];
    var candidates = [
        '.navbar-right .fa-magnifying-glass',
        '.navbar-right .fa-search',
        '.fa-magnifying-glass',
        '.fa-search',
        '[data-action="search"]',
        '[aria-label="Buscar"]',
        '.search-toggle',
        '.search-btn',
        '.btn-search'
    ];
    candidates.forEach(function(sel){ document.querySelectorAll(sel).forEach(function(el){ triggers.push(el); }); });

    var btnInside = searchForm.querySelector('button');
    if (btnInside) triggers.push(btnInside);

    var handler = function(e){
        if (!isMobile) return;
        var empty = (searchInput.value || '').trim() === '';
        var notOpen = !searchForm.classList.contains('search-open');
        if (empty || notOpen) {
            e.preventDefault();
            openMobileSearch(searchForm, searchInput);
        }
    };

    triggers.forEach(function(el){
        if (!el || el.dataset.searchHooked) return;
        el.addEventListener('click', handler, true);
        el.addEventListener('touchend', function(ev){ handler(ev); }, { passive: false });
        el.dataset.searchHooked = '1';
    });

    // Respaldo: capturamos cualquier click/touch en lupa que no hayamos enganchado
    document.addEventListener('click', function(e){
        if (!isMobile) return;
        var t = e.target;
        if (t.closest('.fa-magnifying-glass') || t.closest('.fa-search') || t.closest('[data-action="search"]') || t.closest('[aria-label="Buscar"]')) {
            var empty = (searchInput.value || '').trim() === '';
            var notOpen = !searchForm.classList.contains('search-open');
            if (empty || notOpen) {
                e.preventDefault();
                openMobileSearch(searchForm, searchInput);
            }
        }
    }, true);
}

// ===== CONFIGURACIÓN PRINCIPAL =====

document.addEventListener('DOMContentLoaded', function() {
     
    // Ocultar soporte técnico por si el HTML viejo aún lo tiene
    var cs = document.querySelector('.customer-support');
    if (cs) cs.style.display = 'none';

    // Crear drawer y botón hamburguesa
    setupCategoryDrawer();
    createHamburgerButton();

    // Asegurar layout del header según tamaño inicial
    enforceHeaderLayout();

    // Detectar si estamos en móvil inicialmente
    handleScreenChange();
    
    // Escuchar cambios de tamaño de pantalla y orientación
    window.addEventListener('resize', function() {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function () {
            handleScreenChange();
            enforceHeaderLayout();
        }, 150);
    });
    
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            handleScreenChange();
            optimizeNavigationForMobile();
            enforceHeaderLayout();
            closeCategoryDrawer();
        }, 200);
    });
    
    // Prevenir zoom accidental en iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        var lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            var now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    // Optimizar performance en móviles
    if (isMobile) {
        optimizePerformance();
    }
    
    // Configuración del sistema de búsqueda
    var searchForm = document.querySelector('.search-form');
    if (searchForm) {
        var searchInput  = searchForm.querySelector('input');
        var dropdown     = createSearchDropdown();
        searchForm.style.position = 'relative';
        searchForm.appendChild(dropdown);
        
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                var query = this.value.trim();
                if (query.length >= 2) {
                    var results = searchProducts(query);
                    showSuggestions(results, dropdown, searchInput);
                } else {
                    dropdown.style.display = 'none';
                }
            });
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    var searchTerm = this.value.trim();
                    if (searchTerm) {
                        performSearch(searchTerm);
                        dropdown.style.display = 'none';
                        closeMobileSearch(searchForm, searchInput);
                    }
                }
                if (e.key === 'Escape') {
                    dropdown.style.display = 'none';
                    closeMobileSearch(searchForm, searchInput);
                }
            });
        }

        // Activadores robustos para móvil (íconos/botones de lupa)
        attachMobileSearchActivator(searchForm, searchInput, dropdown);

        // Cerrar modo búsqueda al tocar fuera (si está vacío)
        document.addEventListener('click', function(e) {
            if (!searchForm.contains(e.target)) {
                dropdown.style.display = 'none';
                if (searchInput && (searchInput.value || '').trim() === '') {
                    closeMobileSearch(searchForm, searchInput);
                }
            }
        });

        // Submit normal
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var searchTerm = (searchInput && searchInput.value || '').trim();
            if (searchTerm) {
                performSearch(searchTerm);
                dropdown.style.display = 'none';
                closeMobileSearch(searchForm, searchInput);
            } else if (isMobile && searchInput) {
                // Si está vacío, usar el submit como "abrir/enfocar"
                openMobileSearch(searchForm, searchInput);
            }
        });
    }
    
    // Clic en el carrito con mejor soporte táctil
    var cartButton = document.querySelector('button[aria-label="Ver carrito de compras"]');
    if (cartButton) {
        cartButton.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        cartButton.addEventListener('touchend', function() {
            this.style.transform = '';
        }, { passive: true });
    }
    
    // Cerrar modal/drawer con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
            closeCategoriesMenu(); // legado
            closeCategoryDrawer();
            var sf = document.querySelector('.search-form');
            var si = sf ? sf.querySelector('input') : null;
            if (sf && sf.classList.contains('search-open')) {
                closeMobileSearch(sf, si || null);
            }
        }
    });
    
    // Cerrar dropdown/drawer al hacer scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            closeCategoriesMenu(); // legado
            closeCategoryDrawer();
            var dd = document.getElementById('search-dropdown');
            if (dd) dd.style.display = 'none';
        }
    });
    
    // Mejorar navegación táctil del dropdown (legado)
    var dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle && isMobile) {
        dropdownToggle.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        dropdownToggle.addEventListener('touchend', function() {
            var self = this;
            setTimeout(function() { self.style.transform = ''; }, 100);
        }, { passive: true });
    }
    
    // Cargar página de inicio
    showHome();
    // Sincronizar contador del carrito
    updateCartCounter();
});

// Base de datos de productos
const products = {
    aretes: [
    { 
        id: 1, 
        name: "Fragole  Intreccio", 
        price: 68, // EL PRECIO CON DESCUENTO

        images: [
            "img/ARETES/Fragole Intreccio.jpeg",
            "img/ARETES/Fragole Intreccio_2.jpeg"
        ],
        image: "img/ARETE.jpeg",
        description: "Arete plateado de acero inoxidable." 
    },
    
    { 
        id: 2, 
        name: "Fragole Amore", 
        price: 63,

        originalPrice: 70,// el precio original sin el descuento
        discount: 10, // para que salgan los descuentos en las imagenes
        images: [
            "img/ARETES/Fragole Amore_1.png",
            "img/ARETES/Fragole Amore_2.png",
        ],
        image: "img/ARETES/Fragole Onde.png",
        description: "Románticos aretes con forma de corazón. Perfectos para expresar amor y dulzura. Acero inoxidable"
    },
    { 
        id: 3, 
        name: "Fragole Onde", 
        price: 68,

    
        images: [
            "img/ARETES/Fragole Onde.jpeg",
            "img/ARETES/Fragole Onde_1.png",
            
        ],
        image: "img/Fragole Onde.jpeg",
        description: "Delicados aretes con forma de onda. Acero inoxidable" 
    },
    { 
        id: 4, 
        name: "Fragole perla Mare", 
        price: 68,

        images: [
            "img/ARETES/Fragole perla Mare.jpeg",
            "img/ARETES/Fragole perla Mare_1.jpeg",
            "img/ARETES/Fragole perla Mare_2.jpeg"
        ],
        image: "img/ARETES/Fragole perla Mare.jpeg",
        description: "Aretes largos y sofisticados que añaden elegancia a cualquier outfit. Diseño moderno y atemporal. Acero inoxidable" 
    },
    { 
        id: 5, 
        name: "Fragole onda de perla", 
        price: 63,

        images: [
            
            "img/ARETES/Fragole onda perla_1.jpeg",
            "img/ARETES/Fragole onda perla_2.jpeg"
            
        ],
        image: "img/ARETES/Fragole perla Mare.jpeg",
        description: "Elegantes aretes de perla. Clásicos y atemporales para cualquier ocasión. Acero Inoxidable"
     },
    { 
        id: 6, 
        name: "Fragole Nastro", 
        price: 63,

        images: [
            "img/ARETES/Fragole Nastro_2.jpeg",
            "img/ARETES/Fragole Nastro.png",
            "img/ARETES/Fragole Nastro_1.png"

        ],
        image: "img/ARETES/Fragole Nastro_2.jpeg",
        description: "Aretes colgantes dorados con diseño de corbata. Acero inoxidable" 
    },
    { 
        id: 7, 
        name: "Fragole Mini Hoop", 
        price: 59,

        images: [
            "img/ARETES/Fragole Mini Hoop_2.jpeg",
            "img/ARETES/Fragole Mini Hoop.jpeg",
            "img/ARETES/Fragole Mini Hoop_3.jpeg"
        ],
        image: "img/ARETES/Fragole Mini Hoop_2.jpeg",
        description: "Delicadas mini argollas ideales para un look minimalista. Cómodas para el uso diario.Acero Inoxidable" 
    },
    { 
        id: 8, 
        name: "Fragole Ovo", 
        price: 63,

        images: [
            "img/ARETES/Fragole Ovo.jpeg",
            "img/ARETES/Fragole Ovo_1.jpeg",
            "img/ARETES/Fragole Ovo_2.jpeg"
        ],
        image: "img/ARETES/Fragole Node.jpeg",
        description: "Aretes de botón, añaden un toque de elegancia a cualquier atuendo. Acero inoxidable" 
    },
   
    { 
        id: 9, 
        name: "Fragole Node", 
        price: 63,

        images: [
            "img/ARETES/Fragole Node.jpeg",
            "img/ARETES/Fragole Node_1.jpeg"
            
        ],
        image: "img/ARETEs/Fragole Node.jpeg",
        description: "Aretes cuadrados con lineas elegantes. Diseño moderno y juvenil. Acero inoxidable" 
    },
    { 
        id: 10, 
        name: "Fragole Perla Oceano", 
        price: 63,

        images: [
            "img/ARETES/Fragole perla Oceano.jpeg",
            "img/ARETES/Fragole perla Oceano_1.jpeg",
            "img/ARETES/Fragole perla Oceano_2.jpeg"
        ],
        image: "img/ARETES/Fragole perla Oceano.jpeg",
        description: "Delicados aretes con perlas. Perfectos para un look romántico y femenino. Acero Inoxidable" 
    },
    { 
        id: 11, 
        name: "Fragole chic", 
        price: 63,


        images: [
            "img/ARETES/Fragole chic.jpeg",
            "img/ARETES/Fragole chic_1.png",
            "img/ARETES/Fragole chic_2.png"
        ],
        image: "img/ARETES/Fragole chic.jpeg",
        description: "Aretes con forma de corbata que brillan con cada movimiento. Acero inoxidable." 
    },
    { 
        id: 12, 
        name: "Fragole Natura", 
        price: 86,

        images: [
            "img/ARETES/Fragole Natura.jpeg",
            "img/ARETES/Fragole Natura_2.jpeg",
            "img/ARETES/Fragole Natura_3.jpeg"
        ],
        image:  "img/ARETES/Fragole Natura.jpeg",
        description: "Elegantes aretes en forma de hojao. Clásicos y sofisticados. Xuping Bañado en Oro" 
    },
    { 
        id: 13, 
        name: "Fragole lagrima", 
        price: 63,

        images: [
            "img/ARETES/Fragole Lagrima.jpeg",
            "img/ARETES/Fragole Lagrima_1.jpeg"
        ],
        image: "img/ARETES/Fragole Lagrima_1.jpeg",
        description: "Elegantes aretes en forma de gota. Clásicos y sofisticados. Acero inoxidable" 
    },
    { 
        id: 14, 
        name: "Fragole Palma", 
        price: 68,

 
        images: [
            "img/ARETES/Fragole Palma.jpeg",
            "img/ARETES/Fragole Palma_1.jpeg"
        ],
        image: "img/ARETES/Fragole Palma.jpeg",
        description: "Elegantes aretes en hoja de palmeras. Acero Inoxidable." 
    },
    { 
        id: 15, 
        name: "Fragole Astro", 
        price: 50,

        images: [
            "img/ARETES/Fragole Astro.jpeg",
            "img/ARETES/Fragole Astro_1.jpeg",
            "img/ARETES/Fragole Astro__2.jpeg"
        ],
        image: "img/ARETES/Fragole Astro.jpeg",
        description: "Elegantes aretes en forma de estrella. Acero Inoxidables" 
    },
    { //aqui comiezan los aretes del inversor
        id: 16, 
        name: "Faragole Aurea", 
        price: 61,

        images: [
            "img/ARETES/Fragole Aurea.jpeg",
            "img/ARETES/Fragole Aurea_1.png",
            "img/ARETES/Fragole Aurea_2.png"
        ],
        image: "img/ARETES/Fragole Aurea.jpeg",
        description: "Elegantes aretes, clásicos y sofisticados. Acero Inoxidable" 
    },
    { 
        id: 17, 
        name: "Fragole Bow", 
        price: 63,

        images: [
            "img/ARETES/Fragole Bow.jpeg",
            "img/ARETES/Fragole Bow_1.jpeg",
            "img/ARETES/Fragole Bow_2.jpeg"
        ],
        image: "img/ARETES/Fragole Bow_2.jpeg",
        description: "Elegante arete en forma de moñito. Acero inoxidable" 
    },
    
    { 
        id: 18, 
        name: "Fragole Onda", 
        price: 63,

        images: [
            "img/ARETES/Fragole Onda.jpeg",
            "img/ARETES/Fragole Onda_1.jpeg",
            "img/ARETES/Fragole Onda_2.jpeg"
        ],
        image:"img/ARETES/Fragole Onda.jpeg",
        description: "Elegantes aretes en forma de onda. Clásicos y sofisticados. Acero Inoxidable" 
    },
    { 
        id: 19, 
        name: "Fragole Fiocco", 
        price: 68,

        images: [
            "img/ARETES/Fragole Fiocco_2.jpeg",
            "img/ARETES/Fragole Fiocco.jpeg",
            "img/ARETES/Fragole Ficco_1.jpeg"
        ],
        image: "img/ARETES/Fragole Fiocco_2.jpeg",
        description: "Elegantes aretes en forma moño nacar blanco. Acero inoxidable." 
    },
    { 
        id: 20, 
        name: " Set arete de corazón", 
        price: 90,

        images: [
            "img/ARETES/Set de corazones.jpeg",
            "img/ARETES/Set de corazon_1.png",
            
        ],
        image: "img/ARETES/Set de corazones.jpeg",
        description: "Elegantes aretes en forma de corazón. Acero Inoxidable" 
    },
    
    { 
        id: 21, 
        name: "Arete vc blanco", 
        price: 66,

        images: [
            "img/ARETES/Arete vc blanco.jpeg",
            "img/ARETES/Arete vc blanco_1.jpeg"
        ],
        image: "img/ARETES/Arete vc blanco.jpeg",
        description: "Elegantes aretes vc blancos nacar Clásicos. Acero inoxidable" 
    },
    { 
        id: 22, 
        name: "Fragole clasico Twist", 
        price: 68,

        images: [
            "img/ARETES/Fragole clasico Twist_1.jpeg",
        ],
        image: "img/ARETES/Fragole clasico Twist_1.jpeg",
        description: "Elegantes Argollas clásicas. Acero Inoxidable" 
    },
    { 
        id: 23, 
        name: "Fragole Estela fiorita", 
        price: 70,

        images: [
            "img/ARETES/Fragole Estela fiorita.jpeg",
            "img/ARETES/Fragole Estela fiorita_1.png"
            
        ],
        image: "img/ARETES/Fragole Estela fiorita.jpeg",
        description: " Aretes en forma de flor, perfecto para la primavera. Acero inoxidable." 
    },
    { 
        id: 24, 
        name: "Fragole Mirage", 
        price: 68,

        images: [
            "img/ARETES/Fragole Mirage.jpeg",
            "img/ARETES/Fragole Mirage_1.jpeg",
        ],
        image: "img/ARETES/Fragole Mirage.jpeg",
        description: "Elegantes aretes doblados dorado. Acero Inoxidable." 
    },
    { 
        id: 25, 
        name: "Fragole Wave ", 
        price: 68,

        images: [
             "img/ARETES/Fragole Wave.jpeg",
              "img/ARETES/Fragole Wave_1.jpeg"
        ],
        image:  "img/ARETES/Fragole Wave.jpeg",
        description: "Elegantes aretes en circulo doblado. Acero inoxidable." 
    },
    { 
        id: 26, 
        name: "Fragole Soleil", 
        price: 68,

        images: [
            "img/ARETES/Fragole Solei.png",
            "img/ARETES/Fragole Solei_1.png"
        ],
        image: "img/ARETES/Fragole Solei.png",
        description: "Arete en forma de boton con abanico con lineas. Acero inoxidable." 
    },
    { 
        id: 27, 
        name: "Fragole Eleganza", 
        price: 68,

        images: [
            "img/ARETES/Fragole Eleganza.jpeg",
            "img/ARETES/Fragole Eleganza_1.jpeg"
        ],
        image: "img/ARETES/Fragole Eleganza.png",
        description: "Elegantes aretes en forma de gota que alarga el cuello Largo:3,6 cm. Clásicos y sofisticados." 
    },
    { 
        id: 28, 
        name: "Fragole Serena", 
        price: 63,

        images: [
            "img/ARETES/Fragole Serena.jpeg",
            "img/ARETES/Fragole Serena_1.jpeg"
        ],
        image: "img/ARETES/Fragole Serena.jpeg",
        description: "Elegantes aretes en forma de argolla clasica. Acero inoxidable" 
    },
    
    { 
        id: 29, 
        name: "Fragole Luna Bold", 
        price: 68,

        images: [
            "img/ARETES/Fragole luna Bold.png",
            "img/ARETES/Fragole luna Bold_1.png"
        ],
        image: "img/ARETES/Fragole luna Bold.png",
        description: "Elegantes aretes en forma de argolla clasica 3cm de largo. Acero inoxidable." 
    },
    { 
        id: 30, 
        name: "Fragole Crescent Aura", 
        price: 68,

        images: [
            "img/ARETES/Fragole Crescent Aura.png",
            "img/ARETES/Fragole Crescent Aura_1.png"

        ],
        image: "img/ARETES/Fragole Crescent Aura.png",
        description: "Elegantes aretes en forma de argolla gruesa clasica. Clásicos y sofisticados." 
    },
   
    { 
        id: 31, 
        name: "Fragole Doric", 
        price: 68,

        images: [
            "img/ARETES/Fragole Doric.jpeg",
            "img/ARETES/Fragole Doric_2.jpeg"
        ],
        image: "img/ARETES/Fragole Doric.jpeg",
        description: "Arete tipo argolla clasico con lineas, largo 3,3cm. Acero inoxidable "
   
    },
    
    { 
        id: 32, 
        name: "Fragole Solaris", 
        price: 68,

        images: [
            "img/ARETES/Fragole Solaris.jpeg",
            "img/ARETES/Fragole Solaris_1.jpeg"
        ],
        image: "img/ARETES/Fragole Solaris_1.jpeg",
        description: "Arete argolla deretida clasica, largo 3cm. Acero inoxidable " 
    },
    
//-------------------------------------------------------------//
////----------------ARGOLAS-----------------------------////    

    
    ],
    argollas: [
        { 
        id: 33, 
        name: "Anillo Eslabon", 
        price: 50,

        originalPrice: 55,// el precio original sin el descuento
        discount: 10, // para que salgan los descuentos en las imagenes
        images: [
            "img/anillos/Anillo Eslabon.jpeg",
            "img/anillos/Anillo Eslabon_1.jpeg"
        ],
        image:"img/anillos/Anillo Eslabon.jpeg",
        description: "TALLA 17." 
        },

        { 
        id: 34, 
        name: "Anillo Sirena", 
        price: 50,

        images: [
            "img/anillos/Anillo Sirena.jpeg",
            "img/anillos/Anillo Sirena_1.jpeg"
        ],
        image:"img/anillos/Anillo Sirena.jpeg",
        description: "TALLA 18." 
        },

        { 
        id: 35, 
        name: "Anillo Eslabon Plateado", 
        price: 50,

        images: [
            "img/anillos/Anillo Eslabon Plateado.jpeg"
        ],
        image:"img/anillos/Anillo Eslabon Plateado.jpeg",
        description: "TALLA 16." 
        },
    ],
    
    //---------------PULSERAS-------------------
    //-------------------------------------------

    pulseras: [
        { 
        id: 36, 
        name: "pulsera Elegante", 
        price: 81,

        originalPrice: 90,// el precio original sin el descuento
        discount: 10, // para que salgan los descuentos en las imagenes
        images: [
            "img/PULSERA_SOULT OUT.jpeg",
        ],
        image:"img/PULSERA_SOULT OUT.jpeg",
        description: "Elegantes pulsera con perlas. Clásicos y sofisticados." 
        },
       
    //----------------COLLARES---------------------------------
    //---------------------------------------------------------
    ],
    collares: [
        { 
        id: 38, 
        name: "Collar Bioquimico ", 
        price: 83,

        images: [
            "img/COLLARES/Collar bioquimico.jpeg",
            "img/COLLARES/Collar bioquimico_1.jpeg"

        ],
        image: "img/COLLARES/Collar bioquimico.jpeg",
        description: "Elegantes collar con dije de quimicos." 
        },

        { 
        id: 39, 
        name: "Fragole Mare", 
        price: 86,

        images: [
            "img/COLLARES/Collar Mare.jpeg",
            "img/COLLARES/Collar Mare_1.jpeg",
        ],
        image:"img/COLLARES/Collar Mare.jpeg",
        description: "Elegante arete con dije de cangrejo. Acero inoxidable" 
        },

        { 
        id: 40, 
        name: "Fragole Angel", 
        price: 81,

        images: [
            "img/COLLARES/Fragole Angel.jpeg",
            "img/COLLARES/Fragole Angel_1.jpeg",
        ],
        image:  "img/COLLARES/Fragole Angel.jpeg",
        description: "Elegantes aretes en forma de Angel. Clásicos y sofisticados." 
        },

        { 
        id: 41, 
        name: "Fragole Oceano", 
        price: 95,

        images: [
            "img/COLLARES/Fragole oceano.jpeg",
            "img/COLLARES/Fragole oceano_1.jpeg"

        ],
        image: "img/COLLARES/Fragole oceano.jpeg",
        description: "Elegantes aretes en forma de Tortuga.  Acero inoxidable" 
        },
    ]
};

// Variables globales
var currentCategory = '';
var currentProduct = null;
var cart = [];
var isMobile = window.innerWidth <= 768;

// ===== FUNCIONES DEL CARRUSEL DE IMÁGENES =====
var currentImageIndex = 0;

function createImageCarousel(images) {
    var carouselHTML = 
        '<div class="product-image-carousel">' +
            '<div class="carousel-container">' +
                '<div class="carousel-track" id="carousel-track">';
    
    images.forEach(function(image, index) {
        carouselHTML += 
            '<div class="carousel-slide ' + (index === 0 ? 'active' : '') + '">' +
                '<img src="' + image + '" alt="Imagen ' + (index + 1) + '" />' +
            '</div>';
    });
    
    carouselHTML += 
                '</div>' +
            '</div>' +
            '<div class="carousel-navigation">' +
                '<button class="carousel-btn prev-btn" onclick="previousImage()" aria-label="Imagen anterior">' +
                    '<i class="fa-solid fa-chevron-left"></i>' +
                '</button>' +
                '<div class="carousel-dots" id="carousel-dots">';
    
    images.forEach(function(_, index) {
        carouselHTML += 
            '<button class="carousel-dot ' + (index === 0 ? 'active' : '') + '" ' +
            'onclick="goToImage(' + index + ')" aria-label="Ver imagen ' + (index + 1) + '"></button>';
    });
    
    carouselHTML += 
                '</div>' +
                '<button class="carousel-btn next-btn" onclick="nextImage()" aria-label="Siguiente imagen">' +
                    '<i class="fa-solid fa-chevron-right"></i>' +
                '</button>' +
            '</div>' +
        '</div>';
    
    return carouselHTML;
}

function goToImage(index) {
    var track = document.getElementById('carousel-track');
    var dots = document.querySelectorAll('.carousel-dot');
    var slides = document.querySelectorAll('.carousel-slide');
    
    if (!track || !dots || !slides) return;
    
    currentImageIndex = index;
    
    var translateX = -index * 100;
    track.style.transform = 'translateX(' + translateX + '%)';
    
    dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === index);
    });
    
    slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === index);
    });
}

function nextImage() {
    var slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    
    var nextIndex = (currentImageIndex + 1) % slides.length;
    goToImage(nextIndex);
}

function previousImage() {
    var slides = document.querySelectorAll('.carousel-slide');
    if (!slides.length) return;
    
    var prevIndex = currentImageIndex === 0 ? slides.length - 1 : currentImageIndex - 1;
    goToImage(prevIndex);
}

function addTouchSupport() {
    var carousel = document.querySelector('.product-image-carousel');
    if (!carousel) return;
    
    var startX = 0;
    var currentX = 0;
    var isDragging = false;
    var threshold = 50;
    
    carousel.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });
    
    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        
        var deltaX = currentX - startX;
        
        if (Math.abs(deltaX) > threshold) {
            if (deltaX > 0) {
                previousImage();
            } else {
                nextImage();
            }
        }
    }, { passive: true });
    
    carousel.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
}

// ===== MENÚ DROPDOWN (LEGADO) -> ahora abre el drawer =====
function toggleCategoriesMenu(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    openCategoryDrawer();
}
function closeDropdownOnClickOutside(event) {
    var dropdown = document.querySelector('.dropdown');
    if (dropdown && !dropdown.contains(event.target)) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeDropdownOnClickOutside);
    }
}
function closeCategoriesMenu() {
    var dropdown = document.querySelector('.dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
        document.removeEventListener('click', closeDropdownOnClickOutside);
    }
    closeCategoryDrawer();
}

// ===== FUNCIONES DE INTERFAZ Y DISPOSITIVO =====
function handleScreenChange() {
    var wasMobile = isMobile;
    var wasTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    isMobile = window.innerWidth <= 768;
    var isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    if (wasMobile !== isMobile || wasTablet !== isTablet) {
        updateMobileInterface();
        optimizeSearchForMobile();
        optimizeNavigationForMobile();
    }
}
function updateMobileInterface() {
    if (isMobile) {
        document.body.classList.add('mobile-view');
        optimizeCartForMobile();
        optimizeSearchForMobile();
    } else {
        document.body.classList.remove('mobile-view');
    }
}
function optimizeNavigationForMobile() {
    var menu = document.querySelector('.menu');
    if (isMobile && menu) {
        var menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(function(link) {
            link.style.touchAction = 'manipulation';
            link.style.userSelect = 'none';
            link.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(255,255,255,0.15)';
                this.style.transform = 'scale(0.98)';
            }, { passive: true });
            link.addEventListener('touchend', function() {
                var self = this;
                setTimeout(function() {
                    self.style.backgroundColor = '';
                    self.style.transform = '';
                }, 150);
            }, { passive: true });
        });
    }
}
function optimizeCartForMobile() { /* sólo CSS */ }
function optimizeSearchForMobile() {
    var searchInput = document.querySelector('.search-form input');
    var searchForm = document.querySelector('.search-form');
    if (searchInput && isMobile) {
        searchInput.setAttribute('autocomplete', 'off');
        searchInput.setAttribute('autocorrect', 'off');
        searchInput.setAttribute('spellcheck', 'false');
        searchInput.addEventListener('focus', function() {
            this.style.fontSize = '16px';
            if (searchForm) searchForm.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
            if (window.scrollY > 50) window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        searchInput.addEventListener('blur', function() {
            this.style.fontSize = '';
            if (searchForm) searchForm.style.boxShadow = '';
        });
    }
}

// ===== CARRITO =====
function addToCart(productId, quantity) {
  quantity = quantity || 1;
  var result = findProductById(productId);
  if (!result) return;

  var product = result.product;
  var thumb = (product.images && product.images.length ? product.images[0] : product.image);

  var existingItem = cart.find(function(item) { return item.id === productId; });
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: thumb,               // ← miniatura (ej. img/ARETE.jpeg)
      quantity: quantity,
      category: result.category
    });
  }
  updateCartCounter();
  showCartNotification(product.name, quantity);
}

function updateCartCounter() {
    var totalItems = cart.reduce(function(total, item) { return total + item.quantity; }, 0);
    var cartCounter = document.querySelector('.content-shopping-cart .number');
    if (cartCounter) cartCounter.textContent = '(' + totalItems + ')';
    var cartBtn = document.querySelector('button[aria-label="Ver carrito de compras"]');
    if (cartBtn) {
        if (totalItems > 0) cartBtn.setAttribute('data-count', totalItems);
        else cartBtn.removeAttribute('data-count');
    }
}
function showCartNotification(productName, quantity) {
    var notification = document.createElement('div');
    var mobileStyles = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--primary-color); color: white; padding: 2rem 1.5rem; border-radius: 1.2rem; z-index: 10000; font-size: 1.5rem; box-shadow: 0 8px 25px rgba(0,0,0,0.3); animation: mobileNotificationImproved 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); text-align: center; max-width: 85vw; width: auto; backdrop-filter: blur(10px);';
    var desktopStyles = 'position: fixed; top: 20px; right: 20px; background: var(--primary-color); color: white; padding: 1.5rem 2rem; border-radius: 0.8rem; z-index: 10000; font-size: 1.4rem; box-shadow: 0 8px 25px rgba(0,0,0,0.3); animation: slideInImproved 0.3s ease;';
    notification.style.cssText = isMobile ? mobileStyles : desktopStyles;
    notification.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;gap:1rem;margin-bottom:0.5rem;">' +
        '<i class="fa-solid fa-check-circle" style="font-size:2rem; color:#4CAF50;"></i>' +
        '<span style="font-weight:600;">¡Agregado al carrito!</span>' +
        '</div>' +
        '<div style="font-size:' + (isMobile ? '1.3rem' : '1.2rem') + ';opacity:.9;">' +
        '<strong>' + productName + '</strong><br>' + quantity + ' unidad' + (quantity > 1 ? 'es' : '') +
        '</div>';
    var style = document.createElement('style');
    style.textContent = '@keyframes slideInImproved{from{transform:translateX(100%) scale(.8);opacity:0}to{transform:translateX(0) scale(1);opacity:1}}@keyframes mobileNotificationImproved{0%{transform:translate(-50%,-50%) scale(.5);opacity:0;filter:blur(3px)}50%{transform:translate(-50%,-50%) scale(1.1);opacity:.8}100%{transform:translate(-50%,-50%) scale(1);opacity:1;filter:blur(0)}}';
    document.head.appendChild(style);
    document.body.appendChild(notification);
    var duration = isMobile ? 2500 : 3000;
    setTimeout(function() {
        notification.style.animation = isMobile ? 
            'mobileNotificationImproved .3s cubic-bezier(0.68,-0.55,0.265,1.55) reverse' :
            'slideInImproved .2s ease reverse';
        setTimeout(function() { if (notification.parentElement) notification.remove(); }, 300);
    }, duration);
}
function showCart() {
    if (!document.getElementById('cart-modal')) createCartModal();
    var cartModal = document.getElementById('cart-modal');
    var cartContainer = document.getElementById('cart-modal-products');
    var cartHTML = '';
    var total = 0;
    if (cart.length === 0) {
        cartHTML = '<div style="text-align:center;padding:3rem;font-size:1.6rem;color:#666;"><i class="fa-solid fa-basket-shopping" style="font-size:3rem;margin-bottom:1.5rem;color:#ddd;"></i><p>Tu carrito está vacío</p><p style="font-size:1.2rem;margin-top:.5rem;">¡Agrega algunos productos para comenzar!</p></div>';
    } else {
        cart.forEach(function(item) {
            var itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartHTML += '<div class="cart-item" style="display:flex;align-items:center;gap:1.5rem;padding:1.5rem;border:1px solid #eee;border-radius:.8rem;margin-bottom:1rem;background:#fafafa;">' +
                '<img src="' + item.image + '" alt="' + item.name + '" style="width:6rem;height:6rem;object-fit:cover;border-radius:.5rem;">' +
                '<div style="flex:1;">' +
                '<h4 style="font-size:1.4rem;margin-bottom:.3rem;color:var(--dark-color);">' + item.name + '</h4>' +
                '<p style="color:#666;font-size:1.1rem;text-transform:capitalize;margin-bottom:.5rem;">' + item.category + '</p>' +
                '<p style="font-size:1.5rem;font-weight:600;color:var(--primary-color);">' + item.price + ' Bs</p>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:.8rem;">' +
                '<button onclick="updateCartQuantity(' + item.id + ', ' + (item.quantity - 1) + ')" style="background:#f0f0f0;border:none;width:2.5rem;height:2.5rem;border-radius:50%;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">-</button>' +
                '<span style="font-size:1.4rem;font-weight:600;min-width:1.5rem;text-align:center;">' + item.quantity + '</span>' +
                '<button onclick="updateCartQuantity(' + item.id + ', ' + (item.quantity + 1) + ')" style="background:var(--primary-color);color:white;border:none;width:2.5rem;height:2.5rem;border-radius:50%;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">+</button>' +
                '</div>' +
                '<div style="text-align:right;min-width:6rem;">' +
                '<p style="font-size:1.5rem;font-weight:600;color:var(--primary-color);margin-bottom:.3rem;">' + itemTotal + ' Bs</p>' +
                '<button onclick="removeFromCart(' + item.id + ')" style="background:none;border:none;color:#999;cursor:pointer;font-size:1rem;touch-action:manipulation;"><i class="fa-solid fa-trash"></i></button>' +
                '</div>' +
                '</div>';
        });
    }
    cartContainer.innerHTML = cartHTML;
    var cartFooter = document.getElementById('cart-modal-footer');
    if (cart.length > 0) {
        cartFooter.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><h3 style="font-size:2rem;color:var(--dark-color);">Total: ' + total + ' Bs</h3><button class="btn-primary" onclick="checkout()" style="font-size:1.4rem;padding:1.2rem 2.5rem;"><i class="fa-brands fa-whatsapp" style="margin-right:.5rem;"></i>Realizar Pedido</button></div>';
    } else {
        cartFooter.innerHTML = '<button class="btn-primary" onclick="closeCart()" style="width:100%;font-size:1.4rem;padding:1.2rem;">Seguir Comprando</button>';
    }
    cartModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function createCartModal() {
    var cartModal = document.createElement('div');
    cartModal.id = 'cart-modal';
    var modalStyles = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;z-index:10000;padding:' + (isMobile ? '0.8rem' : '2rem') + ';backdrop-filter:blur(3px);';
    cartModal.style.cssText = modalStyles;
    var maxWidth = isMobile ? '96%' : '70rem';
    var maxHeight = isMobile ? '95vh' : '80vh';
    var borderRadius = isMobile ? '1.2rem' : '1.5rem';
    cartModal.innerHTML = '<div style="background:white;border-radius:' + borderRadius + ';width:100%;max-width:' + maxWidth + ';max-height:' + maxHeight + ';display:flex;flex-direction:column;box-shadow:0 20px 40px rgba(0,0,0,.3);animation:modalSlideIn .3s ease;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:' + (isMobile ? '1.2rem 1.5rem' : '2rem 2.5rem') + ';border-bottom:1px solid #eee;background:#fafafa;border-radius:' + borderRadius + ' ' + borderRadius + ' 0 0;">' +
        '<h2 style="font-size:' + (isMobile ? '1.8rem' : '2.2rem') + ';color:var(--dark-color);margin:0;display:flex;align-items:center;gap:1rem;"><i class="fa-solid fa-basket-shopping" style="color:var(--primary-color);"></i>' + (isMobile ? 'Mi Carrito' : 'Carrito de Compras') + '</h2>' +
        '<button onclick="closeCart()" style="background:#f0f0f0;border:none;font-size:' + (isMobile ? '1.8rem' : '2.2rem') + ';color:#666;cursor:pointer;width:' + (isMobile ? '3.5rem' : '4rem') + ';height:' + (isMobile ? '3.5rem' : '4rem') + ';border-radius:50%;display:flex;align-items:center;justify-content:center;touch-action:manipulation;transition:all .2s ease;" onmouseover="this.style.backgroundColor=\'#e0e0e0\'" onmouseout="this.style.backgroundColor=\'#f0f0f0\'"><i class="fa-solid fa-times"></i></button>' +
        '</div>' +
        '<div id="cart-modal-products" style="flex:1;padding:' + (isMobile ? '1rem 1.2rem' : '1.5rem 2.5rem') + ';overflow-y:auto;max-height:' + (isMobile ? '60vh' : '50vh') + ';"></div>' +
        '<div id="cart-modal-footer" style="padding:' + (isMobile ? '1.2rem 1.5rem' : '2rem 2.5rem') + ';border-top:1px solid #eee;background:#f9f9f9;border-radius:0 0 ' + borderRadius + ' ' + borderRadius + ';"></div>' +
        '</div>';
    var style = document.createElement('style');
    style.textContent = '@keyframes modalSlideIn{from{opacity:0;transform:scale(.9) translateY(-20px)}to{opacity:1;transform:scale(1) translateY(0)}}';
    document.head.appendChild(style);
    cartModal.addEventListener('touchstart', function(e) { if (e.target === cartModal) closeCart(); });
    cartModal.addEventListener('click', function(e) { if (e.target === cartModal) closeCart(); });
    document.body.appendChild(cartModal);
}
function closeCart() {
    var cartModal = document.getElementById('cart-modal');
    if (cartModal) cartModal.remove();
    document.body.style.overflow = '';
}
function removeFromCart(productId) {
    cart = cart.filter(function(item) { return item.id !== productId; });
    updateCartCounter();
    if (document.getElementById('cart-modal') && document.getElementById('cart-modal').style.display !== 'none') showCart();
}
function updateCartQuantity(productId, quantity) {
    var item = cart.find(function(item) { return item.id === productId; });
    if (item) {
        if (quantity <= 0) removeFromCart(productId);
        else {
            item.quantity = quantity;
            updateCartCounter();
            if (document.getElementById('cart-modal') && document.getElementById('cart-modal').style.display !== 'none') showCart();
        }
    }
}
function checkout() {
  if (cart.length === 0) {
    isMobile ? showMobileAlert('Tu carrito está vacío') : alert('Tu carrito está vacío');
    return;
  }

  // Armar el mensaje
  var total = cart.reduce(function(sum, item){ return sum + (item.price * item.quantity); }, 0);
  var orderLines = cart.map(function(item){
    return '• ' + item.name + ' x' + item.quantity + ' = ' + (item.price * item.quantity) + ' Bs';
  }).join('\n');

  var orderSummary =
    '🛍️ *PEDIDO FRAGOLE* 🛍️\n\n' +
    '📋 *RESUMEN:*\n' + orderLines + '\n\n' +
    '💰 *TOTAL: ' + total + ' Bs*\n\n' +
    '¡Gracias por elegir FRAGOLE! 💎';

  var phoneNumber = '59163318978'; // BO: 591 + número sin signos
  var encodedMsg  = encodeURIComponent(orderSummary);

  // URL principal (más compatible) + fallback
  var urlAPI = 'https://api.whatsapp.com/send?phone=' + phoneNumber + '&text=' + encodedMsg;
  var urlWA  = 'https://wa.me/' + phoneNumber + '?text=' + encodedMsg;

  // Intento de apertura robusto
  var opened = false;
  function openNewTab(u){
    var w = window.open(u, '_blank', 'noopener');
    return !!(w && !w.closed);
  }
  

  if (isMobile) {
    // En móvil: ir directo (mejor comportamiento con WebViews)
    try { window.location.href = urlAPI; opened = true; } catch (e) {}
    if (!opened) { window.location.href = urlWA; }
  } else {
    // En desktop: intenta nueva pestaña; si la bloquean, misma pestaña
    opened = openNewTab(urlAPI);
    if (!opened) opened = openNewTab(urlWA);
    if (!opened) window.location.href = urlAPI;
  }

  // Cerrar el modal un poquito después para no interferir con la navegación
  setTimeout(function(){ closeCart(); }, 500);
}

function showMobileAlert(message) {
    var alert = document.createElement('div');
    alert.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:2rem;border-radius:1rem;box-shadow:0 10px 30px rgba(0,0,0,.3);z-index:10001;font-size:1.6rem;text-align:center;max-width:90vw;animation:mobileAlert .3s ease;';
    alert.innerHTML = '<p style="margin-bottom:2rem;color:var(--dark-color);">' + message + '</p><button onclick="this.parentElement.remove()" style="background:var(--primary-color);color:white;border:none;padding:1rem 2rem;border-radius:.5rem;font-size:1.4rem;cursor:pointer;touch-action:manipulation;">OK</button>';
    var style = document.createElement('style');
    style.textContent = '@keyframes mobileAlert{from{transform:translate(-50%,-50%) scale(.8);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}';
    document.head.appendChild(style);
    document.body.appendChild(alert);
    setTimeout(function() { if (alert.parentElement) alert.remove(); }, 3000);
}

// ===== PRODUCTOS =====
function generateProductHTML(product, showAddToCart) {
  showAddToCart = showAddToCart !== false;

  var imgSrc = (product.images && product.images.length ? product.images[0] : product.image);

  var discountHTML = product.discount ? '<span class="discount">-' + product.discount + '%</span>' : '';
  var originalPriceHTML = product.originalPrice ? '<span>' + product.originalPrice + ' Bs</span>' : '';
  var addToCartHTML = showAddToCart
    ? '<span class="add-cart" onclick="event.stopPropagation(); addToCart(' + product.id + ', 1)"><i class="fa-solid fa-basket-shopping"></i></span>'
    : '';

  return '<div class="card-product" onclick="showProduct(' + product.id + ')">' +
    '<div class="container-img">' +
      '<img src="' + imgSrc + '" alt="' + product.name + '" loading="lazy" decoding="async" />' +
      discountHTML +
    '</div>' +
    '<div class="content-card-product">' +
      '<h3>' + product.name + '</h3>' +
      '<p class="price">' + product.price + ' Bs ' + originalPriceHTML + '</p>' +
      addToCartHTML +
    '</div>' +
  '</div>';
}

function findProductById(id) {
    for (var category in products) {
        var product = products[category].find(function(p) { return p.id === id; });
        if (product) return { product: product, category: category };
    }
    return null;
}

// ===== VISTAS / NAVEGACIÓN =====
function hideAllViews() {
    var ids = ['home-view','category-view','product-view','about-view'];
    ids.forEach(function(id){
        var el = document.getElementById(id);
        if (!el) return;
        if (!el.classList.contains('hidden')) el.classList.add('hidden');
    });
}

function ensureAboutView() {
    var existing = document.getElementById('about-view');
    if (existing) return existing;
    var about = document.createElement('section');
    about.id = 'about-view';
    about.className = 'hidden';
    about.innerHTML = `
        <div class="container" style="max-width:1100px;margin:0 auto;padding:2rem;">
            <nav aria-label="breadcrumb" style="color:#666;margin-bottom:1rem;">Inicio / Sobre Nosotros</nav>
            <h1 style="font-size:2.2rem;margin-bottom:1rem;color:var(--dark-color,#222);">Sobre Nosotros</h1>
            <p style="line-height:1.75;color:#444;margin-bottom:1rem;">
                En <strong>FRAGOLE</strong> creemos que las joyas cuentan historias.
                Trabajamos con piezas de acero inoxidable chapadas en oro, pensadas para el uso diario
                y para esos momentos especiales. Nuestro objetivo es ofrecer calidad, estilo y un servicio cercano.
            </p>
            <p style="line-height:1.75;color:#444;margin-bottom:1rem;">
                ¿Tienes dudas o buscas algo específico? ¡Escríbenos! Estaremos encantados de ayudarte a encontrar tu próxima favorita ✨
            </p>
        </div>
    `;
    var home = document.getElementById('home-view');
    if (home && home.parentNode) home.parentNode.insertBefore(about, home.nextSibling);
    else document.body.appendChild(about);
    return about;
}

// Mostrar inicio
function showHome() {
    closeCategoriesMenu();
    closeCategoryDrawer();
    hideAllViews();
    var el = document.getElementById('home-view');
    if (el) el.classList.remove('hidden');

    var existingModal = document.getElementById('cart-modal');
    if (existingModal) existingModal.remove();
    document.body.style.overflow = '';
    loadFeaturedProducts();
    loadOffersProducts();
}

// Cargar productos destacados
function loadFeaturedProducts() {
    var featuredContainer = document.getElementById('featured-products');
    if (!featuredContainer) return;
    var featuredHTML = '';
    var featured = [
        products.aretes[0],
        products.pulseras[0],
        products.collares[0],
        products.argollas[0]
    ];
    featured.forEach(function(product) {
        if (product) featuredHTML += generateProductHTML(product);
    });
    featuredContainer.innerHTML = featuredHTML;
}

// Cargar productos en oferta
function loadOffersProducts() {
    var offersContainer = document.getElementById('offers-products');
    if (!offersContainer) return;
    var offersHTML = '';
    var offersProducts = [
        Object.assign({}, products.aretes[1], { discount: 5 }),
        Object.assign({}, products.argollas[0], { discount: 10 }),
        Object.assign({}, products.pulseras[1], { discount: 8 }),
        Object.assign({}, products.collares[1], { discount: 10 })
    ];
    offersProducts.forEach(function(product) {
        if (product) offersHTML += generateProductHTML(product);
    });
    offersContainer.innerHTML = offersHTML;
}

// Mostrar categoría
function showCategory(category) {
    if (category === 'arete') category = 'aretes';
    closeCategoriesMenu();
    closeCategoryDrawer();
    hideAllViews();

    currentCategory = category;
    var catView = document.getElementById('category-view');
    if (catView) catView.classList.remove('hidden');

    var existingModal = document.getElementById('cart-modal');
    if (existingModal) existingModal.remove();
    document.body.style.overflow = '';

    var nameCap = category.charAt(0).toUpperCase() + category.slice(1);
    var bc = document.getElementById('category-breadcrumb');
    var title = document.getElementById('category-title');
    if (bc) bc.textContent = nameCap;
    if (title) title.textContent = nameCap;
    
    var categoryContainer = document.getElementById('category-products');
    var categoryHTML = '';
    if (products[category]) {
        products[category].forEach(function(product) {
            categoryHTML += generateProductHTML(product);
        });
    }
    if (categoryContainer) categoryContainer.innerHTML = categoryHTML;
}

// Mostrar todos los productos
function showAllProducts() {
    closeCategoriesMenu();
    closeCategoryDrawer();
    hideAllViews();

    currentCategory = 'todos';
    var catView = document.getElementById('category-view');
    if (catView) catView.classList.remove('hidden');

    var existingModal = document.getElementById('cart-modal');
    if (existingModal) existingModal.remove();
    document.body.style.overflow = '';

    var bc = document.getElementById('category-breadcrumb');
    var title = document.getElementById('category-title');
    if (bc) bc.textContent = 'Todos los Productos';
    if (title) title.textContent = 'Todos los Productos';
    
    var categoryContainer = document.getElementById('category-products');
    var allProductsHTML = '';
    Object.keys(products).forEach(function(category) {
        products[category].forEach(function(product) {
            allProductsHTML += generateProductHTML(product);
        });
    });
    if (categoryContainer) categoryContainer.innerHTML = allProductsHTML;
}

// Mostrar "Sobre Nosotros"
function showAbout() {
    closeCategoriesMenu();
    closeCategoryDrawer();
    hideAllViews();

    var about = ensureAboutView();
    about.classList.remove('hidden');

    var existingModal = document.getElementById('cart-modal');
    if (existingModal) existingModal.remove();
    document.body.style.overflow = '';
}

// Mostrar producto individual
function showProduct(productId) {
    var result = findProductById(productId);
    if (!result) return;
    
    var product = result.product;
    var category = result.category;
    currentProduct = { product: product, category: category };
    
    hideAllViews();
    var pv = document.getElementById('product-view');
    if (pv) pv.classList.remove('hidden');
    
    var pcl = document.getElementById('product-category-link');
    if (pcl) {
        pcl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        pcl.onclick = function() { showCategory(category); };
    }
    var pb = document.getElementById('product-breadcrumb');
    if (pb) pb.textContent = product.name;
    
    var imgBox = document.getElementById('product-main-image');
//aqui cambiamos linea para hace hacer el carusel
    if (imgBox) {
    currentImageIndex = 0;
    var images = product.images || [product.image];
    imgBox.innerHTML = createImageCarousel(images);
    addTouchSupport();
}

    var title = document.getElementById('product-title');
    if (title) title.textContent = product.name;
    var stars = document.getElementById('product-stars');
    if (stars) stars.innerHTML = '';
    
    var originalPriceHTML = product.originalPrice ? ' <span>' + product.originalPrice + ' Bs</span>' : '';
    var priceBox = document.getElementById('product-price');
    if (priceBox) priceBox.innerHTML = product.price + ' Bs' + originalPriceHTML;
    var desc = document.getElementById('product-description');
    if (desc) desc.textContent = product.description;
    
    var productInfoDiv = document.querySelector('#product-view .product-info');
    if (!productInfoDiv) return;
    var existingButtonsDiv = productInfoDiv.querySelector('div:last-child');
    
    var newButtonsDiv = document.createElement('div');
    newButtonsDiv.innerHTML =
        '<div style="display:flex;align-items:center;gap:2rem;margin-bottom:2rem;">' +
            '<label for="quantity-selector" style="font-size:1.6rem;font-weight:600;color:var(--dark-color);">Cantidad:</label>' +
            '<div style="display:flex;align-items:center;gap:1rem;background:#f5f5f5;border-radius:.5rem;padding:.5rem;">' +
                '<button type="button" onclick="changeQuantity(-1)" style="background:none;border:none;font-size:2rem;color:var(--primary-color);cursor:pointer;width:3rem;height:3rem;display:flex;align-items:center;justify-content:center;touch-action:manipulation;">-</button>' +
                '<input type="number" id="quantity-selector" value="1" min="1" max="10" style="width:6rem;text-align:center;border:none;background:none;font-size:1.6rem;font-weight:600;color:var(--dark-color);" onchange="validateQuantity()">' +
                '<button type="button" onclick="changeQuantity(1)" style="background:none;border:none;font-size:2rem;color:var(--primary-color);cursor:pointer;width:3rem;height:3rem;display:flex;align-items:center;justify-content:center;touch-action:manipulation;">+</button>' +
            '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:1rem;">' +
            '<button class="btn-primary" onclick="addProductToCart()" style="font-size:1.6rem;padding:1.5rem 3rem;touch-action:manipulation;"><i class="fa-solid fa-basket-shopping" style="margin-right:.5rem;"></i>Agregar al Carrito</button>' +
            '<button class="btn-secondary" onclick="goBackToCategory()" style="touch-action:manipulation;">Volver</button>' +
        '</div>';
    
    if (existingButtonsDiv) productInfoDiv.replaceChild(newButtonsDiv, existingButtonsDiv);
    else productInfoDiv.appendChild(newButtonsDiv);
}