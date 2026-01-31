import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Plot = {
	id: string;
	project_name: string;
	profiles?: any;
	status?: string;
	image_urls: string[];
	area_sqm: number;
	ecosystem_type: string;
};

export type Listing = {
	id: string;
	name: string;
	description?: string;
	category?: string;
	price_bcc?: number;
	available_quantity?: number;
	is_active?: boolean;
};

export type Voucher = {
	id: string;
	voucher_id?: string;
	listings?: Listing;
	buyer_profile?: any;
	is_redeemed?: boolean;
	credits_spent?: number;
	issued_at?: string;
	redeemed_at?: string | null;
};

export async function getPlots(): Promise<Plot[] | null> {
	const { data, error } = await supabase
		.from('plots')
		.select(`*, profiles(*)`)
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Error fetching plots:', error.message);
		return null;
	}

	return data as Plot[];
}
