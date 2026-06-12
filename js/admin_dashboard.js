import { supabase } from "./supabaseClient.js";

const loadingMessage = document.getElementById("loadingMessage");
const profileBox = document.getElementById("profileBox");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userRole = document.getElementById("userRole");
const logoutBtn = document.getElementById("logoutBtn");

const { data: authData } = await supabase.auth.getUser();

if (!authData.user) {
  window.location.href = "../pages/login.html";
}

const userId = authData.user.id;

const { data: profile, error } = await supabase
  .from("profiles")
  .select("full_name, email, role")
  .eq("id", userId)
  .single();

if (error) {
  loadingMessage.textContent = "Failed to load profile.";
  console.error(error);
} else {
  loadingMessage.classList.add("hidden");
  profileBox.classList.remove("hidden");

  userName.textContent = `Welcome, ${profile.full_name}`;
  userEmail.textContent = profile.email;
  userRole.textContent = profile.role;
}

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "../pages/login.html";
});
