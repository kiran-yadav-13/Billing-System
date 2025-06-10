const express = require('express');
const router = express.Router();
const { createBusinessProfile, getBusinessProfile } = require('../controllers/businessController');
const {auth} = require("../middlewares/authMiddleware");

router.post('/createprofile', auth, createBusinessProfile);  
router.get('/getprofile', auth, getBusinessProfile);      

module.exports = router;
