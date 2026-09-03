import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { type = "announcement", title, content, recipientEmails, name, details } = await req.json();

    if (!Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json(
        { error: "কোন বৈধ ইমেইল পাওয়া যায়নি (No valid emails found)" },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "465", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    const validEmails = recipientEmails
      .map((e: string) => (typeof e === "string" ? e.trim() : ""))
      .filter((e: string) => e && e.includes("@"));

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: "কোন বৈধ ইমেইল ঠিকানা পাওয়া যায়নি (No valid email address)" },
        { status: 400 }
      );
    }

    let subject = "";
    let badgeText = "";
    let mainHeading = "";
    let emailBodyText = "";

    const recipientName = name || "সদস্য";

    let detailsHtml = "";
    if (details && typeof details === "object") {
      const detailsTitle = type === "join-confirmation" ? "আপনার জমাকৃত তথ্যাবলী:" : "আপনার প্রোফাইল তথ্য:";
      detailsHtml = `
        <div style="margin-top: 20px; border-top: 1px solid #cbd5e1; padding-top: 16px;">
          <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 14px; font-weight: 700;">📋 ${detailsTitle}</h4>
          <table role="presentation" style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${details.name ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600; width: 40%;">নাম:</td><td style="padding: 5px 0; color: #0f172a; font-weight: 700;">${details.name}</td></tr>` : ""}
            ${details.phone ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">ফোন নম্বর:</td><td style="padding: 5px 0; color: #0f172a;">${details.phone}</td></tr>` : ""}
            ${details.email ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">ইমেইল:</td><td style="padding: 5px 0; color: #0f172a;">${details.email}</td></tr>` : ""}
            ${details.sscYear ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">এসএসসি ব্যাচ:</td><td style="padding: 5px 0; color: #0f172a;">${details.sscYear}</td></tr>` : ""}
            ${details.memberType ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">সদস্যের ধরন:</td><td style="padding: 5px 0; color: #0f172a;">${details.memberType}</td></tr>` : ""}
            ${details.work ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">পেশা:</td><td style="padding: 5px 0; color: #0f172a;">${details.work}</td></tr>` : ""}
            ${details.workplace ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">কর্মস্থল/প্রতিষ্ঠান:</td><td style="padding: 5px 0; color: #0f172a;">${details.workplace}</td></tr>` : ""}
            ${details.bloodGroup ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">রক্তের গ্রুপ:</td><td style="padding: 5px 0; color: #0f172a;">${details.bloodGroup}</td></tr>` : ""}
            ${details.address ? `<tr><td style="padding: 5px 0; color: #64748b; font-weight: 600;">ঠিকানা:</td><td style="padding: 5px 0; color: #0f172a;">${details.address}</td></tr>` : ""}
          </table>
        </div>
      `;
    }

    if (type === "join-confirmation") {
      subject = `🎉 সদস্যপদের আবেদন জমা হয়েছে | স্টুডেন্ট এইড বিডিজি`;
      badgeText = "✅ আবেদন প্রাপ্তি নিশ্চিতকরণ";
      mainHeading = `প্রিয় ${recipientName}, আপনার আবেদনের জন্য ধন্যবাদ!`;
      emailBodyText = `
        স্টুডেন্ট এইড বিডিজি (Student Aid BDG)-তে সদস্যপদের জন্য আপনার আবেদনটি সফলভাবে সিস্টেমে জমা হয়েছে। অ্যাডমিন প্যানেল বর্তমানে আপনার তথ্যসমূহ পর্যালোচনা করছে।<br/>
        ${detailsHtml}
      `;
    } else if (type === "admin-added") {
      subject = `🟢 অভিনন্দন! আপনাকে স্টুডেন্ট এইড বিডিজি-তে সদস্য হিসেবে যুক্ত করা হয়েছে`;
      badgeText = "🎉 নতুন সদস্যপদ";
      mainHeading = `অভিনন্দন ${recipientName}!`;
      emailBodyText = `
        আপনাকে স্টুডেন্ট এইড বিডিজি (Student Aid BDG)-এর অফিশিয়াল সদস্য হিসেবে যুক্ত করা হয়েছে।<br/>
        আপনি এখন আমাদের অফিশিয়াল সদস্য ডিরেক্টরিতে অন্তর্ভুক্ত হয়েছেন। ওয়েবসাইট ভিজিট করে আপনার প্রোফাইল ও আমাদের কার্যক্রম দেখতে পারেন।<br/>
        ${detailsHtml}
      `;
    } else if (type === "approval") {
      subject = `🟢 অভিনন্দন! আপনার সদস্যপদ অনুমোদিত হয়েছে | স্টুডেন্ট এইড বিডিজি`;
      badgeText = "🎉 সদস্যপদ অনুমোদিত";
      mainHeading = `অভিনন্দন ${recipientName}!`;
      emailBodyText = `
        স্টুডেন্ট এইড বিডিজি (Student Aid BDG)-তে আপনার সদস্যপদের আবেদনটি সফলভাবে অনুমোদিত হয়েছে।<br/><br/>
        আপনি এখন আমাদের অফিশিয়াল সদস্য ডিরেক্টরিতে অন্তর্ভুক্ত হয়েছেন। ওয়েবসাইট ভিজিট করে আপনার প্রোফাইল ও আমাদের কার্যক্রম দেখতে পারেন।
      `;
    } else if (type === "rejection") {
      subject = `স্টুডেন্ট এইড বিডিজি — সদস্যপদের আবেদন সংক্রান্ত আপডেট`;
      badgeText = "ℹ️ আবেদন স্ট্যাটাস আপডেট";
      mainHeading = `প্রিয় ${recipientName},`;
      emailBodyText = `
        স্টুডেন্ট এইড বিডিজি (Student Aid BDG)-তে সদস্যপদের আবেদনের জন্য আপনাকে ধন্যবাদ।<br/><br/>
        অত্যন্ত দুঃখের সাথে জানাচ্ছি যে, তথ্যসমূহ পর্যালোচনার পর এই মুহূর্তে আপনার সদস্যপদের আবেদনটি অনুমোদন করা সম্ভব হয়নি।<br/><br/>
        প্রয়োজনে আপনি পরবর্তীতে সঠিক ও পূর্ণাঙ্গ তথ্য প্রদানপূর্বক পুনরায় আবেদন করতে পারবেন।
      `;
    } else {
      // Announcement
      subject = `📢 নতুন বার্তা: ${title || "বিজ্ঞপ্তি"} | স্টুডেন্ট এইড বিডিজি`;
      badgeText = "📢 নতুন বার্তা";
      mainHeading = title || "অফিশিয়াল নোটিশ";
      emailBodyText = content || "";
    }

    // Format content markdown bold and linebreaks if needed
    if (typeof emailBodyText === "string") {
      emailBodyText = emailBodyText.replace(/\*\*(.*?)\*\*/g, "<strong style='color:#0f172a;'>$1</strong>");
      if (!/<[a-z][\s\S]*>/i.test(emailBodyText)) {
        emailBodyText = emailBodyText.replace(/\n/g, "<br/>");
      }
    }

    if (!user || !pass) {
      console.log(`ℹ️ [Nodemailer Simulation] To: ${validEmails.join(", ")} | Subject: ${subject}`);
      return NextResponse.json({
        success: true,
        simulated: true,
        message: `ইমেইল পাঠানো সিমুলেট করা হয়েছে (${validEmails.length} জন recipient)`,
      });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    let ctaUrl = "https://student-aid-bdg.vercel.app/members";
    let ctaText = "ওয়েবসাইটে ডিরেক্টরি দেখুন →";

    if (type === "rejection") {
      ctaUrl = "https://student-aid-bdg.vercel.app/join";
      ctaText = "পুনরায় আবেদন করতে এখানে ক্লিক করুন →";
    } else if (type === "announcement") {
      ctaUrl = "https://student-aid-bdg.vercel.app/announcements";
      ctaText = "ওয়েবসাইটে সকল বার্তা দেখুন →";
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
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
                      Student Aid BDG — অফিসিয়াল কমিউনিটি প্ল্যাটফর্ম
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <div style="display: inline-block; background-color: #e6f4ea; color: #2e6b45; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase;">
                      ${badgeText}
                    </div>

                    <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; line-height: 1.4;">
                      ${mainHeading}
                    </h2>

                    <div style="color: #334155; font-size: 15px; line-height: 1.8; margin-bottom: 28px; background-color: #f8faf9; border-left: 4px solid #2e6b45; padding: 16px; border-radius: 8px;">
                      ${emailBodyText}
                    </div>

                    <!-- Call to Action -->
                    <div style="text-align: center; margin: 32px 0 16px 0;">
                      <a href="${ctaUrl}" target="_blank" style="background-color: #2e6b45; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(46,107,69,0.25);">
                        ${ctaText}
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
                      এই ইমেইলটি সংস্থার অফিসিয়াল অটোমেশনের মাধ্যমে প্রেরিত।
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

    // For single user emails (confirmation / approval), send directly to TO; for announcements, use BCC
    const isSingleRecipient = validEmails.length === 1;

    await transporter.sendMail({
      from: `"স্টুডেন্ট এইড বিডিজি" <${user}>`,
      to: isSingleRecipient ? validEmails[0] : undefined,
      bcc: isSingleRecipient ? undefined : validEmails,
      subject,
      html: htmlBody,
    });

    return NextResponse.json({
      success: true,
      message: `ইমেইল সফলভাবে পাঠানো হয়েছে!`,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "অজানা ত্রুটি";
    console.error("Nodemailer Email Error:", err);
    return NextResponse.json(
      { error: `ইমেইল পাঠাতে ব্যর্থ: ${errorMessage}` },
      { status: 500 }
    );
  }
}
