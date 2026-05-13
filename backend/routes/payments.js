const router = require('express').Router();
const { processPayment, getMemberPayments, getReceipt } = require('../controller/paymentController');

router.post('/', processPayment);
router.get('/member/:memberId', getMemberPayments);
router.get('/receipt/:receiptNumber', getReceipt);

module.exports = router;