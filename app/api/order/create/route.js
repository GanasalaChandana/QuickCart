import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(request) {
    try {
        const { userId } = getAuth(request); 

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID is missing" });
        }

        const { address, items } = await request.json();

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid data" });
        }

        // calculate amount using items
        const amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return await acc + product.offerPrice * item.quantity;
        }, 0);

        await inngest.send({
            name: "order/created",
            data: {
                userId, 
                address,
                items,
                amount: amount + Math.floor(amount * 0.02),
                date: Date.now(),
            },
        });

        // clear user cart
        const user = await User.findById(userId);  
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" });
        }

        user.cartItems = {};
        await user.save();

        return NextResponse.json({ success: true, message: "Order placed" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, message: error.message });
    }
}
