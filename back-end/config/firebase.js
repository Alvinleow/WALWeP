const admin = require("firebase-admin");
const serviceAccount = require("./walwep-349b6-firebase-adminsdk-fbsvc-11eb344c18.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "walwep-349b6.firebasestorage.app",
});

const storage = admin.storage().bucket();

module.exports = { storage };
