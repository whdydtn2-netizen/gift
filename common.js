const GIFTALK_KEY = 'giftalk_products';
const CART_KEY = 'giftalk_cart';
const CHECKOUT_DRAFT_KEY = 'giftalk_checkout_draft';

const CATEGORY_LABELS = {
  wedding: '결혼·돌잔치답례',
  graduation: '졸업선물',
  holiday: '명절선물',
  gathering: '모임선물',
  celebration: '축하선물'
};

function getProducts() {
  try { return JSON.parse(localStorage.getItem(GIFTALK_KEY) || '[]'); }
  catch(e) { return []; }
}

function saveProducts(products) {
  localStorage.setItem(GIFTALK_KEY, JSON.stringify(products));
}

function addProduct(product) {
  const products = getProducts();
  product.id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
  products.unshift(product);
  saveProducts(products);
  return product;
}

function deleteProduct(id) {
  saveProducts(getProducts().filter(p => p.id !== id));
}

function updateProduct(id, data) {
  saveProducts(getProducts().map(p => p.id === id ? Object.assign({}, p, data) : p));
}

function getProductCategories(p) {
  if (Array.isArray(p.categories) && p.categories.length) return p.categories;
  if (p.category) return [p.category];
  return [];
}

function getProductsByCategory(category) {
  const all = getProducts();
  if (!category || category === 'all') return all;
  return all.filter(function(p) {
    return getProductCategories(p).indexOf(category) !== -1;
  });
}

// ===== Cart =====
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch(e) { return []; }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  refreshCartBadge();
}

function addToCart(item) {
  const items = getCart();
  item.id = Date.now().toString() + Math.random().toString(36).slice(2, 5);
  items.push(item);
  saveCart(items);
  return item;
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function updateCartItemQty(id, qty) {
  saveCart(getCart().map(i => i.id === id ? Object.assign({}, i, { qty: qty }) : i));
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
}

function getUnitPriceForQty(priceTiers, qty) {
  const tiers = (priceTiers || []).slice().sort((a, b) => a.min - b.min);
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    if (qty >= Number(t.min) && (!t.max || qty <= Number(t.max))) return Number(t.price);
  }
  return null;
}

// ===== Checkout draft (address/contact/request typed while shopping) =====
function saveCheckoutDraft(draft) {
  localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

function getCheckoutDraft() {
  try { return JSON.parse(localStorage.getItem(CHECKOUT_DRAFT_KEY) || '{}'); }
  catch(e) { return {}; }
}

function clearCheckoutDraft() {
  localStorage.removeItem(CHECKOUT_DRAFT_KEY);
}

// ===== Cart widget (header icon + badge) =====
function refreshCartBadge() {
  var badge = document.getElementById('cart-badge');
  if (!badge) return;
  var count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

(function() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.indexOf('admin.html') !== -1) return;
  function injectCartWidget() {
    var ctaBtn = document.querySelector('.cta-btn');
    if (!ctaBtn || document.getElementById('cart-widget')) return;
    var link = document.createElement('a');
    link.href = 'cart.html';
    link.id = 'cart-widget';
    link.title = '장바구니';
    link.style.cssText = 'position:relative;display:inline-flex;align-items:center;justify-content:center;' +
      'width:38px;height:38px;border-radius:50%;background:var(--pink-50);color:var(--pink-600);' +
      'margin-right:8px;flex-shrink:0;';
    link.innerHTML = '<i class="ti ti-shopping-cart" style="font-size:18px;"></i>' +
      '<span id="cart-badge" style="display:none;position:absolute;top:-4px;right:-4px;' +
      'background:var(--pink-400);color:#fff;font-size:10px;font-weight:700;min-width:16px;height:16px;' +
      'border-radius:8px;align-items:center;justify-content:center;padding:0 3px;"></span>';
    ctaBtn.parentNode.insertBefore(link, ctaBtn);
    refreshCartBadge();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCartWidget);
  } else {
    injectCartWidget();
  }
})();

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== Admin Login =====
var ADMIN_ID = 'jsmart01';
var ADMIN_PW = 'ks-10293035';

