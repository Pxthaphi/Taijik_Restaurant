import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse JSON body from request
    const data = await request.json();
    const { userId, message } = data;

    const token = process.env.NEXT_PUBLIC_LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'LINE channel access token not found' }, { status: 500 });
    }

    const flexMessage = {
      to: userId,
      messages: message, // Ensure message matches LINE's Flex Message format
    };

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(flexMessage),
    });

    if (response.ok) {
      return NextResponse.json({ message: 'Notification sent successfully' });
    } else {
      const errorText = await response.text();
      return NextResponse.json({ error: `Failed to send notification: ${errorText}` }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
