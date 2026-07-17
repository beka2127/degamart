import React from 'react';
import { Tag, Star } from 'lucide-react';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=60';

const ProductCard = ({ product, onClick }) => {
  const averageRating = product.reviews?.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : null;

  return (
    <button
      onClick={() => onClick(product)}
      className="group text-left bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-accent/60 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-accent/10"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img
          src={product.imageUrl || FALLBACK_IMG}
          alt={product.title}
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-accent-light">
            <Tag size={12} />
            {product.category}
          </div>
          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${product.available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'}`}>
            {product.available ? 'Available' : 'Sold out'}
          </span>
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{product.title}</h3>
        <div className="mt-2 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          {averageRating ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={index < Math.round(averageRating) ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}
                />
              ))}
              <span className="ml-1">{averageRating.toFixed(1)}</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{product.description}</p>
        <p className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
          ETB {Number(product.price).toLocaleString()}
        </p>
      </div>
    </button>
  );
};

export default ProductCard;
