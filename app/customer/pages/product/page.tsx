'use client'
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Define the Product interface
interface Product {
    Product_ID: number;
    Product_Name: string;
    Product_Detail: string;
    Product_Price: number;
    Product_Image: string; // Added Product_Image field
}

export default function ShowProduct() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Function to fetch products from Supabase
    async function fetchProducts() {
        try {
            // Fetch necessary columns including Product_Image
            const { data, error } = await supabase
                .from('products')
                .select('Product_ID, Product_Name, Product_Detail, Product_Price, Product_Image');

            if (error) {
                throw error;
            } else {
                setProducts(data as Product[]);
            }
        } catch (error) {
            setError((error as PostgrestError).message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, []); // Run once on component mount

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="flex items-center justify-between gap-4">
            {products.map((product) => (
                <ProductCard key={product.Product_ID} product={product} />
            ))}
        </div>
    );
}

// ProductCard component
function ProductCard({ product }: { product: Product }) {
    return (
        <div className="rounded-xl overflow-hidden shadow-lg w-1/2">
            <img
                className="w-full h-24 object-cover"
                src={product.Product_Image} // Use Product_Image field as image source
                alt={product.Product_Name}
            />
            <div className="px-3 py-2">
                <div className="font-bold text-lg mb-1">{product.Product_Name}</div>
                <div className="flex justify-between">
                    <p className="text-gray-700 text-sm pt-1">{product.Product_Detail}</p>
                    <p className="text-lg font-semibold text-green-600">฿{product.Product_Price}</p>
                </div>
            </div>
        </div>
    );
}
