import { Link, useOutletContext } from "react-router-dom";

export default function Home() {
  const { user } = useOutletContext();

  return (
    <div>
      <h2>Welcome, {user.fullName} 👋</h2>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
      <Link className="btn" to="/products">Browse Products</Link>
    </div>
  );
}
