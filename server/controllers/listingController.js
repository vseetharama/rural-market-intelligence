const mongoose = require('mongoose');
const ProductListing = require('../models/ProductListing');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function formatValidationError(error) {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }
  return error.message || 'Invalid request data';
}

async function getListings(req, res) {
  try {
    const {
      product,
      category,
      location,
      minPrice,
      maxPrice,
      status = 'ACTIVE',
      sellerRole,
      search,
      available,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (product) {
      filter.product = new RegExp(product, 'i');
    }

    if (category) {
      filter.category = new RegExp(category, 'i');
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    if (search) {
      filter.$or = [
        { product: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (available === 'true') {
      const now = new Date();
      filter.availableFrom = { $lte: now };
      filter.$and = [
        {
          $or: [{ availableUntil: null }, { availableUntil: { $gte: now } }],
        },
      ];
    }

    let listings = await ProductListing.find(filter)
      .populate('seller', 'name email phone role location')
      .sort({ createdAt: -1 });

    if (sellerRole) {
      listings = listings.filter(
        (listing) => listing.seller && listing.seller.role === sellerRole.toUpperCase()
      );
    }

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load listings' });
  }
}

async function getMyListings(req, res) {
  try {
    const listings = await ProductListing.find({ seller: req.user._id })
      .populate('seller', 'name email phone role location')
      .sort({ createdAt: -1 });

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load your listings' });
  }
}

async function getListingById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid listing ID' });
    }

    const listing = await ProductListing.findById(id).populate(
      'seller',
      'name email phone role location'
    );

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load listing' });
  }
}

async function createListing(req, res) {
  try {
    if (!['FARMER', 'VENDOR'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only farmers and vendors can create listings' });
    }

    const {
      product,
      category,
      description,
      quantity,
      unit,
      price,
      location,
      availableFrom,
      availableUntil,
    } = req.body;

    if (!product || !category || quantity === undefined || !unit || price === undefined || !location) {
      return res.status(400).json({ message: 'Required listing fields are missing' });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    if (Number(price) < 0) {
      return res.status(400).json({ message: 'Price must be greater than or equal to 0' });
    }

    const listing = await ProductListing.create({
      seller: req.user._id,
      product: String(product).trim(),
      category: String(category).trim(),
      description: description ? String(description).trim() : '',
      quantity: Number(quantity),
      unit: String(unit).trim(),
      price: Number(price),
      location: String(location).trim(),
      availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
      availableUntil: availableUntil ? new Date(availableUntil) : null,
      status: 'ACTIVE',
    });

    const populated = await listing.populate('seller', 'name email phone role location');
    res.status(201).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: formatValidationError(error) });
    }
    res.status(500).json({ message: 'Unable to create listing' });
  }
}

async function updateListing(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid listing ID' });
    }

    const listing = await ProductListing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const allowed = [
      'product',
      'category',
      'description',
      'quantity',
      'unit',
      'price',
      'location',
      'availableFrom',
      'availableUntil',
      'status',
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    }

    if (listing.quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be greater than or equal to 0' });
    }

    if (listing.price < 0) {
      return res.status(400).json({ message: 'Price must be greater than or equal to 0' });
    }

    if (listing.quantity === 0 && listing.status === 'ACTIVE') {
      listing.status = 'SOLD';
    }

    await listing.save();
    const populated = await listing.populate('seller', 'name email phone role location');
    res.status(200).json(populated);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: formatValidationError(error) });
    }
    res.status(500).json({ message: 'Unable to update listing' });
  }
}

async function deleteListing(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid listing ID' });
    }

    const listing = await ProductListing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only cancel your own listings' });
    }

    listing.status = 'CANCELLED';
    await listing.save();

    res.status(200).json({ message: 'Listing cancelled successfully', listing });
  } catch (error) {
    res.status(500).json({ message: 'Unable to cancel listing' });
  }
}

module.exports = {
  getListings,
  getMyListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
};
