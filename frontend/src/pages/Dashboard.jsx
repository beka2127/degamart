import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Loader2, PackageOpen } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ListingForm from '../components/ListingForm.jsx';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=60';

const Dashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // listing being edited, or null for "new"
  const [deletingId, setDeletingId] = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products/mine/listings');
      setListings(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCreateOrUpdate = async (form) => {
    if (editing) {
      await api.put(`/products/${editing._id}`, form);
    } else {
      await api.post('/products', form);
    }
    setFormOpen(false);
    setEditing(null);
    fetchListings();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setListings((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your Listings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back, {user?.username}.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <Plus size={18} />
          Add New Listing
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500 dark:text-slate-400 gap-2">
          <Loader2 className="animate-spin" size={20} /> Loading your listings...
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950">
          <PackageOpen size={40} className="mb-3" />
          <p>You haven't listed anything yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm dark:shadow-none"
            >
              <img
                src={item.imageUrl || FALLBACK_IMG}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                alt={item.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'}`}>
                    {item.available ? 'Available' : 'Sold out'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.category} · ETB {Number(item.price).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditing(item);
                  setFormOpen(true);
                }}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-300 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 transition"
                title="Edit"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                disabled={deletingId === item._id}
                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition disabled:opacity-50"
                title="Delete"
              >
                {deletingId === item._id ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <ListingForm
          initialData={editing}
          onSubmit={handleCreateOrUpdate}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
