// Firestore API URL
const firestoreApiUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents:runQuery";
const firestoreCustomerDeleteUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/customer/";

// Function to fetch customer by email and delete
async function deleteCustomerByEmail(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value; // Get email input
    const messageElement = document.getElementById('message'); // Element to display messages

    try {
        // Step 1: Query Firestore to find the customer by email
        const queryBody = {
            structuredQuery: {
                from: [{ collectionId: "customer" }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: "email" },
                        op: "EQUAL",
                        value: { stringValue: email }
                    }
                }
            }
        };

        const queryResponse = await fetch(firestoreApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryBody)
        });

        const customerData = await queryResponse.json();

        // Check if customer data was found
        if (!customerData || customerData.length === 0 || !customerData[0].document) {
            messageElement.textContent = "Customer not found";
            messageElement.style.color = "red";
            return;
        }

        // Step 2: Get the customer document ID
        const customerDocument = customerData[0].document;
        const customerId = customerDocument.name.split('/').pop(); // Extract the document ID

        // Step 3: Delete the customer document using the Firestore API
        const deleteResponse = await fetch(firestoreCustomerDeleteUrl + customerId, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (deleteResponse.ok) {
            // messageElement.textContent = "Customer deleted successfully!";
            // messageElement.style.color = "green";
            alert("Customer deleted successfully!");
        } else {
            throw new Error("Failed to delete customer");
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        messageElement.textContent = "Error deleting customer. Please try again.";
        messageElement.style.color = "red";
    }
}

// Add event listener to the form
document.getElementById('deleteCustomerForm').addEventListener('submit', deleteCustomerByEmail);
