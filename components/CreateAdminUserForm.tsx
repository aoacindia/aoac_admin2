"use client";

import { FormEvent, useState } from "react";

export default function CreateAdminUserForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldError("");

    if (!fullName.trim()) {
      setFieldError("Full name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setFieldError("A valid email address is required.");
      return;
    }

    if (password.length < 4) {
      setFieldError("Password must be at least 4 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    // Intentionally disabled — UI placeholder only.
    setError("User creation is currently disabled.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="fullName"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={4}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          minLength={4}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div>
        <label
          htmlFor="role"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Role
        </label>
        <select
          id="role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="status"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {fieldError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {fieldError}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Submit
      </button>
    </form>
  );
}
