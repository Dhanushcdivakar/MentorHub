import { getChannel } from "../config/rabbitmq.config.js";

export const publishSessionCancelled = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "session.cancelled",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
