import { getChannel } from "../config/rabbitmq.config.js";

export const publishSessionRejected = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "session.rejected",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
