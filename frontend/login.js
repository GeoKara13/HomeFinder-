document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('Attempting login for:', email);

            try {
                
                const response = await fetch('https://homefinder-backend-5aho.onrender.com/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    
                    
                    localStorage.setItem('userID', data.user.UserID);
                    localStorage.setItem('userName', data.user.UserName);

                    alert('Login successful! Welcome ' + data.user.UserName);
                    
                    
                    window.location.href = 'mainpage.html';
                } else {
                    
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Server error:', error);
                alert('Could not connect to server. Is server.js running?');
            }
        });
    }
});