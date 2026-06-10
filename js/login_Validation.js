export function validateLoginData(user) {
  if (user.email.trim() === "") {
    return {
      valid: false,
      field: "email",
      message: "Email is required",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(user.email)) {
    return {
      valid: false,
      field: "email",
      message: "Invalid email format",
    };
  }

  if (user.password.trim() === "") {
    return {
      valid: false,
      field: "password",
      message: "Password is required",
    };
  }

  return {
    valid: true,
  };
}
