const router = require('express').Router();
const { getAllPlans, getPlanById, createPlan, updatePlan, deletePlan } = require('../controller/plans');

router.get('/', getAllPlans);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;