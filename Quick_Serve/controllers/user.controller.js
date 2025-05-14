const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

const userController = {};

userController.getProfile = async (req, res) => {
  try {
    const userId = req.mwValue?.auth?.id;
    if (!userId) {
      return res.error(
        HttpStatus.UNAUTHORIZED,
        "false",
        ResponseMessages.UNAUTHORIZED,
        { code: "AUTH_REQUIRED" }
      );
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.error(
        HttpStatus.NOT_FOUND,
        "false",
        ResponseMessages.NOT_FOUND,
        { code: "USER_NOT_FOUND", userId }
      );
    }

    return res.success(
      HttpStatus.OK,
      "true",
      "Profile retrieved successfully",
      user
    );
  } catch (error) {
    console.error("[User Controller] Error fetching profile:", error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { code: "PROFILE_FETCH_ERROR", message: error.message }
    );
  }
};

userController.updateProfile = async (req, res) => {
  try {
    const userId = req.mwValue?.auth?.id;
    if (!userId) {
      return res.error(
        HttpStatus.UNAUTHORIZED,
        "false",
        ResponseMessages.UNAUTHORIZED,
        { code: "AUTH_REQUIRED" }
      );
    }

    const { first_name, last_name, business_name, phone_number, business_address, business_phone, business_email } = req.body;

    // Validate if at least one field is provided for update
    if (!first_name && !last_name && !business_name && !phone_number && !business_address && !business_phone && !business_email) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "At least one field is required for update",
        { code: "NO_UPDATE_FIELDS" }
      );
    }

    // Validate business information fields
    if (business_address && business_address.trim().length === 0) {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Invalid business address format",
        { field: 'business_address', requirement: 'Business address cannot be empty' }
      );
    }

    // Build update object with validation
    const updates = {};
    
    if (first_name) {
      if (!/^[a-zA-Z\s]+$/.test(first_name) || first_name.length < 2) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid first name format",
          { field: 'first_name', requirement: 'Must contain only letters and spaces, minimum 2 characters' }
        );
      }
      updates.first_name = first_name;
    }

    if (last_name) {
      if (!/^[a-zA-Z\s]+$/.test(last_name) || last_name.length < 2) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid last name format",
          { field: 'last_name', requirement: 'Must contain only letters and spaces, minimum 2 characters' }
        );
      }
      updates.last_name = last_name;
    }

    if (business_name) {
      if (business_name.length < 2) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid business name format",
          { field: 'business_name', requirement: 'Minimum 2 characters required' }
        );
      }
      updates.business_name = business_name;
    }

    if (phone_number) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid phone number format",
          { field: 'phone_number', requirement: 'Must be 10 digits' }
        );
      }
      updates.phone_number = phone_number;
    }

    if (business_address) {
      const trimmedAddress = business_address.trim();
      if (trimmedAddress.length === 0) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid business address format",
          { field: 'business_address', requirement: 'Business address cannot be empty' }
        );
      }
      updates.business_address = trimmedAddress;
    }

    if (business_phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(business_phone)) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid business phone format",
          { field: 'business_phone', requirement: 'Must be 10 digits' }
        );
      }
      updates.business_phone = business_phone;
    }

    if (business_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(business_email)) {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid business email format",
          { field: 'business_email', requirement: 'Must be a valid email address' }
        );
      }
      updates.business_email = business_email.toLowerCase().trim();
    }

    // Attempt to update the user with validation
    let user;
    try {
      user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.error(
          HttpStatus.NOT_FOUND,
          "false",
          ResponseMessages.NOT_FOUND,
          { code: "USER_NOT_FOUND", userId }
        );
      }
    } catch (updateError) {
      if (updateError.name === 'ValidationError') {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Validation error",
          Object.values(updateError.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        );
      }
      throw updateError;
    }

    return res.success(
      HttpStatus.OK,
      "true",
      "Profile updated successfully",
      user
    );
  } catch (error) {
    console.error("[User Controller] Error updating profile:", error);
    if (error.name === 'ValidationError') {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Validation error",
        Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      );
    }
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { code: "PROFILE_UPDATE_ERROR", message: error.message }
    );
  }
};

userController.getProfile = async (req, res) => {
  try {
    const userId = req.mwValue?.auth?.id;
    if (!userId) {
      return res.error(
        HttpStatus.UNAUTHORIZED,
        "false",
        ResponseMessages.UNAUTHORIZED,
        { code: "AUTH_REQUIRED" }
      );
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.error(
        HttpStatus.NOT_FOUND,
        "false",
        ResponseMessages.NOT_FOUND,
        { code: "USER_NOT_FOUND", userId }
      );
    }

    return res.success(
      HttpStatus.OK,
      "true",
      "Profile retrieved successfully",
      user
    );
  } catch (error) {
    console.error("[User Controller] Error fetching profile:", error);
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { code: "PROFILE_FETCH_ERROR", message: error.message }
    );
  }
};

