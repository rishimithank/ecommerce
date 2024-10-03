// Firestore API URL to fetch all documents from the customer collection
const customerCollectionApiUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/customer/";

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
        
        // Map through the documents and extract email and password
        const customerData = data.documents.map(doc => {
            return {
                email: doc.fields.email.stringValue,
                password: doc.fields.password.stringValue
            };
        });

        return customerData;
    } catch (error) {
        console.error("Error fetching customer data:", error);
        return null;
    }
}

// Function to validate customer credentials by checking against all documents
async function validateCustomer() {
    const enteredEmail = document.getElementById('email').value;
    const enteredPassword = document.getElementById('password').value;

    // Clear any previous error message
    document.getElementById('errorMessage').textContent = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate the email format before proceeding
    if (!emailRegex.test(enteredEmail)) {
        document.getElementById('errorMessage').textContent = "Please enter a valid email address.";
        return;
    }
    if(enteredEmail)
    {
        localStorage.setItem('userEmail',enteredEmail);
    }
    // Fetch all customer emails and passwords from Firestore collection
    const customerData = await fetchCustomerEmails();

    if (customerData) {
        // Check if the entered email matches any of the emails in the collection
        const matchingCustomer = customerData.find(customer => customer.email === enteredEmail);

        if (matchingCustomer) {
            // Check if the password matches for the found email
            if (matchingCustomer.password === enteredPassword) {
                // If email and password match, redirect to customer dashboard
                window.location.href = 'customerDashboard.html';
            } else {
                // If password doesn't match, display error
                document.getElementById('errorMessage').textContent = "Invalid password. Please try again.";
            }
        } else {
            // If no matching email is found, display error
            document.getElementById('errorMessage').textContent = "Invalid email. Please enter a valid email.";
        }
    } else {
        document.getElementById('errorMessage').textContent = "Error fetching customer data. Please try again later.";
    }
}

// Event listener for the login button
document.getElementById('loginButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    validateCustomer(); // Call the validation function
});

