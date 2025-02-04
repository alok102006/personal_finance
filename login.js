const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent page reload on form submission
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:5501/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      message.style.color = 'green';
      message.textContent = data.message;
      // Redirect to dashboard or another page
      window.location.href = '/tools.html';
    } else {
      message.style.color = 'red';
      message.textContent = data.error;
    }
  } catch (error) {
    message.style.color = 'red';
    message.textContent = 'An error occurred. Please try again.';
  }
});