userController.signup = async (req, res) => {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.error('[User Controller] MongoDB connection is not ready');
      return res.error(
        HttpStatus.SERVICE_UNAVAILABLE,
        "false",
        "Database service is temporarily unavailable. Please try again later.",
        { code: "DB_CONNECTION_ERROR", retryAfter: 30 }
      );
    }

    console.log('[User Controller] Processing signup request:', {
      user_name: req.body.user_name,
      email: req.body.email,
      business_name: req.body.business_name
    });

    const { user_name, first_name, last_name, business_name, email, password, phone_number, role } = req.body;

    // Validate required fields and password strength
    if (!user_name || !first_name || !last_name || !business_name || !email || !password || !phone_number) {
      console.log('[User Controller] Signup validation failed: Missing required fields');
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "All fields are required",
        { missingFields: ['user_name', 'first_name', 'last_name', 'business_name', 'email', 'password', 'phone_number'].filter(field => !req.body[field]) }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('[User Controller] Signup validation failed: Password requirements not met');
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character",
        { field: 'password', requirement: 'strength' }
      );
    }

    // Check if user already exists with detailed error handling
    try {
      const existingUser = await User.findOne({ $or: [{ user_name }, { email }, { phone_number }] });
      if (existingUser) {
        const duplicateField = existingUser.user_name === user_name ? 'username' : 'email';
        console.log(`[User Controller] Duplicate ${duplicateField} found:`, {
          attempted: duplicateField === 'username' ? user_name : email
        });
        return res.error(
          HttpStatus.CONFLICT,
          "false",
          `User already exists with this ${duplicateField}`,
          { 
            code: "DUPLICATE_USER",
            field: duplicateField,
            value: duplicateField === 'username' ? user_name : email 
          }
        );
      }
    } catch (findError) {
      console.error('[User Controller] Error checking existing user:', findError);
      throw findError;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with error handling
    let user;
    try {
      user = await User.create({
        user_name,
        first_name,
        last_name,
        business_name,
        email,
        password: hashedPassword,
        phone_number,
        role: role || 'customer'
      });
    } catch (createError) {
      console.error('[User Controller] Error creating user:', createError);
      if (createError.name === 'ValidationError') {
        return res.error(
          HttpStatus.BAD_REQUEST,
          "false",
          "Invalid user data provided",
          Object.values(createError.errors).map(err => ({
            field: err.path,
            message: err.message
          }))
        );
      }
      throw createError;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "false",
        "Server configuration error",
        null
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, user_name: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.success(
      HttpStatus.CREATED,
      "true",
      ResponseMessages.SAVE,
      {
        token,
        user: {
          id: user._id,
          user_name: user.user_name,
          first_name: user.first_name,
          last_name: user.last_name,
          business_name: user.business_name,
          email: user.email,
          phone_number: user.phone_number
        }
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Validation error",
        Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      );
    }
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { 
        code: "SIGNUP_ERROR",
        message: error.message || "An unexpected error occurred during signup" 
      }
    );
  }
};

userController.login = async (req, res) => {
  try {
    // Check MongoDB connection status
    if (mongoose.connection.readyState !== 1) {
      console.error('[User Controller] MongoDB connection is not ready');
      return res.error(
        HttpStatus.SERVICE_UNAVAILABLE,
        "false",
        "Database service is temporarily unavailable",
        { code: "DB_CONNECTION_ERROR" }
      );
    }

    console.log('[User Controller] Processing login request:', {
      user_name: req.body.user_name
    });

    const { user_name, password } = req.body;

    // Find user with detailed error handling
    let user;
    try {
      user = await User.findOne({ user_name });
      console.log('[User Controller] User lookup result:', {
        found: !!user,
        user_name: user_name
      });
      if (!user) {
        return res.error(
          HttpStatus.UNAUTHORIZED,
          "false",
          "Invalid username or password",
          { code: "INVALID_CREDENTIALS", field: "user_name" }
        );
      }
    } catch (findError) {
      console.error('[User Controller] Error finding user:', findError);
      throw findError;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.error(
        HttpStatus.UNAUTHORIZED,
        "false",
        "Invalid credentials",
        null
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, user_name: user.user_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.success(
      HttpStatus.OK,
      "true",
      ResponseMessages.LOGIN_SUCCESS,
      { token, user_name: user.user_name }
    );
  } catch (error) {
    console.error('Signup error:', error);
    if (error.name === 'ValidationError') {
      return res.error(
        HttpStatus.BAD_REQUEST,
        "false",
        "Validation error",
        Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      );
    }
    return res.error(
      HttpStatus.INTERNAL_SERVER_ERROR,
      "false",
      ResponseMessages.INTERNAL_SERVER_ERROR,
      { 
        code: "SIGNUP_ERROR",
        message: error.message || "An unexpected error occurred during signup" 
      }
    );
  }
};

module.exports = userController;
