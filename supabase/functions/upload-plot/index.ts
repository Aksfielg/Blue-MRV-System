import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PlotUploadRequest {
  project_name: string;
  ecosystem_type: string;
  area_sqm: number;
  gps_coordinates: {
    lat: number;
    lng: number;
  };
  notes?: string;
  image_urls: string[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const plotData: PlotUploadRequest = await req.json();

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Create plot record
    const { data: plot, error: plotError } = await supabase
      .from("plots")
      .insert([{
        owner_id: user.id,
        project_name: plotData.project_name,
        ecosystem_type: plotData.ecosystem_type,
        area_sqm: plotData.area_sqm,
        gps_coordinates: plotData.gps_coordinates,
        notes: plotData.notes,
        image_urls: plotData.image_urls,
        status: "pending_verification"
      }])
      .select()
      .single();

    if (plotError) throw plotError;

    // Log the submission
    await supabase.from("verification_logs").insert({
      plot_id: plot.id,
      verifier_id: user.id,
      action: "submitted",
      notes: "Plot submitted for verification",
      metadata: {
        area_sqm: plotData.area_sqm,
        ecosystem_type: plotData.ecosystem_type,
        image_count: plotData.image_urls.length
      }
    });

    // In a real implementation, you would:
    // 1. Upload images to IPFS
    // 2. Register plot on blockchain
    // For demo purposes, we'll simulate this
    console.log(`Would register plot on blockchain: ${plot.project_name}`);

    return new Response(
      JSON.stringify({
        success: true,
        plot_id: plot.id,
        message: "Plot submitted for verification successfully"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Plot upload error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});