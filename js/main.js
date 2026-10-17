const pageParams = new URLSearchParams(window.location.search);
const requestedProduct = pageParams.get('product');
const productSelect = document.getElementById('order-product');
if (productSelect && ['1', '2', '3'].includes(requestedProduct)) {
  productSelect.selectedIndex = Number(requestedProduct);
  document.getElementById('order-topic').value = 'product';
}

const orderDialog = document.getElementById('order-dialog');
const closeDialogButton = document.getElementById('close-order-dialog');
const selectedProductInput = document.getElementById('selected-product');

if (orderDialog && selectedProductInput) {
  document.querySelectorAll('.product-card__button[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedProductInput.value = button.dataset.product;
      orderDialog.showModal();
    });
  });

  const contactDialogButton = document.getElementById('open-contact-dialog');
  if (contactDialogButton) {
    contactDialogButton.addEventListener('click', () => {
      selectedProductInput.value = '';
      orderDialog.showModal();
    });
  }

  if (closeDialogButton) {
    closeDialogButton.addEventListener('click', () => orderDialog.close());
  }
}

const orderForm = document.getElementById('order-form');
const successMessage = document.getElementById('success-message');

if (orderForm && successMessage) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formElements = Array.from(orderForm.elements);
    formElements.forEach((element) => {
      if (element.willValidate) element.removeAttribute('aria-invalid');
    });

    if (!orderForm.checkValidity()) {
      formElements.forEach((element) => {
        if (element.willValidate && !element.checkValidity()) {
          element.setAttribute('aria-invalid', 'true');
        }
      });
      orderForm.reportValidity();
      return;
    }

    successMessage.hidden = false;
    orderForm.reset();
    if (orderDialog?.open) orderDialog.close();
  });
}

const filtersForm = document.querySelector('.filters-form');
if (filtersForm) {
  const priceFrom = filtersForm.elements.namedItem('price-from');
  const priceTo = filtersForm.elements.namedItem('price-to');
  const sortSelect = filtersForm.elements.namedItem('sort');
  const categoryInputs = Array.from(filtersForm.querySelectorAll('[name="category"]'));
  const categories = pageParams.getAll('category').filter((value) =>
    ['all', 'popular', 'new'].includes(value));
  const showAll = categories.length === 0 || categories.includes('all');

  categoryInputs.forEach((input) => {
    input.checked = showAll ? input.value === 'all' : categories.includes(input.value);
    input.addEventListener('change', () => {
      if (input.value === 'all' && input.checked) {
        categoryInputs.forEach((other) => { other.checked = other === input; });
      } else if (input.value !== 'all' && input.checked) {
        categoryInputs.find((other) => other.value === 'all').checked = false;
      }
      if (!categoryInputs.some((other) => other.checked)) {
        categoryInputs.find((other) => other.value === 'all').checked = true;
      }
    });
  });

  [priceFrom, priceTo].forEach((input) => {
    const value = pageParams.get(input.name);
    if (value !== null && value.trim() !== '' &&
        Number.isFinite(Number(value)) && Number(value) >= 0) {
      input.value = value;
    }
  });

  const validatePriceRange = () => {
    const reversed = priceFrom.value !== '' && priceTo.value !== '' &&
      priceFrom.valueAsNumber > priceTo.valueAsNumber;
    priceTo.setCustomValidity(reversed ? 'Цена «До» должна быть не меньше цены «От».' : '');
  };
  priceFrom.addEventListener('input', validatePriceRange);
  priceTo.addEventListener('input', validatePriceRange);
  validatePriceRange();

  const sort = pageParams.get('sort');
  sortSelect.value = ['price-asc', 'price-desc'].includes(sort) ? sort : 'default';
  const minPrice = priceFrom.value === '' ? 0 : priceFrom.valueAsNumber;
  const maxPrice = priceTo.value === '' ? Infinity : priceTo.valueAsNumber;
  const grid = document.querySelector('.catalog-products .products-grid');
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  if (sortSelect.value !== 'default') {
    const direction = sortSelect.value === 'price-asc' ? 1 : -1;
    cards.sort((a, b) => direction * (Number(a.dataset.price) - Number(b.dataset.price)));
  }

  let visibleCount = 0;
  cards.forEach((card) => {
    const price = Number(card.dataset.price);
    const categoryMatches = showAll || categories.includes(card.dataset.category);
    card.hidden = !(categoryMatches && price >= minPrice && price <= maxPrice);
    if (!card.hidden) visibleCount += 1;
    grid.append(card);
  });
  document.querySelector('.catalog-products__empty').hidden = visibleCount !== 0;
}
