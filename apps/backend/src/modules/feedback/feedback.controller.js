import { prisma } from "../../utils/prisma.js";
import crypto from "crypto";

// @desc    Get feedback details for public form via token
// @route   GET /api/v1/feedback/public/:token
// @access  Public
export const getFeedbackByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { token },
      include: {
        event: {
          select: {
            title: true,
            date: true}},
        tenant: {
          select: {
            name: true,
            logoUrl: true}}}});

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Invalid or expired feedback link." });
    }

    if (feedback.status === "submitted") {
      return res.status(400).json({ success: false, message: "Feedback has already been submitted for this event.", status: feedback.status });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error("Error fetching feedback by token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Submit feedback via public form
// @route   POST /api/v1/feedback/public/:token
// @access  Public
export const submitFeedback = async (req, res) => {
  try {
    const { token } = req.params;
    const { overallRating, foodQuality, serviceRating, staffBehavior, comment, photos } = req.body;

    const feedback = await prisma.feedback.findUnique({
      where: { token }});

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Invalid or expired feedback link." });
    }

    if (feedback.status === "submitted") {
      return res.status(400).json({ success: false, message: "Feedback has already been submitted." });
    }

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { token },
      data: {
        overallRating,
        foodQuality,
        serviceRating,
        staffBehavior,
        comment,
        photos: photos || [],
        status: "submitted",
        submittedAt: new Date()}});

    res.status(200).json({ success: true, message: "Feedback submitted successfully.", data: updatedFeedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get all feedback for a tenant (Admin)
// @route   GET /api/v1/feedback
// @access  Private (Admin/Manager)
export const getTenantFeedbacks = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const MAX_LIMIT = 100;
    const limitNum = Math.min(Number(limit) || 50, MAX_LIMIT);
    const pageNum = Math.max(Number(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;
    

    // Optional feature check: verify if the tenant has POST_EVENT_FEEDBACK feature enabled.
    // In single-tenant we can just assume true or check global settings
    const hasFeedbackFeature = true;
    if (!hasFeedbackFeature) {
      return res.status(403).json({ success: false, message: "Feedback feature is not enabled for this tenant." });
    }

    const whereClause = {
      
      status: "submitted"};

    const [total, feedbacks] = await Promise.all([
      prisma.feedback.count({ where: whereClause }),
      prisma.feedback.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              title: true,
              date: true,
              customer: {
                select: {
                  name: true,
                  phone: true}
              }
            }}},
        orderBy: {
          submittedAt: "desc"},
        take: limitNum,
        skip})
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error("Error fetching tenant feedbacks:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get or generate feedback link for an event (Admin)
// @route   GET /api/v1/feedback/admin/link/:eventId
// @access  Private (Admin/Manager)
export const getFeedbackLinkForEvent = async (req, res) => {
  try {
    
    const { eventId } = req.params;

    // Verify feature is enabled
    const hasFeedbackFeature = true;
    if (!hasFeedbackFeature) {
      return res.status(403).json({ success: false, message: "Feedback feature is not enabled for this tenant." });
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    let feedback = await prisma.feedback.findFirst({
      where: { eventId }
    });

    if (!feedback) {
      const token = crypto.randomBytes(32).toString("hex");
      feedback = await prisma.feedback.create({
        data: {
          
          eventId,
          token,
          status: "pending"}});
    }

    const feedbackUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/feedback/${feedback.token}`;

    res.status(200).json({ success: true, url: feedbackUrl, token: feedback.token });
  } catch (error) {
    console.error("Error getting feedback link:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get top reviews for public website display
// @route   GET /api/v1/feedback/website/:// @access  Public
export const getWebsiteReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // optimize by limiting by default

    // No tenant verification needed in single-tenant mode

    const feedbacks = await prisma.feedback.findMany({
      where: {
        
        status: "submitted",
        overallRating: { gte: 4 }, // Only show good reviews (4 and 5 stars) for safety/optimization
        comment: { not: null, not: "" } // Ensure they have a comment
      },
      select: {
        id: true,
        overallRating: true,
        comment: true,
        submittedAt: true,
        event: {
          select: {
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: "desc", // Latest reviews first
      },
      take: limit});

    // Format the data specifically for the website
    const formattedReviews = feedbacks.map(f => {
      const customerName = f.event?.customer?.name || "Anonymous";
      const profileInitial = customerName.charAt(0).toUpperCase();
      
      return {
        id: f.id,
        customerName: customerName,
        profileInitial: profileInitial,
        starRating: f.overallRating,
        description: f.comment,
        date: f.submittedAt
      };
    });

    res.status(200).json({ 
      success: true, 
      count: formattedReviews.length, 
      data: formattedReviews 
    });
  } catch (error) {
    console.error("Error fetching website reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
