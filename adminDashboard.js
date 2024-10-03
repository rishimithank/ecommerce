// Firebase Firestore API URL for adding a product
const firestoreProductApiUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/products";

// Function to convert a file to Base64
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result.split(',')[1]); // Return just the Base64 string, not the metadata
        };
        reader.onerror = () => {
            reject("Error converting file to Base64");
        };
        reader.readAsDataURL(file);
    });
}

// Function to add a new product to Firestore
async function addProductToFirestore(productDetails) {
    try {
        const response = await fetch(firestoreProductApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    id: { stringValue: productDetails.id },
                    cat_id: { stringValue: productDetails.cat_id },
                    status_id: { stringValue: productDetails.status_id },// Use the selected category from the dropdown
                    title: { stringValue: productDetails.title },
                    description: { stringValue: productDetails.description },
                    quantity: { integerValue: productDetails.quantity },
                    price: { doubleValue: productDetails.price },
                    imageFile: { stringValue: productDetails.imageFile } // Save the Base64 string of the image
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add product: ' + response.statusText);
        }

        const data = await response.json();
        console.log('Product added successfully:', data);
    } catch (error) {
        console.error("Error adding product:", error);
    }
}

// Function to handle the form submission
async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the form from submitting the normal way

    const id = document.getElementById('id').value;
    const cat_id = document.getElementById('cat_id').value; 
    const status_id = document.getElementById('status_id').value;// Get value from dropdown
    const title = document.getElementById('title').value;
    const description = document.getElementById('des').value;
    const quantity = parseInt(document.getElementById('qty').value);
    const price = parseFloat(document.getElementById('price').value);
    const imageFile = document.getElementById('image').files[0];

    // Validate the form inputs
    if (!id || !cat_id || !status_id || !title || !description || !quantity || !price || !imageFile) {
        alert("Please fill out all fields.");
        return;
    }

    try {
        const imageBase64 = await convertToBase64(imageFile);
        // Prepare the product details to send to Firestore
        const productDetails = {
            id: id,
            cat_id: cat_id,
            status_id: status_id, // Include the selected category
            title: title,
            description: description,
            quantity: quantity,
            price: price,
            imageFile: imageBase64 // Include the Base64 string
        };

        // Add the product to Firestore
        await addProductToFirestore(productDetails);

        // Show success message
        alert("Product added successfully!");

        // Optionally clear the form
        document.getElementById('addItemForm').reset();
    } catch (error) {
        console.error("Error during product submission:", error);
        alert("An error occurred while adding the product.");
    }
}

// Add event listener to the submit button
document.getElementById('submitItemButton').addEventListener('click', handleFormSubmit);
