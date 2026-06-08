export function validateSignupData(user) {
  if (!user.name.trim()) {
    return {
      valid: false,
      message: "Name is required",
    };
  }
  if (!user.email.trim()) {
    return {
      valid: false,
      message: "Email is required",
    };
  }

  if (user.password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }
  const validRoles = ["Member", "Treasurer", "Admin"];
  if (!validRoles.includes(user.role)) {
    return {
      valid: false,
    };
  }
  return {
    valid: true,
  };
}
