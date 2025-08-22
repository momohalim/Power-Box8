import { supabase } from "./supabaseClient";

/**
 * Helper function to update or insert data in singleton tables (tables that should have only one row)
 * This approach is UUID-compatible and doesn't rely on fixed numeric IDs
 */
export async function upsertSingletonData(
  tableName: string,
  data: any,
  options: {
    onConflict?: string;
    select?: string;
  } = {},
) {
  try {
    // First, try to get the existing row
    const { data: existingData, error: fetchError } = await supabase
      .from(tableName)
      .select("id")
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows found, which is fine for first insert
      throw fetchError;
    }

    const upsertData = {
      ...data,
      updated_at: new Date().toISOString(),
      // Only include id if we found an existing row
      ...(existingData && existingData.id ? { id: existingData.id } : {}),
    };

    const selectClause = options.select || "*";
    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(upsertData, {
        onConflict: options.onConflict || "id",
        ignoreDuplicates: false,
      })
      .select(selectClause);

    return { data: result, error };
  } catch (error) {
    console.error(`Error in upsertSingletonData for ${tableName}:`, error);
    return { data: null, error };
  }
}

/**
 * Alternative approach: Use a predefined UUID for each singleton table
 * This ensures consistency and allows for easy seeding
 */
export const SINGLETON_IDS = {
  hero_section: "11111111-1111-1111-1111-111111111111",
  why_choose_section: "22222222-2222-2222-2222-222222222222",
  product_gallery: "33333333-3333-3333-3333-333333333333",
  trust_section: "44444444-4444-4444-4444-444444444444",
  offer_pricing: "55555555-5555-5555-5555-555555555555",
  customer_reviews: "66666666-6666-6666-6666-666666666666",
  footer: "77777777-7777-7777-7777-777777777777",
  seo_settings: "88888888-8888-8888-8888-888888888888",
  product_popup: "99999999-9999-9999-9999-999999999999",
  exit_intent_popup: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
} as const;

/**
 * Upsert using predefined singleton UUIDs
 */
export async function upsertSingletonWithFixedId(
  tableName: keyof typeof SINGLETON_IDS,
  data: any,
  options: { select?: string } = {},
) {
  try {
    const upsertData = {
      id: SINGLETON_IDS[tableName],
      ...data,
      updated_at: new Date().toISOString(),
    };

    const selectClause = options.select || "*";
    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(upsertData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select(selectClause);

    return { data: result, error };
  } catch (error) {
    console.error(
      `Error in upsertSingletonWithFixedId for ${tableName}:`,
      error,
    );
    return { data: null, error };
  }
}

/**
 * Get singleton data (first row from table)
 */
export async function getSingletonData(
  tableName: string,
  select: string = "*",
) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(select)
      .limit(1)
      .single();

    return { data, error };
  } catch (error) {
    console.error(`Error in getSingletonData for ${tableName}:`, error);
    return { data: null, error };
  }
}
