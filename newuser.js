// Firestore API URL to fetch all documents from the customer collection
const customerCollectionApiUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/customer/";

// Firestore API URL to add a new document to the customer collection
const customerAddApiUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/customer";

// Function to fetch all customer emails and passwords from the Firestore collection
async function fetchCustomerEmails() {
    try {
        const response = await fetch(customerCollectionApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json();
        
        // Map through the documents and extract email
        const customerData = data.documents.map(doc => {
            return {
                email: doc.fields.email.stringValue
            };
        });

        return customerData;
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return null;
    }
}

// Function to check for email duplication
async function isEmailDuplicated(email) {
    const customerData = await fetchCustomerEmails();
    if (customerData) {
        // Check if the entered email matches any email in the collection
        return customerData.some(customer => customer.email === email);
    }
    return false;
}

// Function to add a new customer to the collection
async function addCustomer(name,mobile,email, password, credit) {
    try {
        const response = await fetch(customerAddApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fields: {
                    name: {stringValue: name},
                    mobile: {stringValue: mobile},
                    email: { stringValue: email },
                    password: { stringValue: password },
                    credit: { integerValue : credit}
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add customer: ' + response.statusText);
        }

        const data = await response.json();
        console.log('Customer added successfully:', data);
    } catch (error) {
        console.error("Error adding customer:", error);
    }
}

// Function to validate customer registration
async function validateCustomerRegistration() {
    const name = document.getElementById('newName').value;
    const mobile = document.getElementById('newMobile').value;
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const credit = 0;

    // Clear any previous error message
    document.getElementById('errorMessage').textContent = "";

    const nameRegex = /^[A-Za-z\s]+$/;

    if (!nameRegex.test(name)) {
        document.getElementById('errorMessage').textContent = "Name should not contain numbers. Please enter a valid name.";
        return;
    }
    
    const mobileRegex = /^[0-9]+$/;
    let mobileLength=mobile.length;

    if(!mobileRegex.test(mobile) || mobileLength>10)
    {
        document.getElementById('errorMessage').textContent = "Mobile number should contain characters from 0-9"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate the email format before proceeding
    if (!emailRegex.test(email)) {
        document.getElementById('errorMessage').textContent = "Please enter a valid email address.";
        return;
    }

    // Check if email and password are not empty
    if (!name||!mobile||!email || !password) {
        document.getElementById('errorMessage').textContent = "Fields cannot be empty.";
        return;
    }

    // Check for email duplication
    const isDuplicated = await isEmailDuplicated(email);

    if (isDuplicated) {
        document.getElementById('errorMessage').textContent = "This email is already registered. Please use a different email.";
    } else {
        // If no duplication, add the new customer to Firestore
        await addCustomer(name,mobile,email, password, credit);
        document.getElementById('successMessage').textContent = "Registration successful!";
        // Redirect to login page after successful registration
        setTimeout(() => {
            window.location.href = 'customer.html'; // Adjust URL to your login page
        }, 2000);
    }
}

// Event listener for the registration button
document.getElementById('registerButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    validateCustomerRegistration(); // Call the registration validation function
});
