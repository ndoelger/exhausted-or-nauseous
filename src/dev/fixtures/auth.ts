// src/dev/fixtures/auth.ts

const randomEmail = `test-${Math.random().toString(36).substring(2, 15)}@example.com`;
const randomUsername = `test-${Math.random().toString(36).substring(2, 15)}`;

export const devSignup = {
    firstName: "Nic",
    lastName: "Doelger",
    username: randomUsername,
    email: randomEmail,
    confirmEmail: randomEmail,
    password: "TestPassword123!",
  };

  export const devLogin = {
    email: "alice.anderson@example.com",
    password: "TestPassword123!",
  };