import { db } from "@/lib/firebase-admin"
import { verifyAuth } from "@/lib/api-auth"
import { NextResponse } from "next/server"

export async function GET(request) {
  let user;
  try {
    user = await verifyAuth(request)
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 })
  }

  try {
    if (!db) {
      return NextResponse.json({ error: "Firestore is not available" }, { status: 503 })
    }

    const snapshot = await db
      .collection("chats")
      .where("userId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()

    const history = []
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() })
    })

    return NextResponse.json({ history })
  } catch (err) {
    console.error("[Chat] Failed to fetch chat history:", err.message);
    return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 })
  }
}
