"use client";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa"; // Using react-icons for star icons
import { supabase } from "@/lib/supabase"; // Replace with actual supabase path
import { getUserID } from "@/app/auth/getUserID"; // Adjust path as needed

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Define the Review interface
interface Review {
  Product_ID: number;
  Review_Star: number;
  Review_Detail: string;
}

interface OrderProduct {
  OrderP_ID: number;
  Order_ID: string;
  Product_ID: number;
  Product_Name: string;
  Product_Qty: number;
  Product_Size: string;
  Product_Meat: number;
  Product_Option: number;
  Product_Noodles: number;
  Product_Detail: string;
  Total_Price: number;
  Meat_Name?: string;
  Option_Name?: string;
  Noodles_Name?: string;
}

interface ReviewDrawerProps {
  orderId: string;
  orderProducts: OrderProduct[];
  setIsModalOpen: (open: boolean) => void; // Add the setter function to control open/close
  setIsSubmitted: (open: boolean) => void; // Add the setter function to control open/close
}

const ReviewDrawer = ({
  orderId,
  orderProducts,
  setIsModalOpen,
  setIsSubmitted,
}: ReviewDrawerProps) => {
  const [reviews, setReviews] = useState<Review[]>(
    orderProducts.map((product) => ({
      Product_ID: product.Product_ID,
      Review_Star: 0, // Default rating value
      Review_Detail: "",
    }))
  );

  const [reviewExists, setReviewExists] = useState(false);

  // Check if a review already exists for the order
  useEffect(() => {
    const checkReviewExists = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("Order_ID")
        .eq("Order_ID", orderId);

      if (error) {
        console.error("Error checking review existence:", error);
        return;
      }

      if (data && data.length > 0) {
        setReviewExists(true); // A review already exists for this order
      }
    };

    checkReviewExists();
  }, [orderId]);

  const handleRatingChange = (index: number, rating: number) => {
    const updatedReviews = [...reviews];
    updatedReviews[index].Review_Star = rating;
    setReviews(updatedReviews);
  };

  const handleReviewDetailChange = (index: number, detail: string) => {
    const updatedReviews = [...reviews];
    updatedReviews[index].Review_Detail = detail;
    setReviews(updatedReviews);
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase.from("reviews").insert(
        reviews.map((review: Review) => ({
          User_ID: getUserID(), // Replace with the actual user ID from your auth system
          Product_ID: review.Product_ID,
          Review_Star: review.Review_Star,
          Review_Detail: review.Review_Detail,
          Review_Time: new Date().toISOString(),
          Order_ID: orderId,
        }))
      );

      if (error) throw error;

      setIsSubmitted(true); // Mark as submitted
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit reviews. Please try again.");
    }
  };

  // Don't show the review drawer if a review already exists
  if (reviewExists) {
    return null; // Optionally, you can return a message instead of null
  }

  return (
    <Drawer open={true} onClose={() => setIsModalOpen(false)}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg my-5">
          <DrawerHeader>
            <DrawerTitle className="text-2xl font-DB_Med text-gray-800">
              มารีวิวอาหารของคุณกันเถอะ
            </DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {orderProducts.map((product, index) => (
              <div key={product.Product_ID} className="mb-6">
                <h3 className="font-DB_Med text-gray-800 text-xl mb-2">
                  {product.Product_Name}
                </h3>
                <div className="flex items-center space-x-1 mb-4">
                  <span className="mr-2 font-DB_Med text-gray-800">
                    รีวิว :
                  </span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(index, star)}
                      className="focus:outline-none"
                    >
                      <FaStar
                        className={`w-6 h-6 ${
                          reviews[index].Review_Star >= star
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="อาหารเป็นยังไงบ้าง รีวิวเลย?"
                  value={reviews[index].Review_Detail}
                  onChange={(e) =>
                    handleReviewDetailChange(index, e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-DB_Med text-gray-800 mt-2"
                />
              </div>
            ))}
          </div>
          <DrawerFooter className="">
            <Button
              onClick={handleSubmit}
              className="bg-green-600 rounded-xl text-lg font-DB_Med hover:bg-green-700"
            >
              ตกลง
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="rounded-xl text-lg font-DB_Med mt-2"
                onClick={() => setIsModalOpen(false)}
              >
                ยกเลิก
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ReviewDrawer;
