import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },       // Аргумент 1: Налаштування
  { event: "clerk/user.created" },      // Аргумент 2: Тригер
  async ({ event }) => {                // Аргумент 3: Функція-обробник
    const { data } = event;
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

// Inngest Function to update user data in database
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
    await User.findByIdAndUpdate(data.id, userData);
  }
);

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await connectDB();
    // Використовуємо findByIdAndDelete для видалення, а не update
    await User.findByIdAndDelete(data.id); 
  }
);