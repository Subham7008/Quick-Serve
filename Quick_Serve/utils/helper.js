const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const admin = require("firebase-admin");
require("dotenv").config();
const helpers={}


helpers.emptyOrRows = (rows) => {
  if (!rows) {
    return [];
  }
  return rows;
};

helpers.parseJsonToObj = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

//hashing password
helpers.hash = (str) => {
  if (typeof str === "string" && str.length > 0) {
    return CryptoJS.HmacSHA256(str, process.env.APP_SUPER_SECRET_KEY).toString(
      CryptoJS.enc.Hex
    );
  } else {
    return false;
  }
};
const hashedKey=helpers.hash(process.env.APP_SUPER_SECRET_KEY)



//generateOTP
helpers.generateOTP = (digitCount) => {
  let otp = Math.floor(Math.random() * (Math.pow(10, digitCount) - 1)) + "";
  while (otp.length < digitCount) {
    otp = "0" + otp;
  }
  return otp;
};

//token generator
helpers.createRandomString = (strLength) => {
  strLength =
    typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    let text = "";
    let possibleCharacters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < strLength; i++)
      text += possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
    return text;
  } else {
    return false;
  }
};

//Verify JWT Token
helpers.verifyToken = (id, callback) => {
  if (!id) {
    console.error("[Helper] No token provided for verification");
    return callback(new Error("No token provided"), false);
  }

  if (!process.env.JWT_SECRET) {
    console.error("[Helper] JWT_SECRET is not configured");
    return callback(new Error("Server configuration error"), false);
  }

  console.log("[Helper] Token received for verification:", id);
  
  jwt.verify(
    id,
    process.env.JWT_SECRET,
    function (err, data) {
      if (err) {
        console.error("[Helper] JWT verification error:", {
          name: err.name,
          message: err.message,
          expiredAt: err.expiredAt
        });
        return callback(err, false);
      }

      if (!data || !data.userId) {
        console.error("[Helper] Invalid token payload");
        return callback(new Error("Invalid token payload"), false);
      }

      console.log("[Helper] JWT verification successful:", {
        userId: data.userId,
        username: data.user_name
      });
      
      callback(null, {
        id: data.userId,
        user_name: data.user_name
      });
    }
  );
};

//Generate Current Timestamp
helpers.currTimestamp = () => {
  let time = new Date().toISOString().slice(-13, -5).trim();
  let date = new Date().toISOString().split("T")[0];
  return date + " " + time;
};

//GMT timeStamp and timeString for mongo insert
helpers.utcTimeStamp = () => {
  const date = new Date();
  const utc_string = date.toISOString();
  const utc_time_stamp = Math.round(new Date(utc_string).getTime());
  return {
    timeStamp: utc_time_stamp,
    timeString: utc_string,
  };
};

//date time string to timeStamp [from database to store]
helpers.stringToTimestamp = (dateTimeString) => {
  let date = new Date(dateTimeString);
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
};

helpers.response = (statusCode, success, message, data = "") => {
  let response = {};
  if (statusCode) {
    response.status = statusCode;
  }
  if (success) {
    response.success = success;
  }
  if (message) {
    response.message = message;
  }
  if (data) {
    response.data = data;
  }
  return response;
};

// send Error response
helpers.errorResponse = (statusCode, success, message, error = "") => {
  let response = {};
  if (statusCode) {
    response.status = statusCode;
  }
  if (success) {
    response.success = success;
  }
  if (message) {
    response.message = message;
  }
  if (error) {
    response.error = error;
  }
  return response;
};

//Send Response with additional field
helpers.responseWithToken = (
  statusCode,
  success,
  message,
  additionalFieldName = "",
  additionalFieldValue = "",
  data = ""
) => {
  let response = {};
  if (statusCode) {
    response.status = statusCode;
  }
  if (success) {
    response.success = success;
  }
  if (message) {
    response.message = message;
  }
  if (additionalFieldName && additionalFieldValue) {
    response.additionalFieldName = additionalFieldValue;
  }
  if (data) {
    response.data = data;
  }
  return response;
};

 
//for fcm token :::::::::::::::::::::::::::::::::::::::::::::::::::


helpers.sendFcmNotification = async (message) => {
  try {
    const response = await admin.messaging().send(message);
    console.log("FCM notification sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    throw error;
  }
};


module.exports = helpers;
