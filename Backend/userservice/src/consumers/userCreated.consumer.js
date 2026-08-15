import { getChannel } from "../config/rabbitmq.config.js";

import {
  createProfile,
  findProfileByAuthId,
} from "../repositories/user.repository.js";

export const consumeUserCreated = async () => {
  const channel = getChannel();

  const queue = "user-service.user-created";

  await channel.assertQueue(queue, {
    durable: true,
  });

  await channel.bindQueue(queue, "mentorhub.exchange", "user.created");

  console.log("Listening for user.created events...");

  channel.consume(queue, async (message) => {
    if (!message) return;

    try {
      const data = JSON.parse(message.content.toString());

      console.log("Received Event:", data);

      const existingUser = await findProfileByAuthId(data.authId);

      if (!existingUser) {
        await createProfile({
          _id: data.authId,

          authId: data.authId,

          name: data.name,

          email: data.email,

          role: data.role,
        });

        console.log("Profile Created Successfully");
      }

      channel.ack(message);
    } catch (error) {
      console.error(error);

      channel.nack(message, false, false);
    }
  });
};
