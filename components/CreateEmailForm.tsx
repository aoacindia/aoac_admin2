"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEmailForm() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create email.");
        return;
      }

      setSuccess(`Created ${data.email.emailAddress}`);
      setEmailAddress("");
      setPassword("");
      setTimeout(() => router.push("/email"), 800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label
          htmlFor="emailAddress"
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          Email Address
        </label>
        <input
          id="emailAddress"
          type="email"
          required
          value={emailAddress}
          onChange={(event) => setEmailAddress(event.target.value)}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="name@aoac.in"
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
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create Email"}
      </button>
    </form>
  );
}
