import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS in emails
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

interface VerificationEmailRequest {
  email: string;
  name: string;
  status: "approved" | "rejected";
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing or invalid authorization header' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with auth header
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT and get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = user.id;

    // Verify user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      console.error('Role check failed:', roleError || 'Not an admin');
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name, status, reason }: VerificationEmailRequest = await req.json();

    if (!email || !name || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, name, status" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize user inputs before HTML insertion
    const safeName = escapeHtml(name);
    const safeReason = reason ? escapeHtml(reason) : '';

    const isApproved = status === "approved";
    const subject = isApproved
      ? "🎉 Your Account Has Been Verified!"
      : "Verification Status Update";

    const htmlContent = isApproved
      ? `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; margin-top: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0;">✅ Verification Approved!</h1>
            </div>
            <p style="font-size: 16px; color: #333;">Dear ${safeName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Great news! Your identity verification has been <strong style="color: #16a34a;">approved</strong>. 
              You now have full access to all features on HomeCare Job BD.
            </p>
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0; color: #166534; font-weight: 600;">What this means for you:</p>
              <ul style="color: #166534; margin-top: 10px;">
                <li>Your profile now shows a verified badge</li>
                <li>Employers can trust your identity</li>
                <li>Higher visibility in search results</li>
              </ul>
            </div>
            <p style="font-size: 16px; color: #333;">
              Thank you for completing the verification process. We wish you success in your job search!
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong>HomeCare Job BD Team</strong>
            </p>
          </div>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; margin-top: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0;">Verification Update</h1>
            </div>
            <p style="font-size: 16px; color: #333;">Dear ${safeName},</p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              We regret to inform you that your identity verification could not be approved at this time.
            </p>
            ${safeReason ? `
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #991b1b; font-weight: 600;">Reason:</p>
              <p style="color: #991b1b; margin-top: 10px; margin-bottom: 0;">${safeReason}</p>
            </div>
            ` : ''}
            <div style="background-color: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #eab308;">
              <p style="margin: 0; color: #854d0e; font-weight: 600;">What you can do:</p>
              <ul style="color: #854d0e; margin-top: 10px;">
                <li>Ensure your NID documents are clear and readable</li>
                <li>Make sure all information matches your profile</li>
                <li>Resubmit your verification documents</li>
              </ul>
            </div>
            <p style="font-size: 16px; color: #333;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Best regards,<br>
              <strong>HomeCare Job BD Team</strong>
            </p>
          </div>
        </body>
        </html>
      `;

    console.log(`Sending ${status} verification email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "HomeCare Job BD <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
