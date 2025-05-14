const HttpStatus = require("../enums/httpStatusCode.enum");
const ResponseMessages = require("../enums/responseMessage.enum");
const shopOwners = require("../models/shop_owners.model");
const customers=require("../models/customers.model")
const devices=require("../models/devices.model")
const payments=require("../models/payments.model")
const bcrypt = require("bcrypt");
const helpers=require("../utils/helper")
const jwt=require("jsonwebtoken");
require("dotenv").config();



// shop owners register,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
// Error response helper function
const sendErrorResponse = (res, statusCode, message, details = null) => {
  return res.error(
    statusCode,
    "false",
    message,
    details
  );
};

const shopOwnerController = {};

shopOwnerController.register = async (req, res) => {
  const { ownerDetails, shopDetails } = req.body;
  const { name, email, contact_number, password } = ownerDetails;
  const { shop_name, address, shop_opening_hours, service_offered } =shopDetails;

  // shop owners exist or not.......................
  try {
    const existOwner = await shopOwners.findOne({                     
      where: {
          email , contact_number ,
      },
    });                                                 

    if (existOwner) {
      return sendErrorResponse(
        res,
        HttpStatus.CONFLICT,
        ResponseMessages.User_Exist,
        {
          code: "SHOP_OWNER_EXISTS",
          message: "Shop owner already exists with this email or contact number",
          fields: { email, contact_number }
        }
      );
    }
    //password hash............................
    const hashedPassword = await bcrypt.hash(password, 10);

    const newShopOwner = await shopOwners.create({
      name,
      email,
      contact_number,
      password: hashedPassword,
      shop_name,
      address,
      shop_opening_hours,
      service_offered: JSON.stringify(service_offered),
      created_by: 1,
      updated_by: 1,
    });
    return res.success(
      HttpStatus.CREATED,
      "true",
      ResponseMessages.USER_REGISTERED_SUCCESSFULLY,
      newShopOwner
    );
  } catch (error) {
    console.error("Error registering shop owner:", error);
    return sendErrorResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ResponseMessages.INTERNAL_SERVER_ERROR,
      {
        code: "REGISTRATION_ERROR",
        message: error.message || "Failed to register shop owner",
        details: error.name === 'SequelizeValidationError' ? error.errors.map(e => ({ field: e.path, message: e.message })) : null
      }
    );
  }
};

// shop owner login:::::::::::::::::::::::::::::::::::

shopOwnerController.sendOtp=async(req,res)=>{
  const {contact_number}=req.body;

  try{
    const shopOwner= await shopOwners.findOne({
      where:{contact_number}
    });
    
    if(!shopOwner){
      return sendErrorResponse(
        res,
        HttpStatus.NOT_FOUND,
        ResponseMessages.NOT_FOUND,
        {
          code: "SHOP_OWNER_NOT_FOUND",
          message: "Shop owner not found with provided contact number",
          contact_number
        }
      );
    }
    const otp=helpers.generateOTP(6)

    await shopOwners.update(
      {otp},
      {where:{contact_number}}
    );

    console.log(`OTP sent to ${contact_number}:${otp}`)

    return res.success(
      HttpStatus.OK,
      "true",
      ResponseMessages.OTP_SENT,
      []
    );
  }catch(error){
      console.error("Error sending OTP",error);
      return res.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "false",
        ResponseMessages.INTERNAL_SERVER_ERROR,
        error

      );
    }
  }  

      shopOwnerController.verifyOtp=async(req,res)=>{
        const{contact_number,otp}=req.body

        try{
          const shopOwner=await shopOwners.findOne({
            where:{contact_number},
          });
          if (!shopOwner){
            return res.error(
              HttpStatus.NOT_FOUND,
              "false",
              ResponseMessages.NOT_FOUND,
              []
            );
          };
          
        if(shopOwner.otp!==otp) {
          return sendErrorResponse(
            res,
            HttpStatus.BAD_REQUEST,
            ResponseMessages.INVALID_OTP,
            {
              code: "INVALID_OTP",
              message: "The provided OTP is invalid or expired",
              contact_number
            }
          )
        }
          await shopOwners.update(
        {otp_verify:1,otp:null},
        {where:{contact_number}}

        );
        const token =jwt.sign(
          {id:shopOwner.id,contact_number:shopOwner.contact_number},
          process.env.APP_SUPER_SECRET_KEY
        );
        await shopOwners.update(
          {token},
          {where:{contact_number}}
        )

        return res.success(
          HttpStatus.OK,
          "true",
          ResponseMessages.LOGIN_SUCCESS,
          {token}
        );
        }catch(error){
          console.error("error verifying Otp",error)
          return sendErrorResponse(
            res,
            HttpStatus.INTERNAL_SERVER_ERROR,
            ResponseMessages.INTERNAL_SERVER_ERROR,
            {
              code: "OTP_VERIFICATION_ERROR",
              message: error.message || "Failed to verify OTP",
              details: error.name === 'SequelizeValidationError' ? error.errors.map(e => ({ field: e.path, message: e.message })) : null
            }
          )

        }
      }


      // for fcm token::::::::::::::::::::::::::::::::::::::::::::::

      shopOwnerController.updateFcmToken = async (req, res) => {
        const { fcm_token } = req.body;
        const shopOwnerId = req.mwValue?.auth?.id;
      
        try {
          const shopOwner = await shopOwners.findByPk(shopOwnerId);
          if (!shopOwner) {
            return res.error(
              HttpStatus.NOT_FOUND,
              "false",
              "Shop owner not found."
            );
          }
      
          await shopOwner.update({ fcm_token });
      
          return res.success(
            HttpStatus.OK,
            "true",
            "FCM token updated successfully."
          );
        } catch (error) {
          console.error("Error updating FCM token:", error);
          return res.error(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "false",
            "Failed to update FCM token",
            error
          );
        }
      };
      


     
module.exports = shopOwnerController;
