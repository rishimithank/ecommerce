// Firestore API URL
const firestoreProductFetchUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/products";

// Variables for pagination and filtering
let productsPerPage = 5;
let currentPage = 1;
let totalProducts = 0;
let allProducts = [];
let filteredProducts = []; // New variable to hold filtered products

// Function to fetch products from Firestore API
async function fetchProducts() {
    try {
        const response = await fetch(firestoreProductFetchUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch products: ' + response.statusText);
        }

        const data = await response.json();
        allProducts = data.documents.map(doc => {
            return {
                title: doc.fields.title.stringValue,
                description: doc.fields.description.stringValue,
                quantity: doc.fields.quantity.integerValue,
                price: doc.fields.price.doubleValue,
                cat_id: doc.fields.cat_id.stringValue,
                imageFile: doc.fields.imageFile ? doc.fields.imageFile.stringValue : null // Add image handling
            };
        });

        // Initialize filtered products to all products on first load
        filteredProducts = allProducts;

        totalProducts = filteredProducts.length;
        displayProducts();
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Function to display products on the current page
function displayProducts() {
    const productTableBody = document.querySelector('#productTable tbody');
    productTableBody.innerHTML = ''; // Clear table

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToDisplay = filteredProducts.slice(start, end); // Display filtered products

    productsToDisplay.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.cat_id}</td>
            <td>${product.title}</td>
            <td>${product.description}</td>
            <td>${product.quantity}</td>
            <td>${product.price.toFixed(2)}</td>
            <td><img src="data:image/jpeg;base64,${product.imageFile}" alt="${product.title}" style="width: 50px; height: 50px;" /></td>
        `;
        productTableBody.appendChild(row);
    });

    updatePagination();
}

// Function to update pagination controls
function updatePagination() {
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalProducts / productsPerPage)}`;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === Math.ceil(totalProducts / productsPerPage);
}

// Event listeners for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPage < Math.ceil(totalProducts / productsPerPage)) {
        currentPage++;
        displayProducts();
    }
});

// Event listener for changing products per page
document.getElementById('entriesPerPage').addEventListener('change', function () {
    productsPerPage = parseInt(this.value);
    currentPage = 1; // Reset to the first page when changing the number of products per page
    displayProducts();
});

// Event listener for category filtering
document.getElementById('cat_name').addEventListener('change', function () {
    const selectedCategory = this.value;

    // Filter products based on selected category
    filteredProducts = selectedCategory ? allProducts.filter(product => product.cat_id === selectedCategory) : allProducts;

    totalProducts = filteredProducts.length; // Update total products based on the filtered list
    currentPage = 1; // Reset to the first page
    displayProducts();
});

// Fetch products and display on page load
window.onload = fetchProducts;
