import { getChannel } from "../config/rabbitmq.config.js";

export const publishReviewAdded = async (payload) => {
  const channel = getChannel();

  channel.publish(
    "mentorhub.exchange",
    "review.added",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );
};
