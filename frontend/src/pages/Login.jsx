import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";
import { useCart } from "../context/CartContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(form);
      await refreshCart(); // load this user's cart into shared state
      navigate("/home");
    } catch {
      setError("Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
      {error && <span className="error">{error}</span>}
      <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      <span className="muted">New here? <Link to="/register">Create an account</Link></span>
    </form>
  );
}
