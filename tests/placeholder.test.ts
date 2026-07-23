/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputValidator, EmailValidator } from "../backend/server";

describe("Support Suite Modular Tests", () => {
  it("should validate safe customer inquiries", () => {
    const res = InputValidator.validate("Hello, I need help with my monthly billing subscription charge.");
    if (!res.isValid) {
      throw new Error("Validation failed for a safe support inquiry: " + res.error);
    }
  });

  it("should block completely empty inquiries", () => {
    const res = InputValidator.validate("   ");
    if (res.isValid) {
      throw new Error("Validation succeeded when input was blank spaces");
    }
  });

  it("should block inappropriate language", () => {
    const res = InputValidator.validate("This asshole service did not refund me!");
    if (res.isValid) {
      throw new Error("Validation succeeded when input contained blocked terms");
    }
  });

  it("should validate emails correctly", () => {
    const validEmails = [
      "chandu@gmail.com",
      "user123@gmail.com",
      "john.doe@gmail.com",
      "first_last@yahoo.com",
      "test-user@outlook.com",
      "user+work@gmail.com",
      "  chandu@gmail.com  " // trimmed
    ];

    for (const email of validEmails) {
      const res = EmailValidator.validate(email);
      if (!res.isValid) {
        throw new Error(`Expected valid email "${email}" to pass, but got error: ${res.error}`);
      }
    }

    const invalidEmails = [
      "@gmail.com",
      ".abc@gmail.com",
      "abc.@gmail.com",
      "abc..123@gmail.com",
      "abc@gmail",
      "abc@.com",
      "abc@com",
      "abc@@gmail.com",
      "abc gmail@gmail.com",
      "a",
      "",
      "   "
    ];

    for (const email of invalidEmails) {
      const res = EmailValidator.validate(email);
      if (res.isValid) {
        throw new Error(`Expected invalid email "${email}" to fail, but it passed`);
      }
      if (res.error !== "Please enter a valid email address.") {
        throw new Error(`Expected error "Please enter a valid email address.", got "${res.error}"`);
      }
    }
  });
});

function describe(name: string, fn: () => void) {
  console.log(`Running test suite: ${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ Passed: ${name}`);
  } catch (e: any) {
    console.error(`  ✗ Failed: ${name} - ${e.message}`);
    process.exit(1);
  }
}
