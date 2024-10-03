var itemCount=0;
async function getProductDetails() {
    const savedEmail = localStorage.getItem('userEmail');
    console.log(savedEmail); // Retrieve the saved email from localStorage

    if (!savedEmail) {
        alert("No email found in local storage.");
        return;
    }

    // Fetch cart document using the savedEmail
    const cartUrl = `https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/cart/${savedEmail}`;

    try {
        const cartResponse = await fetch(cartUrl);
        if (!cartResponse.ok) {
            throw new Error('Network response was not ok ' + cartResponse.statusText);
        }

        const cartData = await cartResponse.json();

        // Check if the document exists and has items
        if (cartData.fields && cartData.fields.items) {
            const items = cartData.fields.items.arrayValue.values;

            // Extract product IDs from the items
            const productIds = items.map(item => item.mapValue.fields.id.stringValue);
            console.log("Collected Product IDs:", productIds); // Log the collected IDs

            // Fetch products from the product database
            const productUrl = `https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/products`;
            const productResponse = await fetch(productUrl);
            if (!productResponse.ok) {
                throw new Error('Network response was not ok ' + productResponse.statusText);
            }

            const productData = await productResponse.json();
            const productDetailsList = document.getElementById('productDetailsList');
            productDetailsList.innerHTML = ''; // Clear previous results

            let totalAmount = 0; // Initialize total amount

            // Iterate through products and match IDs
            productData.documents.forEach(product => {
                const productFields = product.fields;

                // Assume the product ID is stored in a specific field, for example, 'id'
                const productId = productFields.id.stringValue;

                // Check if the product ID matches any collected from the cart
                if (productIds.includes(productId)) {
                    // Store the imageFile in the cart
                    const imageFile = productFields.imageFile.stringValue;

                    // Find the matching item from the cart to get the quantity
                    const matchingItem = items.find(item => item.mapValue.fields.id.stringValue === productId);
                    let quantity = matchingItem.mapValue.fields.quantity.integerValue;

                    // Get the available stock quantity from the product details
                    const availableQuantity = productFields.quantity.integerValue;

                    // Initialize the number of items counter for this product
                    if (!localStorage.getItem(`itemCount-${productId}`) || quantity <= 0) {
                        //localStorage.setItem(`itemCount-${productId}`, 1);
                        quantity = 1; // Default quantity to 1 if it's the first addition
                    }

                    // Calculate the subtotal
                    const price = productFields.price.doubleValue;
                    let subtotal = quantity * price;

                    // Add to total amount
                    totalAmount += subtotal;

                    // Display product details along with the image and number of items controls
                    const productDiv = document.createElement('div');
                    productDiv.classList.add('product');
                    productDiv.innerHTML = `
                        <img src="data:image/jpeg;base64,${imageFile}" alt="${productFields.title.stringValue}" style="width: 150px; height: 150px;" /><br>
                        <h3>${productFields.title.stringValue}</h3>
                        <strong>Price:</strong> ₹${price.toFixed(2)}<br>
                        <strong>Number of Items:</strong> 
                        <button onclick="decrementItemCount('${productId}', ${price})">-</button> 
                        <span id="item-count-${productId}">${quantity}</span> 
                        <button onclick="incrementItemCount('${productId}', ${price}, ${availableQuantity})">+</button><br>
                        <strong>Subtotal:</strong> ₹<span id="subtotal-${productId}">${subtotal.toFixed(2)}</span><br>
                        <strong>Description:</strong> ${productFields.description.stringValue}<br>
                    `;
                    productDetailsList.appendChild(productDiv);
                }
            });

            // Display total amount
            const totalDiv = document.createElement('div');
            totalDiv.classList.add('total-amount');
            totalDiv.innerHTML = `<h3>Total Amount: ₹<span id="total-amount">${totalAmount.toFixed(2)}</span></h3>`;
            productDetailsList.appendChild(totalDiv);

        } else {
            alert("No products found for this email.");
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error fetching data, please check the console for more details.');
    }
}

// Function to increment the number of items for a product and update the subtotal and total
function incrementItemCount(productId, price, availableQuantity) {
     itemCount = parseInt(localStorage.getItem(`itemCount-${productId}`)) || 1;

    if (itemCount < availableQuantity) {
        itemCount += 1;
        localStorage.setItem(`itemCount-${productId}`, itemCount);
        document.getElementById(`item-count-${productId}`).textContent = itemCount;

        const subtotal = itemCount * price;
        document.getElementById(`subtotal-${productId}`).textContent = subtotal.toFixed(2);

        updateTotalAmount();
    } else {
        alert(`Cannot add more than ${availableQuantity} items.`);
    }
}

// Function to decrement the number of items for a product and update the subtotal and total
function decrementItemCount(productId, price) {
    itemCount = parseInt(localStorage.getItem(`itemCount-${productId}`)) || 1;

    if (itemCount > 1) {
        itemCount -= 1;
    }
    localStorage.setItem(`itemCount-${productId}`, itemCount);
    document.getElementById(`item-count-${productId}`).textContent = itemCount;

    const subtotal = itemCount * price;
    document.getElementById(`subtotal-${productId}`).textContent = subtotal.toFixed(2);
    updateTotalAmount();
}

// Function to update the total amount by summing up all the subtotals
function updateTotalAmount() {
    let totalAmount = 0;

    const subtotals = document.querySelectorAll('[id^="subtotal-"]');
    subtotals.forEach(subtotalElem => {
        totalAmount += parseFloat(subtotalElem.textContent);
    });

    document.getElementById('total-amount').textContent = totalAmount.toFixed(2);
}

// Call the function to get product details when the page loads
window.onload = getProductDetails;

function showPaymentOptions() {
    const paymentOptionsDiv = document.getElementById('paymentOptions');
    paymentOptionsDiv.style.display = 'block'; // Show the payment options
}

// Function to confirm the order and update the product quantities and clear the cart
// Function to confirm the order, update product quantities, store order details, and clear the cart
async function confirmOrder() {
    const savedEmail = localStorage.getItem('userEmail');
    if (!savedEmail) {
        alert("No user email found. Please log in.");
        return;
    }

    const cartUrl = `https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/cart/${savedEmail}`;
    const productUrl = `https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/products`;

    try {
        // Fetch the cart document
        const cartResponse = await fetch(cartUrl);
        if (!cartResponse.ok) {
            throw new Error('Error fetching cart data: ' + cartResponse.statusText);
        }

        const cartData = await cartResponse.json();
        const items = cartData.fields && cartData.fields.items && cartData.fields.items.arrayValue
            ? cartData.fields.items.arrayValue.values
            : [];

        if (items.length === 0) {
            alert("No items found in the cart.");
            return;
        }

        // Fetch all products from the product database
        const productResponse = await fetch(productUrl);
        if (!productResponse.ok) {
            throw new Error('Error fetching product data: ' + productResponse.statusText);
        }

        const productData = await productResponse.json();
        const products = productData.documents;

        // Array to store CSV data (headers + rows)
        let csvData = [['Product ID', 'Product Name', 'Quantity', 'Price', 'Subtotal']]; // CSV headers
        let orderItems = []; // To store order data

        // Get the current timestamp
        const timestamp = new Date().toISOString();

        // Loop through cart items and update product quantities
        for (const item of items) {
            const productId = item.mapValue && item.mapValue.fields && item.mapValue.fields.id
                ? item.mapValue.fields.id.stringValue
                : null;
            const cartItemCount = item.mapValue && item.mapValue.fields && item.mapValue.fields.quantity
                ? parseInt(item.mapValue.fields.quantity.integerValue)
                : 0;

            if (!productId) {
                console.warn('Product ID is missing for the item:', item);
                continue; // Skip this iteration if productId is not found
            }

            // Find the corresponding product in the product database
            const matchedProduct = products.find(product => {
                return product.fields.id.stringValue === productId;
            });

            if (matchedProduct) {
                const productName = matchedProduct.fields.title.stringValue;
                const price = matchedProduct.fields.price.doubleValue;

                // Calculate subtotal and add it to the CSV data
                const subtotal = itemCount * price;
                csvData.push([productId, productName, itemCount, `₹${price.toFixed(2)}`, `₹${subtotal.toFixed(2)}`]);

                // Add product details to orderItems for Firestore 'order' document
                orderItems.push({
                    mapValue: {
                        fields: {
                            id: { stringValue: productId },
                            name: { stringValue: productName },
                            price: { doubleValue: price },
                            quantity: { integerValue: itemCount },
                            subtotal: { doubleValue: subtotal }
                        }
                    }
                });

                // Extract the document ID of the matched product
                const productDocId = matchedProduct.name.split('/').pop();
                const availableQuantity = parseInt(matchedProduct.fields.quantity.integerValue);

                // Calculate the new quantity after subtracting cart item count
                const newQuantity = availableQuantity - itemCount;

                // Ensure the new quantity is not negative
                if (newQuantity < 0) {
                    alert(`Not enough stock for product ID: ${productId}`);
                    return;
                }

                // Update the product quantity in Firestore using updateMask
                const updateResponse = await fetch(`https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/products/${productDocId}?updateMask.fieldPaths=quantity`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fields: {
                            quantity: { integerValue: newQuantity }
                        }
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error('Error updating product quantity: ' + updateResponse.statusText);
                }
            } else {
                console.warn(`Product with ID ${productId} not found in the products collection.`);
            }
        }

        // Create order data to be sent to Firestore 'order' collection
        const orderData = {
            fields: {
                email: { stringValue: savedEmail },
                timestamp: { timestampValue: timestamp },
                items: { arrayValue: { values: orderItems } }
            }
        };

        // Send order data to Firestore 'order' collection
        const orderUrl = 'https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/orders';
        const orderResponse = await fetch(orderUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            throw new Error('Error saving order: ' + orderResponse.statusText);
        }

        // Clear the cart for the user after successfully updating quantities and saving order
        const deleteResponse = await fetch(cartUrl, {
            method: 'DELETE',
        });

        if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text(); // Get error message from response
            console.error('Error deleting cart:', errorText);
            throw new Error('Error deleting cart: ' + deleteResponse.statusText);
        }

        // Create and download CSV file
        downloadCSV(csvData);

        alert("Order confirmed! Your cart has been cleared.");
        location.reload(); // Reload the page to refresh the cart
    } catch (error) {
        console.error('Error confirming order:', error);
        alert('Error confirming order, please check the console for more details.');
    }
}


// Function to generate and download a CSV file
function downloadCSV(csvData) {
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'order-details.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}




// Attach event listeners to the buttons
document.getElementById('proceedToPaymentBtn').addEventListener('click', showPaymentOptions);
document.getElementById('confirmOrderBtn').addEventListener('click', confirmOrder);
