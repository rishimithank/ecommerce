// Firestore API URLs
const firestoreCustomerQueryUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents:runQuery";
const firestoreCustomerUpdateUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/customer/";

let customerId = ""; // Variable to store customer ID after fetching

// Function to fetch customer details by email
async function fetchCustomerByEmail(event) {
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById('email').value; // Get email input

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

        const queryResponse = await fetch(firestoreCustomerQueryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryBody)
        });

        const customerData = await queryResponse.json();

        // Check if customer data was found
        if (!customerData || customerData.length === 0 || !customerData[0].document) {
            throw new Error('Customer not found');
        }

        // Step 2: Get the customer document and extract its details
        const customerDocument = customerData[0].document;
        customerId = customerDocument.name.split('/').pop(); // Extract the document ID

        const customerFields = customerDocument.fields;

        // Step 3: Populate the update form with customer details
        document.getElementById('name').value = customerFields.name.stringValue;
        document.getElementById('currentCredit').value = customerFields.credit.doubleValue;

        // Show the update form
        document.getElementById('updateCreditForm').style.display = 'block';
    } catch (error) {
        console.error('Error fetching customer:', error);
        alert('Error fetching customer details. Please check the email and try again.');
    }
}

// Function to update the customer credit
async function updateCustomerCredit(event) {
    event.preventDefault(); // Prevent form submission

    const newCredit = parseFloat(document.getElementById('newCredit').value); // Get new credit from form

    if (customerId === "") {
        alert("No customer selected.");
        return;
    }

    try {
        // Step 1: Update only the credit field of the customer
        const updatedCustomer = {
            fields: {
                credit: { doubleValue: newCredit } // Only update the 'credit' field
            }
        };

        const updateResponse = await fetch(firestoreCustomerUpdateUrl + customerId + '?updateMask.fieldPaths=credit', {
            method: 'PATCH', // PATCH method to update only specified fields
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedCustomer)
        });

        if (updateResponse.ok) {
            alert('Customer credit updated successfully!');
            document.getElementById('updateCreditForm').reset(); // Reset the form after success
            document.getElementById('updateCreditForm').style.display = 'none'; // Hide the form
        } else {
            throw new Error('Failed to update customer credit');
        }
    } catch (error) {
        console.error('Error updating customer credit:', error);
        alert('Error updating customer credit. Please try again.');
    }
}


// Add event listeners to the forms
document.getElementById('fetchCustomerForm').addEventListener('submit', fetchCustomerByEmail);
document.getElementById('updateCreditForm').addEventListener('submit', updateCustomerCredit);
