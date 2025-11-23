const express = require('express');

const router = express.Router();
const { authenticate } = require('../middleware/auth');

const {
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers, 
    getUserByEmail,
    loginUser,
    getUserProfile,
    updateUserProfile
  } = require('../controllers/users');

  // Public routes
  router.post('/login', loginUser);
  
  router.route('/')
  .get(getAllUsers)
  .post(createUser);

  // Profile routes (need auth middleware)
  router.route('/profile')
  .get(authenticate, getUserProfile)
  .put(authenticate, updateUserProfile);

  router.route('/:id')
  .get(getUser)
  .put(updateUser) 
  .delete(deleteUser);

  router.route('/email/:email')
  .get(getUserByEmail);


  module.exports = router;