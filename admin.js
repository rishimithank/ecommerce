// Firestore API URL to fetch the admin credentials
const adminApiUrl = "https://firestore.googleapis.com/v1/projects/ecommerce-bcc89/databases/(default)/documents/admin/PoMmmxMWPWaAaN0PBmHa";

// Function to fetch admin credentials from the Firestore API
async function fetchAdminCredentials() {
    try {
        const response = await fetch(adminApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json();
        return {
            email: data.fields.email.stringValue,
            password: data.fields.password.stringValue
        };
    } catch (error) {
        console.error("Error fetching admin credentials:", error);
        return null;
    }
}

// Modified validateAdmin function to use fetched credentials
async function validateAdmin() {
    const Adminemail = document.getElementById('email').value;
    const Adminpassword = document.getElementById('password').value;

    // Clear any previous error message
    document.getElementById('errorMessage').textContent = "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate the email format before proceeding
    if (!emailRegex.test(Adminemail)) {
        document.getElementById('errorMessage').textContent = "Please enter a valid email address.";
        return;
    }

    // Fetch admin credentials from the Firestore API
    const adminCredentials = await fetchAdminCredentials();

    if (adminCredentials) {
        const { email, password } = adminCredentials;

        // Check if the entered email matches the fetched admin email and password
        if (Adminemail === email && Adminpassword === password) {
            window.location.href = 'adminChoice.html'; // Redirect to admin dashboard
        } else if (Adminemail !== email) {
            document.getElementById('errorMessage').textContent = "Invalid email. Please enter a valid admin email.";
        } else if (Adminpassword !== password) {
            document.getElementById('errorMessage').textContent = "Invalid password. Please try again.";
        }
    } else {
        document.getElementById('errorMessage').textContent = "Error fetching admin credentials. Please try again later.";
    }
}

