import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v.trim())) return setError("All fields are required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    setError("");
    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Create Account</h2>
      <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
      {error && <span className="error">{error}</span>}
      <button disabled={loading}>{loading ? "Creating..." : "Create Account"}</button>
      <span className="muted">Already have an account? <Link to="/login">Login</Link></span>
    </form>
  );
}