function initAdminAccess() {
  var s = document.createElement('style');
  s.textContent =
    '#adm-overlay{display:none;position:fixed;inset:0;background:rgba(75,21,40,0.55);' +
    'backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;}' +
    '#adm-overlay.open{display:flex;}' +
    '#adm-box{background:#fff;border-radius:24px;padding:40px 36px;width:300px;text-align:center;' +
    'box-shadow:0 24px 64px rgba(0,0,0,0.2);}' +
    '#adm-box .adm-icon{font-size:40px;color:#D4537E;margin-bottom:12px;}' +
    '#adm-box h3{font-size:20px;font-weight:700;color:#4B1528;margin-bottom:6px;}' +
    '#adm-box p{font-size:13px;color:#993556;margin-bottom:24px;}' +
    '#adm-pw{width:100%;padding:11px 14px;border:1.5px solid #F4C0D1;border-radius:10px;' +
    'font-size:15px;outline:none;text-align:center;font-family:inherit;margin-bottom:12px;letter-spacing:2px;}' +
    '#adm-pw:focus{border-color:#D4537E;}' +
    '#adm-go{width:100%;background:#D4537E;color:#fff;border:none;padding:12px;' +
    'border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:8px;}' +
    '#adm-go:hover{background:#993556;}' +
    '#adm-cancel{width:100%;background:none;border:1.5px solid #F4C0D1;color:#993556;' +
    'padding:11px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;}' +
    '#adm-cancel:hover{background:#FBEAF0;}' +
    '#adm-err{color:#D4537E;font-size:13px;margin-top:10px;min-height:18px;}';
  document.head.appendChild(s);

  var overlay = document.createElement('div');
  overlay.id = 'adm-overlay';
  overlay.innerHTML =
    '<div id="adm-box">' +
      '<div class="adm-icon"><i class="ti ti-lock"></i></div>' +
      '<h3>관리자 로그인</h3>' +
      '<p>선물톡 관리자 전용 페이지입니다</p>' +
      '<input type="text" id="adm-id" placeholder="아이디 입력" ' +
        'style="margin-bottom:8px;" onkeydown="if(event.key===\'Enter\')doAdminLogin()">' +
      '<input type="password" id="adm-pw" placeholder="비밀번호 입력" ' +
        'onkeydown="if(event.key===\'Enter\')doAdminLogin()">' +
      '<button id="adm-go" onclick="doAdminLogin()">로그인</button>' +
      '<button id="adm-cancel" onclick="closeAdminLogin()">취소</button>' +
      '<div id="adm-err"></div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeAdminLogin(); });

  var footer = document.querySelector('footer');
  if (footer) {
    footer.insertAdjacentHTML('beforeend',
      '&nbsp;&nbsp;<a href="#" onclick="openAdminLogin();return false;" ' +
      'style="color:var(--pink-400);opacity:0.6;font-size:12px;text-decoration:none;">관리자</a>'
    );
  }
}

function openAdminLogin() {
  document.getElementById('adm-overlay').classList.add('open');
  document.getElementById('adm-err').textContent = '';
  document.getElementById('adm-pw').value = '';
  setTimeout(function() { document.getElementById('adm-pw').focus(); }, 80);
}

function closeAdminLogin() {
  document.getElementById('adm-overlay').classList.remove('open');
}

function doAdminLogin() {
  var id = document.getElementById('adm-id').value.trim();
  var pw = document.getElementById('adm-pw').value;
  if (id === ADMIN_ID && pw === ADMIN_PW) {
    sessionStorage.setItem('giftalk_admin', '1');
    window.location.href = 'admin.html';
  } else {
    document.getElementById('adm-err').textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
    document.getElementById('adm-pw').value = '';
    document.getElementById('adm-pw').focus();
  }
}

(function() {
  if (window.location.pathname.indexOf('admin.html') !== -1) return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminAccess);
  } else {
    initAdminAccess();
  }
})();

// ===== Product Helpers =====
function getProductById(id) {
  return getProducts().find(function(p) { return p.id === id; }) || null;
}

function getStartingPrice(p) {
  if (p.priceTiers && p.priceTiers.length) {
    var sorted = p.priceTiers.slice().sort(function(a, b) { return a.min - b.min; });
    return Number(sorted[0].price);
  }
  return p.price ? Number(p.price) : 0;
}

function getMinQty(p) {
  if (p.priceTiers && p.priceTiers.length) {
    return Math.min.apply(null, p.priceTiers.map(function(t) { return Number(t.min); }));
  }
  return 1;
}

// ===== Admin Indicator (shown when logged in) =====
(function() {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.indexOf('admin.html') !== -1) return;
  if (!sessionStorage.getItem('giftalk_admin')) return;
  function showAdminBar() {
    var bar = document.createElement('div');
    bar.style.cssText = 'background:var(--amber-100);color:var(--amber-800);text-align:center;' +
      'padding:6px 16px;font-size:12px;font-weight:600;position:relative;z-index:200;';
    bar.innerHTML = '관리자 모드 &nbsp;·&nbsp; ' +
      '<a href="admin.html" style="color:var(--amber-800);text-decoration:underline;">관리자 페이지로</a>' +
      ' &nbsp;·&nbsp; ' +
      '<a href="#" onclick="sessionStorage.removeItem(\'giftalk_admin\');location.reload();return false;" ' +
      'style="color:var(--amber-800);text-decoration:underline;">로그아웃</a>';
    document.body.insertBefore(bar, document.body.firstChild);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAdminBar);
  } else {
    showAdminBar();
  }
})();

// ===== Product Grid =====
function renderProductGrid(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
        '<i class="ti ti-shopping-bag"></i>' +
        '<p>등록된 상품이 없습니다.</p>' +
        '<small>관리자 페이지에서 상품을 추가해보세요.</small>' +
      '</div>';
    return;
  }

  container.innerHTML = products.map(function(p) {
    var imgHtml = p.image
      ? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" ' +
        'onerror="this.parentNode.innerHTML=\'<div class=\\\'img-placeholder\\\'><i class=\\\'ti ti-photo\\\'></i></div>\'">'
      : '<div class="img-placeholder"><i class="ti ti-photo"></i></div>';
    var startPrice = getStartingPrice(p);

    return '<div class="product-card" onclick="window.location.href=\'product.html?id=' + p.id + '\'">' +
      '<div class="product-img-wrap">' + imgHtml + '</div>' +
      '<div class="product-info">' +
        getProductCategories(p).map(function(c) { return '<span class="product-category-badge">' + (CATEGORY_LABELS[c] || c) + '</span>'; }).join(' ') +
        '<div class="product-name">' + escapeHtml(p.name) + '</div>' +
        '<div class="product-price">' + (startPrice ? startPrice.toLocaleString() + '원~' : '가격 문의') + '</div>' +
        (p.description ? '<div class="product-desc">' + escapeHtml(p.description) + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}
