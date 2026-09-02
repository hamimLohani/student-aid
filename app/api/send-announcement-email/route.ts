import { NextRequest } from "next/server";
import { POST as sendEmailHandler } from "../send-email/route";

export async function POST(req: NextRequest) {
  return sendEmailHandler(req);
}
