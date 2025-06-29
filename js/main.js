// Initialize products array from localStorage or create empty array
let products = JSON.parse(localStorage.getItem("products")) || [];
let currentEditingIndex = null;
let notificationCount = 0;

// DOM Elements
const form = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productQuantity = document.getElementById("productQuantity");
const productTable = document.getElementById("productTable");
const searchInput = document.getElementById("searchInput");
const addProductBtn = document.getElementById("addProductBtn");

// Modal Elements
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");
const editProductName = document.getElementById("editProductName");
const editProductCategory = document.getElementById("editProductCategory");
const editProductPrice = document.getElementById("editProductPrice");
const editProductQuantity = document.getElementById("editProductQuantity");
const closeBtn = document.querySelector(".close");

// Initialize modal
editModal.style.display = "none";

// Notification Elements
const notificationBtn = document.getElementById('notificationBtn');
const notifications = document.getElementById('notifications');
const notificationsList = document.getElementById('notificationsList');

// Add product to localStorage
function saveProduct(product) {
  // Add product to array
  products.push(product);

  // Save to localStorage
  localStorage.setItem("products", JSON.stringify(products));

  // Update table immediately
  displayProducts();

  // Show success notification
  addNotification("تم إضافة المنتج بنجاح", 'success');

  // Reset form
  form.reset();
}

// Update product in localStorage
function updateProduct(index, updatedProduct) {
  products[index] = updatedProduct;
  localStorage.setItem("products", JSON.stringify(products));
  displayProducts();
  addNotification("تم تحديث المنتج بنجاح", 'success');
  closeModal();
}

// Delete product from localStorage
function deleteProduct(index) {
  if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts();
    addNotification("تم حذف المنتج بنجاح", 'success');
  }
}

// Display all products in table
function displayProducts() {
  // Clear existing table
  productTable.innerHTML = "";

  // Add table headers
  const tableHeaders = ["الاسم", "الفئة", "السعر", "الكمية", "الإجراءات"];
  const headerRow = document.createElement("tr");
  tableHeaders.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headerRow.appendChild(th);
  });
  productTable.appendChild(headerRow);

  // Get filtered products
  const filteredProducts = searchInput.value
    ? products.filter(
        (product) =>
          product.name.includes(searchInput.value) ||
          product.category.includes(searchInput.value)
      )
    : products;

  // Add product rows
  filteredProducts.forEach((product, index) => {
    const row = document.createElement("tr");

    // Add product data cells
    const cells = [
      product.name,
      product.category,
      `${product.price} جنيه`,
      `<span class="${
        product.quantity <= 10 ? "status-badge low-stock" : ""
      }">${product.quantity}</span>`,
      `<button onclick="openEditModal(${index})" class="edit-btn">تعديل</button>
             <button onclick="deleteProduct(${index})" class="delete-btn">حذف</button>`,
    ];

    cells.forEach((cellContent) => {
      const cell = document.createElement("td");
      cell.innerHTML = cellContent;
      row.appendChild(cell);
    });

    productTable.appendChild(row);
  });

  // Check for low stock products
  checkLowStockProducts();
}

// Notification functions
function addNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification-item unread ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <small class="notification-time">منذ لحظات</small>
        </div>
    `;
    
    // Add to notifications list
    notificationsList.insertBefore(notification, notificationsList.firstChild);
    
    // Update notification count
    notificationCount++;
    document.getElementById('notificationCount').textContent = notificationCount;
    
    // Mark as read when clicked
    notification.addEventListener('click', () => {
        notification.classList.remove('unread');
        notification.classList.add('read');
    });
}

// Show/hide notifications
notificationBtn.addEventListener('click', () => {
    notificationBtn.classList.toggle('active');
});

// Close notifications when clicking outside
window.addEventListener('click', (e) => {
    if (!notificationBtn.contains(e.target) && !notifications.contains(e.target)) {
        notificationBtn.classList.remove('active');
    }
});

// Update notification count when adding/updating/deleting products
function updateNotificationCount() {
    const notifications = document.querySelectorAll('.notification-item');
    const unreadNotifications = Array.from(notifications).filter(
        notification => !notification.classList.contains('read')
    );
    notificationCount = unreadNotifications.length;
    document.getElementById('notificationCount').textContent = notificationCount;
}

// Modify existing alert functions to use notifications
function showSuccessAlert(message) {
    addNotification(message, 'success');
}

function showWarningAlert(message) {
    addNotification(message, 'warning');
}

// Add notifications for low stock products
function checkLowStockProducts() {
    const lowStockProducts = products.filter(product => product.quantity <= 10);
    if (lowStockProducts.length > 0) {
        const message = 'تنبيه: هناك منتجات قليلة المخزون:';
        const details = lowStockProducts.map(product => 
            `${product.name} (${product.quantity} قطعة)`
        ).join(', ');
        addNotification(`${message} ${details}`, 'warning');
    }
}

// Open edit modal
function openEditModal(index) {
  const product = products[index];
  editProductName.value = product.name;
  editProductCategory.value = product.category;
  editProductPrice.value = product.price;
  editProductQuantity.value = product.quantity;
  editModal.style.display = "block";
  currentEditingIndex = index;
}

// Close modal
function closeModal() {
  editModal.style.display = "none";
  editForm.reset();
  currentEditingIndex = null;
}

// Handle edit form submission
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const updatedProduct = {
    name: editProductName.value,
    category: editProductCategory.value,
    price: parseFloat(editProductPrice.value),
    quantity: parseInt(editProductQuantity.value),
  };

  updateProduct(currentEditingIndex, updatedProduct);
});

// Handle close button click
closeBtn.onclick = function () {
  closeModal();
};

// Handle clicking outside the modal
window.onclick = function (event) {
  if (event.target == editModal) {
    closeModal();
  }
};

// Handle add product button click
addProductBtn.addEventListener('click', (e) => {
  e.preventDefault();
  
  // Get all form values
  const name = productName.value.trim();
  const category = productCategory.value.trim();
  const price = parseFloat(productPrice.value);
  const quantity = parseInt(productQuantity.value);

  // Validate inputs
  if (!name || !category || isNaN(price) || isNaN(quantity)) {
    showWarningAlert('الرجاء إكمال معلومات المنتج بالكامل');
    return;
  }

  // Create product object
  const product = {
    name: name,
    category: category,
    price: price,
    quantity: quantity,
  };

  // Save product
  saveProduct(product);
});

// Handle search
searchInput.addEventListener("input", () => {
  displayProducts();
});

// Initialize table
displayProducts();
