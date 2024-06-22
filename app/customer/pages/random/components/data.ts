import { supabase } from "@/lib/supabase";

interface TypeItem {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

export const typeproduct: TypeItem[] = [];

async function fetchTypeProducts() {
  try {
    const { data, error } = await supabase
      .from('product_type')
      .select("*");

    if (error) {
      throw new Error('Error fetching type products: ' + error.message);
    }

    if (data) {
      typeproduct.push(...data);
    }
  } catch (error) {
    console.error(error);
  }
}

// Call the function to fetch and populate data when needed
fetchTypeProducts().then(() => {
  // After fetch is complete, log the data
  console.log('typeproduct:', typeproduct);
});

// Export typeproduct array
export default typeproduct;
