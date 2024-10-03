// Firestore API URL for updating product
const firestoreProductUpdateUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/products/";

// Function to get URL parameters
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'), // Firestore document ID
        title: urlParams.get('title'),
        description: urlParams.get('description'),
        quantity: urlParams.get('quantity'),
        price: urlParams.get('price'),
        cat_id: urlParams.get('cat_id'),
        imageFile: urlParams.get('imageFile'),
        status_id: urlParams.get('status_id')
    };
}

// Prefill the form with the product data
function prefillForm() {
    const params = getUrlParams();
    document.getElementById('id').value = decodeURIComponent(params.id);
    document.getElementById('title').value = decodeURIComponent(params.title);
    document.getElementById('description').value = decodeURIComponent(params.description);
    document.getElementById('quantity').value = params.quantity;
    document.getElementById('price').value = params.price;
    document.getElementById('cat_id').value = decodeURIComponent(params.cat_id);
    document.getElementById('sttatus_id').value = decodeURIComponent(params.status_id);
}

// Convert the image file to Base64
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // Get only the Base64 part
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Function to update the product
async function updateProduct(event) {
    event.preventDefault(); // Prevent form submission

    const params = getUrlParams();
    const productId = params.id; // Firestore document ID (not the 'id' field inside the document)

    // Get the updated data from the form
    const updatedProduct = {
        fields: {
            // Preserve the internal 'id' field by keeping it unchanged in the update
             // Add the id field explicitly
            title: { stringValue: document.getElementById('title').value },
            description: { stringValue: document.getElementById('description').value },
            quantity: { integerValue: parseInt(document.getElementById('quantity').value) },
            price: { doubleValue: parseFloat(document.getElementById('price').value) },
            cat_id: { stringValue: document.getElementById('cat_id').value },
            status_id: { stringValue: document.getElementById('status_id').value }
        }
    };

    // Handle the image file upload
    const imageFileInput = document.getElementById('imageFile');
    if (imageFileInput.files.length > 0) {
        try {
            const imageFileBase64 = await convertImageToBase64(imageFileInput.files[0]);
            updatedProduct.fields.imageFile = { stringValue: imageFileBase64 };
        } catch (error) {
            console.error('Error converting image to Base64:', error);
            alert('Error processing the image. Please try again.');
            return;
        }
    }

    try {
        const response = await fetch(firestoreProductUpdateUrl + productId, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
            alert('Product updated successfully!');
            window.location.href = 'updateProduct.html'; // Redirect to the main page after successful update
        } else {
            throw new Error('Failed to update product: ' + response.statusText);
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
    }
}

// Prefill the form on page load
window.onload = prefillForm;

// Add event listener to the form submit
document.getElementById('updateForm').addEventListener('submit', updateProduct);
