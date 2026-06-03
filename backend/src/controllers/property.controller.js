const propertyService = require("../services/property.service");

exports.getAllProperties = async (req, res) => {
  try {
    const filters = {
      city:          req.query.city,
      max_price:     req.query.max_price,
      min_price:     req.query.min_price,
      property_type: req.query.property_type,
      min_guests:    req.query.min_guests,
      page:          req.query.page,
      limit:         req.query.limit,
    };
    const properties = await propertyService.getAllProperties(filters);
    const pagination = properties._pagination;
    // Injecter les infos de pagination dans les headers HTTP (RFC standard)
    if (pagination) {
      res.setHeader("X-Total-Count",  pagination.total);
      res.setHeader("X-Total-Pages",  pagination.totalPages);
      res.setHeader("X-Current-Page", pagination.page);
      res.setHeader("X-Per-Page",     pagination.limit);
      res.setHeader("X-Has-Next",     pagination.hasNext);
      res.setHeader("X-Has-Prev",     pagination.hasPrev);
      delete properties._pagination;
    }
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(parseInt(req.params.id));
    res.status(200).json(property);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "host" && role !== "admin") {
      return res.status(403).json({ message: "Only hosts can create properties" });
    }

    const { title, description, price_per_night, max_guests } = req.body;
    if (!title || !description || price_per_night === undefined || !max_guests) {
      return res.status(400).json({ message: "Missing required fields: title, description, price_per_night, max_guests" });
    }

    const property = await propertyService.createProperty({
      ...req.body,
      owner_id: req.user.id,
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await propertyService.updateProperty(
      parseInt(req.params.id),
      req.body
    );
    res.status(200).json(property);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    await propertyService.deleteProperty(parseInt(req.params.id));
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
