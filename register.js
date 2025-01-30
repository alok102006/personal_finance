const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    alert("Registration successful! Redirecting to login...");
    window.location.href = "/login.html"; // Redirect after registration
  } else {
    const error = await response.text();
    alert(`Error: ${error}`);
  }
});
