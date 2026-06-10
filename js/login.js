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

  const user = {
    email: document.getElementById("email").value,
    password: passwordInput.value,
  };

  const result = validateLoginData(user);

  if (!result.valid) {
    alert(result.message);
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Login successful!");
  window.location.href = "../pages/dashboard.html";
});
