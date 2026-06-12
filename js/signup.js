import { validateSignupData } from "./auth.js";
import { supabase } from "./supabaseClient.js";

const signupForm = document.getElementById("signupForm");
const viewPassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const confirm_passwordInput = document.getElementById("confirm_password");
const viewConfirm_Password = document.getElementById("toggleConfirmPassword");

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

viewConfirm_Password.addEventListener("click", () => {
  const icon2 = viewConfirm_Password.querySelector("i");

  if (confirm_passwordInput.type === "password") {
    confirm_passwordInput.type = "text";
    icon2.classList.remove("fa-eye");
    icon2.classList.add("fa-eye-slash");
    return;
  }
  confirm_passwordInput.type = "password";
  icon2.classList.remove("fa-eye-slash");
  icon2.classList.add("fa-eye");
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const user = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: passwordInput.value,
    confirm_password: confirm_passwordInput.value,
    role: document.getElementById("role").value,
  };

  const result = validateSignupData(user);
  if (!result.valid) {
    alert(result.message);
    return;
  }
  const { data: user_data, error: signup_error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        full_name: user.name,
        role: user.role,
      },
    },
  });

  if (signup_error) {
    console.error("Signup error:", error);
    alert(error.message);
    return;
  }

  if (user.role == "Member") {
    window.location.href = "../pages/member_dashboard.html";
    alert("Account created successfully. Please check your email.");
    return;
  }
  if (user.role == "Admin") {
    window.location.href = "../pages/admin_dashboard.html";
    alert("Account created successfully. Please check your email.");
    return;
  }
  if (user.role == "Treasurer") {
    window.location.href = "../pages/tressure_dashboard.html";
    alert("Account created successfully. Please check your email.");
    return;
  }
});
