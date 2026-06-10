import { test, expect } from "vitest";
import { validateLoginData } from "../js/login_Validation.js";

test("login should fail when email is empty", () => {
  const user = {
    email: "",
    password: "Password123!",
  };

  const result = validateLoginData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("email");
  expect(result.message).toBe("Email is required");
});

test("login should fail when email format is invalid", () => {
  const user = {
    email: "phumudzo",
    password: "Password123!",
  };

  const result = validateLoginData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("email");
  expect(result.message).toBe("Invalid email format");
});

test("login should fail when password is empty", () => {
  const user = {
    email: "phumudzo@gmail.com",
    password: "",
  };

  const result = validateLoginData(user);

  expect(result.valid).toBe(false);
  expect(result.field).toBe("password");
  expect(result.message).toBe("Password is required");
});
