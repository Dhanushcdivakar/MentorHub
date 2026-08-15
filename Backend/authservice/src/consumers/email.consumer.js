import { getChannel } from "../config/rabbitmq.config.js";
import { sendWelcomeEmail, sendLoginNotificationEmail } from "../utils/email.util.js";

export const consumeEmailNotifications = async () => {
  const channel = getChannel();
  const queue = "auth-service.email-notifications";

  // Assert the queue
  await channel.assertQueue(queue, {
    durable: true,
  });

  // Bind queue to the exchange for both user.created (signup) and user.login (login) routing keys
  await channel.bindQueue(queue, "mentorhub.exchange", "user.created");
  await channel.bindQueue(queue, "mentorhub.exchange", "user.login");

  console.log("Listening for email notification events on RabbitMQ (user.created, user.login)...");

  channel.consume(queue, async (message) => {
    if (!message) return;

    try {
      const routingKey = message.fields.routingKey;
      const data = JSON.parse(message.content.toString());

      console.log(`[RabbitMQ Consumer] Received event ${routingKey}:`, data);

      if (routingKey === "user.created") {
        const { email, name, role } = data;
        await sendWelcomeEmail(email, name, role);
      } else if (routingKey === "user.login") {
        const { email, name } = data;
        await sendLoginNotificationEmail(email, name);
      }

      channel.ack(message);
    } catch (error) {
      console.error("[RabbitMQ Consumer] Error processing email notification event:", error);
      // Discard invalid messages to prevent infinite redelivery loops
      channel.nack(message, false, false);
    }
  });
};
