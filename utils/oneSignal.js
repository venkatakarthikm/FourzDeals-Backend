const axios = require("axios");

const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONE_SIGNAL_REST_KEY = process.env.ONESIGNAL_REST_KEY;

exports.sendNotification = async ({ userId, heading, message, image, deepLink }) => {
  try {
    await axios.post("https://onesignal.com/api/v1/notifications", {
      app_id: ONE_SIGNAL_APP_ID,
      include_external_user_ids: [String(userId)],
      headings: { en: heading },
      contents: { en: message },
      big_picture: image,
      data: { deepLink }
    }, {
      headers: {
        Authorization: `Basic ${ONE_SIGNAL_REST_KEY}`,
        "Content-Type": "application/json"
      }
    });
  } catch (e) {
    console.error("OneSignal Error:", e.response?.data || e.message);
  }
};
