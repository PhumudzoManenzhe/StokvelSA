import { test, expect } from "vitest";
import { validateSignupData } from "../js/auth.js";

test("signup should fail when name is empty", () => {
  const user = {
    name: "",
    email: "test@gmail.com",
    password: "Password123!",
    confirm_password: "Password123!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("name");
  expect(result.message).toBe("Name is required");
});

test("signup should fail when email is empty", () => {
  const user = {
    name: "Phumudzo",
    email: "",
    password: "Password123!",
    confirm_password: "Password123!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("email");
  expect(result.message).toBe("Email is required");
});

test("signup should fail when email format is invalid", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo",
    password: "Password123!",
    confirm_password: "Password123!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("email");
  expect(result.message).toBe("Invalid email format");
});

test("signup should fail when password is empty", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "",
    confirm_password: "",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe("Password is required");
});

test("signup should fail when password is less than 8 characters", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Pass1!",
    confirm_password: "Pass1!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe("Password must be at least 8 characters");
});

test("signup should fail when password has no uppercase letter", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "password123!",
    confirm_password: "password123!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe(
    "Password must contain at least one uppercase letter",
  );
});

test("signup should fail when password has no lowercase letter", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "PASSWORD123!",
    confirm_password: "PASSWORD123!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe(
    "Password must contain at least one lowercase letter",
  );
});

test("signup should fail when password has no number", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password!",
    confirm_password: "Password!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe("Password must contain at least one number");
});

test("signup should fail when password has no special character", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password123",
    confirm_password: "Password123",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe(
    "Password must contain at least one special character",
  );
});

test("signup should fail when confirm password is empty", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password123!",
    confirm_password: "",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("confirm_password");
  expect(result.message).toBe("Confirm password is required");
});

test("signup should fail when password and confirm password do not match", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password123!",
    confirm_password: "Password124!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("confirm_password");
  expect(result.message).toBe("Passwords must match");
});

test("signup should fail when role is empty", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password123!",
    confirm_password: "Password123!",
    role: "",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("role");
  expect(result.message).toBe("Role is required");
});

test("signup should fail when role is invalid", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password123!",
    confirm_password: "Password123!",
    role: "Boss",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("role");
  expect(result.message).toBe(
    "Invalid role. Role should be Member, Treasurer, or Admin",
  );
});

test("signup should pass when all fields are valid", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "Password123!",
    confirm_password: "Password123!",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(true);
  expect(result.field).toBeUndefined();
  expect(result.message).toBeUndefined();
});
