import { validateLoginData } from "./login_Validation.js";
import { supabase } from "./supabaseClient.js";

const loginForm = document.getElementById("loginForm");
const viewPassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

viewPassword.addEventListener("click", () => {
  const icon = viewPassword.querySelector("i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
    return;
  }

  passwordInput.type = "password";
  icon.classList.remove("fa-eye-slash");
  icon.classList.add("fa-eye");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const credentials = {
    email: document.getElementById("email").value,
    password: passwordInput.value,
  };

  const result = validateLoginData(credentials);

  if (!result.valid) {
    alert(result.message);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (data.user.user_metadata.role == "Member") {
    window.location.href = "../pages/member_dashboard.html";
    alert("Login successful!");
    return;
  }

  if (data.user.user_metadata.role == "Admin") {
    window.location.href = "../pages/admin_dashboard.html";
    alert("Login successful!");
    return;
  }
  if (data.user.user_metadata.role == "Treasurer") {
    window.location.href = "../pages/tressurer_dashboard.html";
    alert("Login successful!");
    return;
  }
});
