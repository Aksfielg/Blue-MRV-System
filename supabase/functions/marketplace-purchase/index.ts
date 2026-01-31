import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PurchaseRequest {
  listing_id: string;
  buyer_wallet: string;
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

    const { listing_id, buyer_wallet }: PurchaseRequest = await req.json();

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

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing) {
      throw new Error("Listing not found");
    }

    // Check user's credit balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("credit_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.credit_balance < listing.price_bcc) {
      throw new Error("Insufficient credits");
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      voucher_id: `voucher_${Date.now()}`,
      listing_id,
      buyer_id: user.id,
      vendor_id: listing.vendor_id,
      amount: listing.price_bcc,
      timestamp: Date.now()
    });

    // Create voucher record
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .insert([{
        listing_id,
        buyer_id: user.id,
        vendor_id: listing.vendor_id,
        credits_spent: listing.price_bcc,
        qr_code: qrData
      }])
      .select()
      .single();

    if (voucherError) throw voucherError;

    // Update user's credit balance
    const { error: balanceError } = await supabase
      .from("profiles")
      .update({
        credit_balance: profile.credit_balance - listing.price_bcc,
        total_credits_spent: (profile.total_credits_spent || 0) + listing.price_bcc
      })
      .eq("id", user.id);

    if (balanceError) throw balanceError;

    // Create transaction record
    await supabase.from("transactions").insert({
      user_id: user.id,
      transaction_type: "spent",
      amount: listing.price_bcc,
      description: `Purchased: ${listing.name}`,
      reference_id: voucher.id,
      reference_type: "voucher"
    });

    // Update listing quantity
    await supabase
      .from("listings")
      .update({
        available_quantity: listing.available_quantity - 1,
        total_sold: (listing.total_sold || 0) + 1
      })
      .eq("id", listing_id);

    // In a real implementation, you would:
    // 1. Call blockchain to burn credits
    // 2. Mint voucher NFT
    // For demo purposes, we'll simulate this
    console.log(`Would burn ${listing.price_bcc} BCC tokens from ${buyer_wallet}`);
    console.log(`Would mint voucher NFT with QR data: ${qrData}`);

    return new Response(
      JSON.stringify({
        success: true,
        voucher,
        qr_code: qrData,
        message: "Purchase completed successfully"
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error("Purchase error:", error);
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