"use client"; // This line indicates the component is a Client Component

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

// Define a type for the data returned by the promise
interface ToastData {
  name: string;
}

export default function SonnerDemo() {
  // Define the promise function
  const promise = (): Promise<ToastData> =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ name: "Sonner" }), 2000)
    );

  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(promise(), {
            loading: "กำลังดำเนินการ...",
            success: (data: ToastData) => `${data.name} toast has been added`,
            error: "Error",
          })
        }
      >
        Show Toast
      </Button>

      <div>
        <Toaster richColors />
      </div>
    </>
  );
}
