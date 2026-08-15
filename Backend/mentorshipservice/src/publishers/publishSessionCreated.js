import { getChannel } from "../config/rabbitmq.config.js";

export const publishSessionCreated = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "session.created",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
