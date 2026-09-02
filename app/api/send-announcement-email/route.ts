import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { title, content, recipientEmails } = await req.json();

    if (!title || !content || !Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় তথ্য অনুপস্থিত (Missing required fields)" },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Filter valid emails
    const validEmails = recipientEmails
      .map((e: string) => (typeof e === "string" ? e.trim() : ""))
      .filter((e: string) => e && e.includes("@"));

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: "কোন বৈধ ইমেইল ঠিকানা পাওয়া যায়নি (No valid emails found)" },
        { status: 400 }
      );
    }

    // If SMTP credentials are not configured in environment variables, return simulated success log
    if (!user || !pass) {
      console.log("ℹ️ [Nodemailer] SMTP Config Missing. Email simulation mode active.");
      console.log(`[Simulated Email Sent] To: ${validEmails.join(", ")} | Subject: 📢 নতুন বার্তা: ${title}`);
      return NextResponse.json({
        success: true,
        simulated: true,
        message: `ইমেইল পাঠানো সিমুলেট করা হয়েছে (${validEmails.length} জন সদস্যের কাছে)`,
        recipientCount: validEmails.length,
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    // Format content (supports HTML or raw text with **bold** and newlines)
    let formattedContent = content;
    if (typeof formattedContent === "string") {
      formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, "<strong style='color:#0f172a;'>$1</strong>");
      if (!/<[a-z][\s\S]*>/i.test(formattedContent)) {
        formattedContent = formattedContent.replace(/\n/g, "<br/>");
      }
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'SolaimanLipi', Arial, sans-serif; background-color: #f4f7f5; color: #1e293b;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; padding: 20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #162a1e 0%, #2e6b45 100%); padding: 32px 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
                      স্টুডেন্ট এইড বিডিজি
                    </h1>
                    <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                      Student Aid BDG — অফিসিয়াল নোটিশ ও আপডেট
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <div style="display: inline-block; background-color: #e6f4ea; color: #2e6b45; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase;">
                      📢 নতুন বার্তা
                    </div>

                    <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; line-height: 1.4;">
                      ${title}
                    </h2>

                    <div style="color: #334155; font-size: 15px; line-height: 1.8; margin-bottom: 28px; background-color: #f8faf9; border-left: 4px solid #2e6b45; padding: 16px; border-radius: 8px;">
                      ${formattedContent}
                    </div>

                    <!-- Call to Action -->
                    <div style="text-align: center; margin: 32px 0 16px 0;">
                      <a href="https://student-aid-bdg.vercel.app/announcements" target="_blank" style="background-color: #2e6b45; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(46,107,69,0.25);">
                        ওয়েবসাইটে সকল বার্তা দেখুন →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8faf9; border-top: 1px solid #e2e8f0; padding: 24px; text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
                      স্টুডেন্ট এইড বিডিজি (Student Aid BDG)
                    </p>
                    <p style="margin: 0 0 12px 0;">
                      এই ইমেইলটি সংস্থার নিবন্ধিত সকল সদস্যদের জন্য স্বয়ংক্রিয়ভাবে প্রেরিত।
                    </p>
                    <div style="border-top: 1px dashed #cbd5e1; margin: 12px 0; padding-pt: 12px;">
                      <span style="font-size: 11px; color: #94a3b8;">
                        কারিগরী সহায়তায়: <strong>কান্নেক্টা (Kannecta)</strong> | প্রধান প্রকৌশলী: <strong>মো: ইনজামামুল লোহানী</strong> (IIT, DU)
                      </span>
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send emails in batch
    await transporter.sendMail({
      from: `"স্টুডেন্ট এইড বিডিজি" <${user}>`,
      bcc: validEmails, // Use BCC to protect member privacy
      subject: `📢 নতুন বার্তা: ${title} | স্টুডেন্ট এইড বিডিজি`,
      html: htmlBody,
    });

    return NextResponse.json({
      success: true,
      message: `সফলভাবে ${validEmails.length} জন সদস্যের কাছে ইমেইল পাঠানো হয়েছে।`,
      recipientCount: validEmails.length,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "অজানা ত্রুটি";
    console.error("Nodemailer Error:", err);
    return NextResponse.json(
      { error: `ইমেইল পাঠাতে ব্যর্থ হয়েছে: ${errorMessage}` },
      { status: 500 }
    );
  }
}
