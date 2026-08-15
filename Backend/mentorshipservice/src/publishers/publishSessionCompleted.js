import { getChannel } from "../config/rabbitmq.config.js";

export const publishSessionCompleted = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "session.completed",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
