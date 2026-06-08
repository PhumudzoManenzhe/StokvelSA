import { test, expect } from "vitest";
import { validateSignupData } from "../js/auth.js";

test("signup should fail when name is empty", () => {
  const user = {
    name: "",
    email: "test@gmail.com",
    password: "password123",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
});

test("signup should fail when email is empty", () => {
  const user = {
    name: "Phumudzo",
    email: "",
    password: "password123",
    role: "Member",
  };

  const result = validateSignupData(user);

  expect(result.valid).toBe(false);
});

test("signup should fail when password is less than 8 characters", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "123",
    role: "Member",
  };

  const result = validateSignupData(user);
  expect(result.valid).toBe(false);
});

test("signup should fail when role is invalid", () => {
  const user = {
    name: "Phumudzo",
    email: "phumudzo@gmail.com",
    password: "password123",
    role: "Boss",
  };

  const result = validateSignupData(user);
  expect(result.valid).toBe(false);
});
