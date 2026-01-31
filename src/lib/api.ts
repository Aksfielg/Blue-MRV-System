import { supabase } from './supabase';

type VerifyPayload = {
  survival_rate?: number;
  estimated_co2?: number;
  verifier_notes?: string;
};

export async function verifyPlantation(plotId: string, payload: VerifyPayload) {
  try {
    const updates: any = {
      survival_rate: payload.survival_rate ?? null,
      estimated_co2: payload.estimated_co2 ?? null,
      verifier_notes: payload.verifier_notes ?? null,
      status: 'verified',
      verified_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('plots')
      .update(updates)
      .eq('id', plotId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

export async function scanAndRedeemVoucher(qrData: string, vendorId: string) {
  try {
    // qrData may be JSON or plain string containing voucher_id
    let parsed: any = null;
    try {
      parsed = JSON.parse(qrData);
    } catch (e) {
      parsed = { voucher_id: qrData };
    }

    const voucherId = parsed.voucher_id || parsed.id || parsed.token || parsed.code;
    if (!voucherId) {
      return { success: false, error: 'Invalid QR data' };
    }

    // Fetch voucher
    const { data: vouchers, error: fetchErr } = await supabase
      .from('vouchers')
      .select('*')
      .eq('voucher_id', voucherId)
      .single();

    if (fetchErr) return { success: false, error: fetchErr.message };

    if ((vouchers as any).is_redeemed) return { success: false, error: 'Voucher already redeemed' };

    // Redeem voucher
    const { data, error } = await supabase
      .from('vouchers')
      .update({ is_redeemed: true, redeemed_at: new Date().toISOString(), redeemed_by_vendor: vendorId })
      .eq('voucher_id', voucherId);

    if (error) return { success: false, error: error.message };

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}
