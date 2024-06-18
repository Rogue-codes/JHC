import ActivityLogModel from "../models/activityLog.model.js";

export const activityLogMiddleware = async (initiator, action, target) => {
  try {
    const activity = `${initiator} initiated the ${action} of ${target.first_name} ${target.last_name}`;
    const timestamp = new Date().toLocaleString();

    const log = await ActivityLogModel.create({
      activity,
      Date: timestamp,
      doctorId: target._id
    });

    console.log(log);
  } catch (error) {
    console.log(error);
  }
};
