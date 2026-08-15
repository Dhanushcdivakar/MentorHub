import { getChannel } from "../config/rabbitmq.config.js";

export const publishSessionAccepted = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "session.accepted",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
