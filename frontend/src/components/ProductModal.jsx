import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, Phone, User, Tag, Loader2, MessageCircle, Globe2, Star } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';

const ProductModal = ({ productId, onClose }) => {
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/products/${productId}`)
      .then(({ data }) => active && setProduct(data.product))
      .catch(() => active && setError('Could not load this listing.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    if (!product || !user) return;
    const existingReview = product.reviews?.find(
      (review) => String(review.userId) === String(user.id || user._id)
    );
    if (existingReview) {
      setReviewRating(existingReview.rating);
      setReviewComment(existingReview.comment);
    } else {
      setReviewRating(5);
      setReviewComment('');
    }
  }, [product, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);

    try {
      const { data } = await api.post(`/products/${productId}/review`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setProduct(data.product);
    } catch (err) {
      setReviewError(err?.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = product?.reviews?.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400 gap-2">
            <Loader2 className="animate-spin" size={18} /> Loading...
          </div>
        )}

        {error && <p className="px-6 pb-8 text-red-600 dark:text-red-300">{error}</p>}

        {product && !loading && (
          <div className="px-6 pb-6">
            <img
              src={product.imageUrl || FALLBACK_IMG}
              alt={product.title}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              className="w-full aspect-[4/3] object-cover rounded-xl mb-5"
            />

            <div className="flex items-center gap-1.5 text-xs font-medium text-accent-light mb-2">
              <Tag size={12} />
              {product.category}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{product.title}</h2>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'}`}>
                {product.available ? 'Available' : 'Sold out'}
              </span>
            </div>
            <p className="text-2xl font-bold text-accent-light mt-1">
              ETB {Number(product.price).toLocaleString()}
            </p>
            {product.location && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Location: {product.location}</p>
            )}
            <p className="text-slate-700 dark:text-slate-300 mt-4 leading-relaxed">{product.description}</p>

            {!product.available && product.soldOutMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-200">
                {product.soldOutMessage}
              </div>
            )}

            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                Ratings
              </h3>
              <div className="space-y-4 text-slate-700 dark:text-slate-200">
                {product.reviews?.length ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                        {averageRating?.toFixed(1)}
                        <span className="text-sm text-slate-500 dark:text-slate-400">/ 5</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">({product.reviews.length} review{product.reviews.length > 1 ? 's' : ''})</span>
                    </div>
                    <div className="space-y-3">
                      {product.reviews.map((review) => (
                        <div key={`${review.userId}-${review.createdAt}`} className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-900 dark:text-white">{review.username}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-2 text-amber-500">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                size={14}
                                className={index < review.rating ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}
                              />
                            ))}
                          </div>
                          {review.comment && <p className="text-slate-600 dark:text-slate-300 mt-2">{review.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">No ratings yet. Be the first to review this item.</p>
                )}

                {user ? (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setReviewRating(value)}
                            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                            className="rounded-full p-2 transition focus:outline-none focus:ring-2 focus:ring-accent"
                          >
                            <Star
                              size={18}
                              fill={reviewRating >= value ? 'currentColor' : 'none'}
                              className={
                                reviewRating >= value
                                  ? 'text-amber-500'
                                  : 'text-slate-300 dark:text-slate-700'
                              }
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Share your experience..."
                      />
                    </div>
                    {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="rounded-lg bg-accent hover:bg-accent-dark text-white font-semibold px-4 py-2 disabled:opacity-60 transition"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit your review'}
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <Link to="/login" className="text-accent-light hover:underline">
                      Log in
                    </Link>{' '}
                    to leave a review.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                Seller Contact
              </h3>
              {product.seller ? (
                <div className="space-y-2 text-slate-700 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-accent-light" />
                    <span className="text-slate-900 dark:text-white">{product.seller.username}</span>
                  </div>
                  <a
                    href={`mailto:${product.seller.email}`}
                    className="flex items-center gap-2 hover:text-accent-light transition"
                  >
                    <Mail size={16} className="text-accent-light" />
                    {product.seller.email}
                  </a>
                  {product.seller.phoneNumber && (
                    <a
                      href={`tel:${product.seller.phoneNumber}`}
                      className="flex items-center gap-2 hover:text-accent-light transition"
                    >
                      <Phone size={16} className="text-accent-light" />
                      {product.seller.phoneNumber}
                    </a>
                  )}
                  {product.seller.telegram && (
                    <a
                      href={`https://t.me/${product.seller.telegram.replace(/^@/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 hover:text-accent-light transition"
                    >
                      <MessageCircle size={16} className="text-accent-light" />
                      {product.seller.telegram}
                    </a>
                  )}
                  {product.seller.facebook && (
                    <a
                      href={
                        product.seller.facebook.includes('facebook.com')
                          ? product.seller.facebook
                          : `https://facebook.com/${product.seller.facebook}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 hover:text-accent-light transition"
                    >
                      <Globe2 size={16} className="text-accent-light" />
                      {product.seller.facebook}
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">Seller information unavailable.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
