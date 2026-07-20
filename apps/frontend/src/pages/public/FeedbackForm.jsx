import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, CheckCircle, AlertCircle, HeartHandshake, Sparkles, Send } from "lucide-react";
import axiosInstance from "../../utils/axios.js";
import { motion, AnimatePresence } from "framer-motion";

const FeedbackForm = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const [ratings, setRatings] = useState({
    overallRating: 0,
    foodQuality: 0,
    serviceRating: 0,
    staffBehavior: 0,
  });
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState({ field: null, value: 0 });

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const response = await axiosInstance.get(`/feedback/public/${token}`);
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        if (err.response?.data?.status === "submitted") {
          setSuccess(true);
        } else {
          setError(err.response?.data?.message || "Invalid or expired feedback link.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbackData();
  }, [token]);

  const handleRating = (field, value) => {
    setRatings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ratings.overallRating) {
      alert("Please provide an overall rating.");
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post(`/feedback/public/${token}`, {
        ...ratings,
        comment
      });
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ label, field, value, required }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value > 0 && (
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
            {value} / 5
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar({ field, value: star })}
            onMouseLeave={() => setHoveredStar({ field: null, value: 0 })}
            onClick={() => handleRating(field, star)}
            className="focus:outline-none p-1 -ml-1 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={26}
              strokeWidth={1.5}
              className={`transition-colors ${
                star <= (hoveredStar.field === field && hoveredStar.value > 0 ? hoveredStar.value : value)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-100 text-slate-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Oops!</h2>
          <p className="text-slate-600 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-sm w-full text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your feedback helps us create better experiences. We truly appreciate your time!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans flex flex-col items-center justify-center selection:bg-primary-500 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 sm:px-8 text-center border-b border-slate-100 bg-white">
            {data?.tenant?.logoUrl ? (
              <img 
                src={data.tenant.logoUrl} 
                alt="Logo" 
                className="h-12 mx-auto mb-4 object-contain" 
              />
            ) : (
              <div className="w-12 h-12 bg-primary-50 rounded-xl mx-auto mb-4 flex items-center justify-center text-primary-600 font-black text-xl">
                {data?.tenant?.name?.charAt(0) || 'C'}
              </div>
            )}
            
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 tracking-tight">How did we do?</h1>
            <p className="text-slate-500 text-sm">
              Rate your experience at <strong className="text-slate-800">{data?.event?.title}</strong>
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              <StarRating 
                label="Overall Experience" 
                field="overallRating"  
                value={ratings.overallRating} 
                required
              />
              
              <div className="w-full h-px bg-slate-100" />
              
              <div className="grid sm:grid-cols-2 gap-6">
                <StarRating 
                  label="Food Quality" 
                  field="foodQuality" 
                  value={ratings.foodQuality} 
                />
                <StarRating 
                  label="Service & Staff" 
                  field="serviceRating" 
                  value={ratings.serviceRating} 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Any additional thoughts?
                </label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none text-sm text-slate-700 placeholder:text-slate-400"
                  placeholder="Tell us what you loved or how we can improve..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold text-sm py-3 px-6 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
                {!submitting && <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          Powered by <strong className="text-slate-500">doOs</strong> Catering Management
        </p>
      </motion.div>
    </div>
  );
};

export default FeedbackForm;
