import { NextRequest, NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY?.trim()
    const apiSecret = process.env.LIVEKIT_API_SECRET?.trim()

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: "LiveKit credentials are not configured." }, { status: 500 })
    }

    const body = (await request.json().catch(() => null)) as
      | { userName?: string; teamCode?: string }
      | null

    const userName = body?.userName?.trim()
    const teamCode = body?.teamCode?.trim()

    if (!userName || !teamCode) {
      return NextResponse.json({ error: "userName and teamCode are required." }, { status: 400 })
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: `${userName}-${crypto.randomUUID()}`,
      name: userName,
    })

    token.addGrant({
      roomJoin: true,
      room: teamCode,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    return NextResponse.json({
      token: await token.toJwt(),
      roomName: teamCode,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create LiveKit token."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
