import { getChannel } from "../config/rabbitmq.config.js";

export const publishUserLogin = async (user) => {
  const channel = getChannel();

  const payload = {
    authId: user._id.toString(),
    name: user.name,
    email: user.email,
  };

  channel.publish(
    "mentorhub.exchange",
    "user.login",
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    },
  );

  console.log("User Login Event Published");
};
