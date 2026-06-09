export function validateSignupData(user) {
  if (user.name.trim() === "") {
    return {
      valid: false,
      field: "name",
      message: "Name is required",
    };
  }

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

  if (user.password.length < 8) {
    return {
      valid: false,
      field: "password",
      message: "Password must be at least 8 characters",
    };
  }

  if (!/[A-Z]/.test(user.password)) {
    return {
      valid: false,
      field: "password",
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[a-z]/.test(user.password)) {
    return {
      valid: false,
      field: "password",
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[0-9]/.test(user.password)) {
    return {
      valid: false,
      field: "password",
      message: "Password must contain at least one number",
    };
  }

  if (!/[!@#$%^&*]/.test(user.password)) {
    return {
      valid: false,
      field: "password",
      message: "Password must contain at least one special character",
    };
  }

  if (user.confirm_password.trim() === "") {
    return {
      valid: false,
      field: "confirm_password",
      message: "Confirm password is required",
    };
  }

  if (user.password !== user.confirm_password) {
    return {
      valid: false,
      field: "confirm_password",
      message: "Passwords must match",
    };
  }

  if (user.role.trim() === "") {
    return {
      valid: false,
      field: "role",
      message: "Role is required",
    };
  }

  const validRoles = ["Member", "Treasurer", "Admin"];

  if (!validRoles.includes(user.role)) {
    return {
      valid: false,
      field: "role",
      message: "Invalid role. Role should be Member, Treasurer, or Admin",
    };
  }

  return {
    valid: true,
  };
}
