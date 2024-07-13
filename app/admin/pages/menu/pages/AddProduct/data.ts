"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Adjust the import path as necessary

interface TypeItem {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

const Product_type = () => {
  const [productTypes, setProductTypes] = useState<TypeItem[]>([]);

  useEffect(() => {
    const fetchTypeProducts = async () => {
      try {
        const { data, error } = await supabase.from("product_type").select("*");

        if (error) {
          throw new Error("Error fetching type products: " + error.message);
        }

        if (data) {
          setProductTypes(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTypeProducts();
  }, []);

  return productTypes;
};

export default Product_type;
