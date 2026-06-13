import { Inngest } from "inngest";
import connectDB from "./db";
import User from "../models/User"; // переконайтесь, що шлях правильний

export const inngest = new Inngest({ id: "quickcart-next" });

// Функції тепер на чистих JS, тому TypeScript не буде їх чіпати
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;
    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      imageUrl: data.image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    const userData = {
      email: data.email_addresses[0].email_address,
      name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
      imageUrl: data.image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await connectDB();
    await User.findByIdAndDelete(data.id);
  }
);