const ProductOffer = require("../models/offerSchema");

const updateOfferStatuses = async () => {
  const now = new Date();
  try {
    await Promise.all([
      ProductOffer.updateMany(
        {
          startDate: { $lte: now },
          endDate: { $gt: now },
          isActive: false,
        },
        { $set: { isActive: true } }
      ),
      ProductOffer.updateMany(
        { endDate: { $lte: now }, isActive: true },
        { $set: { isActive: false } }
      ),
    ]);
    console.log("Offer statuses updated successfully");
  } catch (error) {
    console.error("Error updating offer statuses:", error);
  }
};

module.exports = {
  updateOfferStatuses,
};
