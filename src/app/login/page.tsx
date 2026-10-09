"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (response.status === 429) {
        setError("Too many sign-in attempts. Wait a minute, then try again.");
        return;
      }
      if (!response.ok) {
        setError("Unable to sign in. Check your email and password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Cannot reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-layout">
      <aside className="login-story">
        <img
          className="brand"
          src="/brand/logo-light.png"
          width="260"
          height="59"
          alt="CODEYEA"
        />
        <div>
          <p>Content studio</p>
          <h1>
            Your next chapter
            <br />
            starts here.
          </h1>
          <p>
            A considered space to shape your website,
            <br />
            one draft at a time.
          </p>
        </div>
        <span>Digital Innovation Agency</span>
      </aside>
      <section className="login-panel">
        <Link href="/" className="quiet-link">
          Back to website
        </Link>
        <form onSubmit={submit} className="login-form">
          <h2>Welcome back.</h2>
          <p>Sign in to manage CODEYEA content.</p>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <p role="alert" className="error">
            {error}
          </p>
          <button disabled={busy} className="button">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="small">Access is managed by your administrator.</p>
        </form>
      </section>
    </main>
  );
}
