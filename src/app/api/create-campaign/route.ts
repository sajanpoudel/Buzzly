import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb'; // Adjust this path to where your Prisma instance is configured.

// Returns null when the value is empty, a Date when it is valid and undefined when it is not a date.
function parseOptionalDate(value: unknown): Date | null | undefined {
  if (!value) {
    return null;
  }
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const {
      userId,
      audiencefileId,
      campaignName,
      campaignType,
      endDate,
      scheduleCampaign,
      recurringCampaign,
      emailTemplate,
      subject,
      emailBody,
      targetAudience,
    } = await request.json();

    // Validate the required fields
    if (
      !userId ||
      !audiencefileId ||
      !campaignName ||
      !campaignType ||
      !subject ||
      !emailBody ||
      !targetAudience
    ) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    const parsedEndDate = parseOptionalDate(endDate);
    const parsedScheduleDate = parseOptionalDate(scheduleCampaign);
    if (parsedEndDate === undefined || parsedScheduleDate === undefined) {
      return NextResponse.json({ error: 'Invalid date provided.' }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Check if the audience file exists
    const audiencefile = await prisma.audiencefile.findUnique({
      where: { id: audiencefileId },
    });

    if (!audiencefile) {
      return NextResponse.json({ error: 'Audience file not found.' }, { status: 404 });
    }

    // Create the new campaign and associate it with the user and audience file
    const newCampaign = await prisma.campaign.create({
      data: {
        userId,
        audiencefileId,
        campaignName,
        campaignType,
        endDate: parsedEndDate,
        scheduleCampaign: parsedScheduleDate,
        recurringCampaign: Boolean(recurringCampaign),
        emailTemplate,
        subject,
        emailBody,
        targetAudience,
      },
    });

    // Return success response with the new campaign
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
