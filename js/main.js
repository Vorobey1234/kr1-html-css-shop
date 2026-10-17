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
