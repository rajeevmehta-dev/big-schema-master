module.exports = {
    // APP_PORT: "1337",
    // DB_HOST: "YOUR_MONGO_HOST/DATABASE",
    // DB_USER: "MONGO_USER",
    // DB_PASS: "MONGO_PASS",
    JWT_KEY_FREE_ENDPOINTS: "thisIsMyJwtKeyUsedToEncodeTheTokens(forFreeEndpoints)",
    JWT_KEY_PAID_ENDPOINTS: "thisIsMyJwtKeyUsedToEncodeTheTokens(forPaidEndpoints)",

    
    JWT_KEY:"thisIsMyJwtKeyUsedToEncodeTheTokens"
  }




//   // signature algorithm
// data = base64urlEncode( header ) + “.” + base64urlEncode( payload )
// hashedData = hash( data, secret )
// signature = base64urlEncode( hashedData )