import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import axiosInstance from "../../utils/axios.js";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axiosInstance.get("/feedback/admin");
        if (response.data.success) {
          setFeedbacks(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading feedback data...</div>;
  }

  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-lg">No feedback received yet.</p>
        <p className="text-sm">When customers submit feedback, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-24 sm:pb-8 px-4 sm:px-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Customer Feedback</h1>
        <p className="text-xs sm:text-sm text-slate-500">View and manage feedback submitted by your customers.</p>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {feedbacks.map((fb) => (
          <div key={fb.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800 truncate" title={fb.event?.title}>{fb.event?.title}</h3>
                <p className="text-xs text-slate-500">{new Date(fb.event?.date).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 mt-1">Customer: {fb.event?.customer?.name}</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-yellow-700">{fb.overallRating}</span>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 text-sm text-slate-600 flex-grow">
              <div className="flex justify-between">
                <span>Food Quality</span>
                <span className="font-medium">{fb.foodQuality}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Service</span>
                <span className="font-medium">{fb.serviceRating}/5</span>
              </div>
              <div className="flex justify-between">
                <span>Staff</span>
                <span className="font-medium">{fb.staffBehavior}/5</span>
              </div>
            </div>

            {fb.comment && (
              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-sm italic text-slate-600">"{fb.comment}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackList;
