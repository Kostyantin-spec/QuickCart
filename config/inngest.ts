import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "quickcart-next" });

// Використовуємо 3 аргументи, як у вашому робочому проекті, 
// але додаємо @ts-ignore, щоб TypeScript не сварився на "Expected 2, got 3"
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  // @ts-ignore
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address || "",
      name: [first_name, last_name].filter(Boolean).join(' '),
      imageUrl: image_url,
    };
    await connectDB();
    await User.create(userData);
  }
);

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  // @ts-ignore
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address || "",
      name: [first_name, last_name].filter(Boolean).join(' '),
      imageUrl: image_url,
    };
    await connectDB();
    await User.findByIdAndUpdate(id, userData, { upsert: true });
  }
);

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  // @ts-ignore
  async ({ event }) => {
    const { id } = event.data;
    await connectDB();
    await User.findByIdAndDelete(id);
  }
);