"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Loader2, MessageSquare, Edit2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { addReview, getReviewsAction, deleteReview } from "@/lib/actions";
import type { Review } from "@/lib/types";

export default function RestaurantReviews({ restaurantId }: { restaurantId: number }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await getReviewsAction(restaurantId);
      setReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const myReview = session?.user?.id ? reviews.find(r => r.user_id.toString() === session.user?.id) : undefined;
  const otherReviews = session?.user?.id ? reviews.filter(r => r.user_id.toString() !== session.user?.id) : reviews;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      setError("Zadejte prosím hodnocení (počet hvězdiček).");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    const res = await addReview(restaurantId, stars, reviewText);
    
    setSubmitting(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      setStars(0);
      setReviewText("");
      setIsEditing(false);
      fetchReviews();
    }
  };

  const handleDelete = async () => {
    if (confirm("Opravdu chcete smazat svou recenzi?")) {
      setSubmitting(true);
      const res = await deleteReview(restaurantId);
      setSubmitting(false);
      if (res.error) {
        setError(res.error);
      } else {
        setIsEditing(false);
        setStars(0);
        setReviewText("");
        fetchReviews();
      }
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-6 mb-6 flex flex-col">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4 flex-shrink-0">
        <MessageSquare size={18} />
        <h3>Recenze</h3>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <Loader2 size={24} className="text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {myReview && !isEditing && (
            <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-emerald-300">Vaše recenze</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= myReview.stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-600"} />
                  ))}
                </div>
              </div>
              {myReview.review && <p className="text-sm text-neutral-300 mb-3">{myReview.review}</p>}
              <div className="flex gap-3 mt-2 pt-3 border-t border-emerald-500/10">
                <button 
                  onClick={() => {
                    setStars(myReview.stars);
                    setReviewText(myReview.review || "");
                    setIsEditing(true);
                  }} 
                  className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Edit2 size={12} /> Upravit
                </button>
                <button onClick={handleDelete} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors" disabled={submitting}>
                  <Trash2 size={12} /> Odstranit
                </button>
              </div>
            </div>
          )}

          {otherReviews.length > 0 ? (
            otherReviews.map((r) => (
              <div key={`${r.user_id}-${r.restaurant_id}`} className="bg-neutral-800/40 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm text-white">{r.username || "Anonym"}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={14} className={s <= r.stars ? "fill-yellow-400 text-yellow-400" : "text-neutral-600"} />
                    ))}
                  </div>
                </div>
                {r.review && <p className="text-sm text-neutral-300">{r.review}</p>}
              </div>
            ))
          ) : (!myReview && (
            <p className="text-sm text-neutral-400 text-center py-4">Zatím nejsou žádné recenze. Buďte první!</p>
          ))}
        </div>
      )}

      {session ? (
        (!myReview || isEditing) && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-white">{isEditing ? "Upravit recenzi" : "Napsat recenzi"}</h4>
              {isEditing && (
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-neutral-400 hover:text-white">
                  Zrušit
                </button>
              )}
            </div>
            
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHoverStars(s)}
                  onMouseLeave={() => setHoverStars(0)}
                  className="focus:outline-none"
                >
                  <Star 
                    size={20} 
                    className={`transition-colors ${
                      s <= (hoverStars || stars) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-neutral-600 hover:text-yellow-400/50"
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Vaše zkušenost (volitelné)..."
              className="w-full bg-neutral-900/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 resize-none h-24"
            />
            
            {error && <p className="text-xs text-red-400">{error}</p>}
            
            <button 
              type="submit" 
              disabled={submitting || stars === 0}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? "Uložit změny" : "Odeslat hodnocení")}
            </button>
          </form>
        )
      ) : (
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-sm text-neutral-400">Chcete ohodnotit restauraci?</p>
          <a href="/login" className="inline-block mt-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
            Přihlaste se
          </a>
        </div>
      )}
    </div>
  );
}
