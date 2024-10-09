import { NextResponse } from 'next/server';
import  prismadb  from '@/lib/prismadb'; // Make sure to adjust this path to where your Prisma instance is configured.

export async function POST(request: Request) {
    try {
        // Get the request body
        const { email, name, profilePic } = await request.json();
 

        // Validate if email exists
        if (!email || !name || !profilePic) {
            return NextResponse.json({ error: 'Email, Name and Profilepic is not provided from backend.' }, { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await prismadb.user.findUnique({
            where: { email },
        });

    

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 200 });
        }

        // Create new user in the database
        const newUser = await prismadb.user.create({
            data: {
                email,
                name,
                profilePic
            },
        });

        // Return success response
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
