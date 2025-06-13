const express = require('express');
const router = express.Router();
const { createBusinessProfile, getBusinessProfile ,updateBusinessProfile} = require('../controllers/businessController');
const {auth, adminOnly} = require("../middlewares/authMiddleware");

router.post('/createprofile', auth,adminOnly, createBusinessProfile);  
router.get('/getprofile', auth, getBusinessProfile);      
router.post('/updateprofile', auth,adminOnly, updateBusinessProfile); 
module.exports = router;
