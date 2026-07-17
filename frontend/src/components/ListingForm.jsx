import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const CATEGORIES = ['Tech', 'General'];

const ListingForm = ({ initialData, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    price: initialData?.price || '',
    category: initialData?.category || 'Tech',
    description: initialData?.description || '',
    location: initialData?.location || '',
    available: initialData?.available ?? true,
    soldOutMessage: initialData?.soldOutMessage || '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPreviewUrl(initialData?.imageUrl || '');
    setImageFile(null);
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(initialData?.imageUrl || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('location', form.location);
    formData.append('available', form.available);
    formData.append('soldOutMessage', form.soldOutMessage || '');
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Listing' : 'Add New Listing'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 dark:text-slate-300 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g. Mechanical Keyboard"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (ETB)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="e.g. Addis Ababa, Bole"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={(e) => setForm({ ...form, available: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
              />
              Mark as available
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sold out message (optional)</label>
            <input
              name="soldOutMessage"
              value={form.soldOutMessage}
              onChange={handleChange}
              placeholder="Message shown when this item is sold out"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Describe condition, specs, pickup details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image</label>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-700 dark:text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 dark:file:bg-slate-800 file:text-accent hover:file:bg-slate-200 dark:hover:file:bg-slate-700"
            />
            {previewUrl && (
              <div className="mt-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Preview</p>
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="w-full h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            {initialData ? 'Save Changes' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListingForm;
