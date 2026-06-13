import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "quickcart-next" });

// Об'єднуємо {id} та {event} в один перший аргумент
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", event: "clerk/user.created" }, 
  async ({ event }) => {
    const data = event.data as any; // Явно кажемо TS не перевіряти типи всередині
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      imageUrl: data.image_url,
    };
    await connectDB();
    await User.create(userData);
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", event: "clerk/user.updated" },
  async ({ event }) => {
    const data = event.data as any;
    const userData = {
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      imageUrl: data.image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(data.id, userData);
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk", event: "clerk/user.deleted" },
  async ({ event }) => {
    const data = event.data as any;
    await connectDB();
    await User.findByIdAndDelete(data.id);
  }
);