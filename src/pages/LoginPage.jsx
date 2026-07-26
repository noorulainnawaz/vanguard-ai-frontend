import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://vanguard-ai.fastapicloud.dev";
const GOOGLE_CLIENT_ID = "1007512006670-t9v0b1q7a8qrk12v5mimsgdrfl3m931o.apps.googleusercontent.com";

function GoogleLoginButton({ onLogin, navigate }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    async function handleGoogleResponse(response) {
      try {
        const res = await fetch(`${API_URL}/login/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Google login failed");
        onLogin(data.access_token);
        navigate("/dashboard");
      } catch (err) {
        alert(err.message);
      }
    }

    if (window.google && buttonRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 350,
      });
    }
  }, []);

  return <div ref={buttonRef} className="flex justify-center my-4" />;
}

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      onLogin(data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-9">
        <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="text-slate text-sm mb-7">Log in to access your dashboard</p>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-soft mb-1.5">Email</label>
            <input
              type="email"
              className="w-full border border-black/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-pale focus:border-emerald"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-charcoal-soft mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full border border-black/10 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-pale focus:border-emerald"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate text-xs font-bold">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-emerald text-white font-bold py-3 rounded-lg disabled:opacity-60">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-xs text-slate">OR</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>
        <GoogleLoginButton onLogin={onLogin} navigate={navigate} />

        <p className="text-center text-sm text-slate mt-6">
          Don't have an account? <Link to="/register" className="text-emerald font-bold">Register</Link>
        </p>
        <p className="text-center text-sm text-slate mt-2">
          <Link to="/" className="text-slate hover:text-emerald">← Back to home</Link>
        </p>
      </div>
    </main>
  );
}
