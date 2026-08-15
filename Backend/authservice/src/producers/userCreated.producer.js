import { getChannel } from "../config/rabbitmq.config.js";

export const publishUserCreated = async (user) => {
  const channel = getChannel();

  const payload = {
    authId: user._id.toString(),

    name: user.name,

    email: user.email,

    role: user.role,
  };

  channel.publish(
    "mentorhub.exchange",
    "user.created",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );

  console.log("User Created Event Published");
};
