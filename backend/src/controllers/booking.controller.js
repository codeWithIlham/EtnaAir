const bookingService = require("../services/booking.service");

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getAllBookings(req.user.id, req.user.role);
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(parseInt(req.params.id));
    res.status(200).json(booking);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user.id);
    res.status(201).json(booking);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    await bookingService.deleteBooking(parseInt(req.params.id));
    res.status(200).json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const booking = await bookingService.updateStatus(
      parseInt(req.params.id),
      req.body.status,
      req.user.id,
      req.user.role
    );
    res.json(booking);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
