import connectDB from '@/config/db'
import { getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Address from '@/models/Address'

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const { address } = await request.json()
        await connectDB()
        
        // Ensure address is an object before proceeding
        if (!address || typeof address !== "object") {
            return NextResponse.json({ success: false, message: 'Invalid address data' });
        }
        
        // Proper way to include userId with the address object
        const newAddress = await Address.create({ ...address, userId })
        
        return NextResponse.json({ 
            success: true, 
            message: 'Address added successfully', 
            newAddress
        });
    }
    catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}