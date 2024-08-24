const express = require("express");
const {
  viewOffers,
  loadCreateOffer,
  addOffer,
  loadEditOffer,
  editOffer,
  activeOffer,
  inactiveOffer,
  removeOffer,
} = require("../../controllers/adminControllers/adminOfferController");
const isAdmin = require("../../middleware/isAdmin");
const offerRoute = express.Router();

offerRoute.get("/show-offers", isAdmin, viewOffers);
offerRoute.get("/createOffer", isAdmin, loadCreateOffer);
offerRoute.post("/createOffer", isAdmin, addOffer);
offerRoute.get("/edit-offer/:offerId", isAdmin, loadEditOffer);
offerRoute.post("/editOffer/:offerId", isAdmin, editOffer);
offerRoute.get("/activate-offer/:offerId", isAdmin, activeOffer);
offerRoute.get("/deactivate-offer/:offerId", isAdmin, inactiveOffer);
offerRoute.get("/delete-offer/:offerId", isAdmin, removeOffer);


module.exports = offerRoute;
