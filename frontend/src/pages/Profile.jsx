import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    telegram: '',
    facebook: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      username: user.username || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      telegram: user.telegram || '',
      facebook: user.facebook || '',
    });
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await updateProfile(form);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-full bg-accent text-white p-3">
          <User size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">Update your seller profile and contact details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm dark:shadow-none">
        {error && <p className="text-sm text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-950/40 rounded-lg px-4 py-3">{error}</p>}
        {success && <p className="text-sm text-emerald-700 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/40 rounded-lg px-4 py-3">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone number</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telegram</label>
            <input
              name="telegram"
              value={form.telegram}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
          <input
            name="facebook"
            value={form.facebook}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 transition disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Back to dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
