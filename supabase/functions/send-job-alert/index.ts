import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobPayload {
  type: "INSERT";
  table: string;
  record: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary: number | null;
    company_name: string | null;
    job_type: string;
    shift_type: string;
  };
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: JobPayload = await req.json();
    console.log("Received job payload:", JSON.stringify(payload));

    // Only process INSERT events
    if (payload.type !== "INSERT") {
      return new Response(JSON.stringify({ message: "Not an insert event" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const job = payload.record;
    console.log("New job posted:", job.title);

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all caregivers with notifications enabled
    const { data: caregiverRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["caregiver", "nurse"]);

    if (rolesError) {
      console.error("Error fetching caregiver roles:", rolesError);
      throw rolesError;
    }

    if (!caregiverRoles || caregiverRoles.length === 0) {
      console.log("No caregivers found");
      return new Response(JSON.stringify({ message: "No caregivers to notify" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const caregiverIds = caregiverRoles.map((r) => r.user_id);

    // Get profiles with notifications enabled
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, name")
      .in("id", caregiverIds)
      .eq("notifications_enabled", true);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No caregivers with notifications enabled");
      return new Response(JSON.stringify({ message: "No caregivers with notifications enabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending notifications to ${profiles.length} caregivers`);

    const siteUrl = "https://homecarejobbd.netlify.app";
    const jobUrl = `${siteUrl}/jobs?highlight=${job.id}`;
    const salaryText = job.salary ? `৳${job.salary.toLocaleString()}` : "Negotiable";

    // Send emails to all caregivers with notifications enabled
    const emailPromises = profiles.map(async (profile) => {
      try {
        const result = await resend.emails.send({
          from: "HomeCare Job BD <onboarding@resend.dev>",
          to: [profile.email],
          subject: `New Job: ${job.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #6DBE45 0%, #4a9e2f 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🏥 HomeCare Job BD</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2 style="color: #6DBE45; margin-top: 0;">New Job Opportunity!</h2>
                
                <p>Hi ${profile.name || "Caregiver"},</p>
                
                <p>A new job has been posted that might interest you:</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6DBE45; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">${job.title}</h3>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>📍 Location:</strong> ${job.location}
                  </p>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>💰 Salary:</strong> ${salaryText}
                  </p>
                  <p style="margin: 5px 0; color: #666;">
                    <strong>⏰ Shift:</strong> ${job.shift_type}
                  </p>
                  ${job.company_name ? `<p style="margin: 5px 0; color: #666;"><strong>🏢 Company:</strong> ${job.company_name}</p>` : ""}
                </div>
                
                <a href="${jobUrl}" style="display: inline-block; background: #6DBE45; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                  View Job Details
                </a>
                
                <p style="margin-top: 30px; font-size: 12px; color: #999;">
                  You're receiving this email because you enabled job notifications on HomeCare Job BD.
                  <br>
                  <a href="${siteUrl}/settings" style="color: #6DBE45;">Manage your notification preferences</a>
                </p>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Email sent to ${profile.email}:`, result);
        return { email: profile.email, success: true };
      } catch (emailError: any) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
        return { email: profile.email, success: false, error: emailError.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;

    console.log(`Sent ${successCount}/${profiles.length} emails successfully`);

    return new Response(
      JSON.stringify({
        message: `Sent ${successCount} email notifications`,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-job-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
