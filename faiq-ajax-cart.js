window.faiqDirectAddToCart = function(e, button) {
  e.preventDefault();
  e.stopPropagation();
  
  const form = button.closest('form');
  if (!form) return;

  const originalText = button.innerText;
  button.innerText = 'ADDING...';
  button.disabled = true;

  const formData = new FormData(form);

  fetch('/cart/add.js', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(item => {
    button.innerText = 'ADDED!';
    openCartDrawer();
    setTimeout(() => {
      button.innerText = originalText;
      button.disabled = false;
    }, 2000);
  })
  .catch(error => {
    console.error(error);
    button.innerText = originalText;
    button.disabled = false;
  });
};
function openCartDrawer() {
  const drawer = document.getElementById('FaiqCartDrawer');
  if (drawer) {
    drawer.classList.add('is-active');
    updateCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('FaiqCartDrawer');
  if (drawer) {
    drawer.classList.remove('is-active');
  }
}

function updateCartQty(line, qty) {
  const formData = { line: line, quantity: qty };
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(() => updateCartDrawer())
  .catch(error => console.error(error));
}

function updateCartDrawer() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const drawerItemsContainer = document.getElementById('FaiqDrawerItems');
      const drawerTotalPrice = document.getElementById('FaiqDrawerTotalPrice');
      
      const formattedTotal = (cart.total_price / 100).toFixed(2);
      drawerTotalPrice.innerText = formattedTotal + ' ' + Shopify.currency.active;

      if (cart.item_count === 0) {
        drawerItemsContainer.innerHTML = '<p class="empty-cart-msg">Səbətiniz hazırda boşdur.</p>';
        return;
      }

      let cartHtml = '';
      cart.items.forEach((item, index) => {
        const itemPrice = (item.final_line_price / 100).toFixed(2);
        const lineIndex = index + 1;
        
        cartHtml += `
          <div class="faiq-drawer-item">
            <img src="${item.image ? item.image : 'https://shopify.com'}" alt="${item.product_title}">
            <div class="faiq-item-details">
              <h4>${item.product_title}</h4>
              <p class="faiq-item-variant">${item.variant_title ? item.variant_title : ''}</p>
              <div class="faiq-qty-controls">
                <button onclick="updateCartQty(${lineIndex}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQty(${lineIndex}, ${item.quantity + 1})">+</button>
              </div>
              <span class="faiq-item-price">${itemPrice} ${Shopify.currency.active}</span>
              <button class="faiq-item-remove" onclick="updateCartQty(${lineIndex}, 0)">Remove</button>
            </div>
          </div>
        `;
      });
      
      drawerItemsContainer.innerHTML = cartHtml;
    })
    .catch(error => console.error(error));
}

document.addEventListener('DOMContentLoaded', function() {
  const addToCartForms = document.querySelectorAll('form[action$="/cart/add"]');
  addToCartForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Add to cart';
      if (submitBtn) {
        submitBtn.innerText = 'ADDING...';
        submitBtn.disabled = true;
      }

      const formData = new FormData(form);
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(item => {
        if (submitBtn) submitBtn.innerText = 'ADDED!';
        openCartDrawer();
        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
          }
        }, 2000);
      })
      .catch(error => {
        console.error(error);
        if (submitBtn) {
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
        }
      });
    });
  });
});