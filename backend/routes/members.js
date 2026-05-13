const router = require('express').Router();
const { getAllMembers, createMember, updateMember, deleteMember, getExpiringMembers } = require('../controller/memberController');
const { adminMiddleware } = require('../middleware/auth');

router.get('/', adminMiddleware,getAllMembers);
router.get('/expiring',adminMiddleware, getExpiringMembers);
router.post('/', adminMiddleware, createMember);
router.put('/:id', adminMiddleware, updateMember);
router.delete('/:id', adminMiddleware, deleteMember);

module.exports = router;