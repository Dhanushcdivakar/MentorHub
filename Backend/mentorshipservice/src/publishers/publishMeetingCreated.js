import { getChannel } from "../config/rabbitmq.config.js";

export const publishMeetingCreated = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "meeting.created",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
