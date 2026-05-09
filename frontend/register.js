document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            
            e.preventDefault();

            
            const userName = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const phone = document.getElementById('regPhone').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            
            if (password !== confirmPassword) {
                alert('Passwords do not match! Please try again.');
                return;
            }

            
            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return;
            }

            
            const userData = {
                userName: userName,
                email: email,
                phone: phone,
                password: password
            };

            console.log('Sending data to server...', userData);

            try {
                
                const response = await fetch('https://homefinder-backend-5aho.onrender.com/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    
                    alert('Registration successful! Redirecting to login...');
                    window.location.href = 'login.html';
                } else {
                    
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Connection error:', error);
                alert('Could not connect to server. Check if server.js is running.');
            }
        });
    }
});