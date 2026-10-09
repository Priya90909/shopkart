import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

const CATEGORIES = ["Electronics", "Fashion", "Books", "Home"];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Re-fetch from the backend whenever search / category / sort changes
  useEffect(() => {
    setLoading(true);
    setError(false);
    getProducts({ search, category, sort })
      .then((res) => setProducts(res.data.products))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  return (
    <div>
      <h2>Products</h2>
      <div className="filters">
        <SearchBar value={search} onChange={setSearch} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <p className="center">Loading products...</p>}
      {!loading && error && <p className="center error">Something went wrong while loading products.</p>}
      {!loading && !error && products.length === 0 && <p className="center">No products found.</p>}
      {!loading && !error && products.length > 0 && (
        <div className="grid">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}
