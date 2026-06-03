const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/service.controller");
const auth    = require("../middlewares/auth.middleware");

router.get("/",              ctrl.getAll);
router.get("/my-bookings",   auth, ctrl.myBookings);
router.get("/:id",           ctrl.getById);
router.post("/",             auth, ctrl.create);
router.put("/:id",           auth, ctrl.update);
router.delete("/:id",        auth, ctrl.delete);
router.post("/:id/book",     auth, ctrl.book);

module.exports = router;
