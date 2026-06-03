const reviewService = require("../services/review.service");

exports.getReviewsByProperty = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByProperty(parseInt(req.params.id));
    res.status(200).json(reviews);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { property_id, booking_id, rating, comment } = req.body;

    if (!property_id) {
      return res.status(400).json({ message: "property_id is required" });
    }
    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const review = await reviewService.createReview({
      property_id: parseInt(property_id),
      booking_id: booking_id ? parseInt(booking_id) : null,
      rating: parseInt(rating),
      comment: comment.trim(),
      reviewer_id: req.user.id,
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
