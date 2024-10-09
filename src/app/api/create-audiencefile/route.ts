import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb'; // Adjust this path based on your setup

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { audienceName, audienceEmail } = await request.json();

    // Validate that audienceName and audienceEmail are arrays and have the same length
    if (!Array.isArray(audienceName) || !Array.isArray(audienceEmail)) {
      return NextResponse.json({ error: 'Audience Name and Email must be arrays' }, { status: 400 });
    }

    if (audienceName.length !== audienceEmail.length) {
      return NextResponse.json({ error: 'Audience Name and Email arrays must have the same length' }, { status: 400 });
    }

    if (audienceName.length === 0 || audienceEmail.length === 0) {
      return NextResponse.json({ error: 'Audience Name and Email cannot be empty' }, { status: 400 });
    }

    // Create new audience file in the database
    const newAudienceFile = await prisma.audiencefile.create({
      data: {
        audienceName,
        audienceEmail,
      },
    });

    // Return the new Audiencefile ID
    return NextResponse.json({ audiencefileId: newAudienceFile.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating audience file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
