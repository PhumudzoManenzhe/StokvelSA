import { supabase } from "./supabaseClient.js";

const logoutBtn = document.getElementById("logoutBtn");

const { data } = await supabase.auth.getUser();

if (!data.user) {
  window.location.href = "../pages/login.html";
}

logoutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "../pages/login.html";
});
