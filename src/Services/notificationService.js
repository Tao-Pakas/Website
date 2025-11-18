// src/services/notificationService.js
import { apiRequest } from "../utils/api";
import { CREATE_NOTIFICATION } from "../graphql/mutations";

export const sendLandlordNotification = async (landlordId, propertyId, token) => {
  const message = `New booking appointment made for your property (ID: ${propertyId}).`;

  const variables = {
    data: {
      message,
      isRead: false,
      landlord: landlordId,
    },
  };

  try {
    const data = await apiRequest(CREATE_NOTIFICATION, variables, token);
    console.log("✅ Landlord notified:", data);
    return data;
  } catch (err) {
    console.error("❌ Failed to send notification:", err);
  }
};
