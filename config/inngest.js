import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User"; // Corrected import path
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
    },
    { event: 'clerk/user.created' },
    async ({ event }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                _id: id,
                email: email_addresses[0].email_address,
                name: first_name + ' ' + last_name,
                imageURL: image_url
            };

            await connectDB();
            const user = await User.create(userData);

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('User creation sync error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
);

// Inngest Function to update user data in a database
export const syncUserUpdate = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
    },
    { event: 'clerk/user.updated' },
    async ({ event }) => {
        try {
            const { id, first_name, last_name, email_addresses, image_url } = event.data;
            const userData = {
                email: email_addresses[0].email_address,
                name: first_name + ' ' + last_name,
                imageURL: image_url
            };

            await connectDB();
            const user = await User.findByIdAndUpdate(id, userData, { new: true });

            return {
                success: true,
                user: user
            };
        } catch (error) {
            console.error('User update sync error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
);

// Inngest Function to delete user data from a database
export const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk',
    },
    { event: 'clerk/user.deleted' },
    async ({ event }) => {
        try {
            const { id } = event.data;
            await connectDB();
            const deletedUser = await User.findByIdAndDelete(id);

            return {
                success: true,
                user: deletedUser
            };
        } catch (error) {
            console.error('User deletion sync error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
);

//Inngest Function to create User's order in database
export const createUserOrder = inngest.createFunction(
    {
        id: 'create-user-order',
        batchEvents: {
            maxSize: 5,
            timeout: '5s'
        }
    },
    { event: 'order/created' },
    async ({ events }) => {
        const orders = events.map((event) => {
            return {
                userId: event.data.userId,
                items: event.data.items,
                amount: event.data.amount,
                address: event.data.address,
                date: event.data.date

            }

        }

)
await connectDB();
await Order.insertMany(orders);
return {success: true, processed: orders.length};
}
    
    
)
