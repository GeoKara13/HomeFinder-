document.addEventListener('DOMContentLoaded', () => {
    let timeLeft = 30;
    const countdownElement = document.getElementById('countdown');
    const timerText = document.getElementById('timerText');
    const verifyForm = document.getElementById('verifyForm');
    const resendLink = document.getElementById('resendLink');
    let timerId;

    function startTimer() {
        if (!countdownElement) return;
        timeLeft = 30;
        countdownElement.innerText = timeLeft;
        
        timerId = setInterval(() => {
            timeLeft--;
            countdownElement.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timerId);
                if (timerText) timerText.innerHTML = 'Token expired. Please request a new one.';
            }
        }, 1000);
    }

    if (verifyForm) {
        startTimer();
        verifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (timeLeft <= 0) {
                alert('Code expired!');
                return;
            }
            alert('Verified! Moving to Main Page.');
            
            // Σύνδεση με το δικό σου αρχείο mainpage.html
            window.location.href = 'mainpage.html';
        });
    }

    if (resendLink) {
        resendLink.addEventListener('click', (e) => {
            e.preventDefault();
            clearInterval(timerId);
            startTimer();
            alert('New code sent!');
        });
    }
});