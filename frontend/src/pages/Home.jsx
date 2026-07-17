import React, { useEffect, useState, useCallback } from 'react';
import { Search, PackageSearch, Loader2 } from 'lucide-react';
import api from '../api/axios.js';
import ProductCard from '../components/ProductCard.jsx';
import ProductModal from '../components/ProductModal.jsx';

const CATEGORIES = ['All', 'Tech', 'General'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { search: search || undefined, category },
      });
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300); // debounce search
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Buy & sell tech and everyday goods
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Browse freely, no account needed. Contact sellers directly.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition ${
                category === c
                  ? 'bg-accent border-accent text-white shadow-lg'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400 gap-2">
          <Loader2 className="animate-spin" size={20} /> Loading listings...
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400">
          <PackageSearch size={40} className="mb-3" />
          <p>No listings match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onClick={(p) => setSelectedId(p._id)}
            />
          ))}
        </div>
      )}

      {selectedId && (
        <ProductModal productId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
};

export default Home;
