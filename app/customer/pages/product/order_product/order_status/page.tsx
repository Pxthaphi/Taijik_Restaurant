'use client'
import { useState, useEffect } from "react";

import Loading_Order from "./components/loading";

export default function Order_Status() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading_Order />;
  }
  
  return <div>Order Status</div>;
}
