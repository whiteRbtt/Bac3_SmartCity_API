const UserRouter = require('./user');
const EventRouter = require('./event');
const ProductRouter = require('./product');
const router = require("express").Router();

router.use("/user", UserRouter);
router.use("/event", EventRouter);
router.use("/product", ProductRouter);

module.exports = router;