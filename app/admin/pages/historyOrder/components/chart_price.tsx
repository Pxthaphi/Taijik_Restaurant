"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Orders {
  Order_ID: string;
  Order_Datetime: string;
}

interface OrderProducts {
  Order_ID: string;
  Total_Price: number;
}

// Define the types
type SalesByDayOrMonth = { [key: string]: number };
type ChartData = { label: string; sales: number; trend: number }[];

// Helper to create default sales data for days
const initializeSalesByDay = (): SalesByDayOrMonth => ({
  จันทร์: 0,
  อังคาร: 0,
  พุธ: 0,
  พฤหัสบดี: 0,
  ศุกร์: 0,
  เสาร์: 0,
  อาทิตย์: 0,
});

// Helper to create default sales data for months
const initializeSalesByMonth = (): SalesByDayOrMonth => ({
  มกราคม: 0,
  กุมภาพันธ์: 0,
  มีนาคม: 0,
  เมษายน: 0,
  พฤษภาคม: 0,
  มิถุนายน: 0,
  กรกฎาคม: 0,
  สิงหาคม: 0,
  กันยายน: 0,
  ตุลาคม: 0,
  พฤศจิกายน: 0,
  ธันวาคม: 0,
});

const chartConfig = {
  sales: {
    label: "ยอดขาย",
    color: "#4EA926", // Green color for bars
  },
  trend: {
    label: "Trend",
    color: "#FFB800", // Yellow color for the trend line
  },
};

// Get the day names in Thai
const getDayName = (dayNumber: number): string => {
  const daysInThai = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];
  return daysInThai[dayNumber];
};

// Get the month names in Thai
const getMonthName = (monthNumber: number): string => {
  const monthsInThai = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  return monthsInThai[monthNumber];
};

// Parse the date and convert from Buddhist calendar to Gregorian for day
const parseDateTimeToDay = (dateString: string): string => {
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);

  // Convert Buddhist year to Gregorian year
  const adjustedYear = year > 2500 ? year - 543 : year;

  const dateObj = new Date(adjustedYear, month - 1, day);

  // Return the day name in Thai
  return getDayName(dateObj.getDay());
};

// Parse the date and convert to month for monthly aggregation
const parseDateTimeToMonth = (dateString: string): string => {
  const [datePart] = dateString.split(" "); // แยกส่วนวันที่จากเวลา
  const [month, year] = datePart.split("/").map(Number);

  // Convert Buddhist year to Gregorian year
  const adjustedYear = year > 2500 ? year - 543 : year;

  console.log("Original Date:", dateString); // แสดงข้อมูลวันที่ต้นฉบับ
  console.log("Parsed Month:", getMonthName(month - 1)); // แสดงเดือนที่แปลงแล้ว

  // Return the month name in Thai
  return getMonthName(month - 1); // ใช้เดือนจาก index 0
};

export function Chart_Price() {
  const [chartData, setChartData] = useState<ChartData>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0); // State for storing total price
  const [timeRange, setTimeRange] = useState("7d");

  // Fetch data and filter based on the time range (weekly or monthly)
  const getFilteredData = (
    orders: Orders[],
    orderProducts: OrderProducts[],
    timeRange: string
  ) => {
    const now = new Date();
    let cutoffDate = new Date();
    const salesByDay = initializeSalesByDay();
    const salesByMonth = initializeSalesByMonth();

    let isMonthly = false;
    if (timeRange === "365d") {
      isMonthly = true;
      cutoffDate = new Date(now.getFullYear(), 0, 1); // Start of the year
    } else {
      cutoffDate.setDate(now.getDate() - 7); // Last 7 days
    }

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.Order_Datetime);
      return isMonthly
        ? orderDate.getFullYear() === now.getFullYear()
        : orderDate >= cutoffDate;
    });

    filteredOrders.forEach((order) => {
      const totalOrderPrice = orderProducts
        .filter((prod) => prod.Order_ID === order.Order_ID)
        .reduce((sum, prod) => sum + prod.Total_Price, 0);

      if (isMonthly) {
        const orderMonth = parseDateTimeToMonth(order.Order_Datetime);

        console.log("Order Month:", orderMonth); // แสดงเดือนที่ดึงมาได้
        console.log("Total Price for this order:", totalOrderPrice); // แสดงยอดขายของคำสั่งซื้อนั้นๆ

        salesByMonth[orderMonth] += totalOrderPrice;
      } else {
        const orderDay = parseDateTimeToDay(order.Order_Datetime);
        salesByDay[orderDay] += totalOrderPrice;
      }
    });

    const formattedChartData: ChartData = isMonthly
      ? Object.keys(salesByMonth)
          .filter((month) => salesByMonth[month] > 0) // Show only months with sales
          .map((month) => ({
            label: month,
            sales: salesByMonth[month],
            trend: Math.random() * 500, // Placeholder for trend
          }))
      : Object.keys(salesByDay).map((day) => ({
          label: day,
          sales: salesByDay[day],
          trend: Math.random() * 500, // Placeholder for trend
        }));

    return formattedChartData;
  };

  useEffect(() => {
    async function fetchSalesData() {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("Order_ID, Order_Datetime");

      const { data: orderProducts, error: orderProductsError } = await supabase
        .from("order_products")
        .select("Order_ID, Total_Price");

      console.table(orders); // ตรวจสอบว่ามีข้อมูลคำสั่งซื้อหรือไม่
      console.table(orderProducts); // ตรวจสอบว่ามีข้อมูลสินค้าในคำสั่งซื้อหรือไม่

      if (ordersError || orderProductsError) {
        console.error(
          "Error fetching data:",
          ordersError || orderProductsError
        );
        return;
      }

      // Sum up the total price from all order products
      const totalPriceSum = orderProducts.reduce(
        (sum, prod) => sum + prod.Total_Price,
        0
      );
      setTotalPrice(totalPriceSum); // Set the total price

      const filteredData = getFilteredData(orders, orderProducts, timeRange);
      setChartData(filteredData); // Set the filtered chart data
    }

    fetchSalesData();
  }, [timeRange]);

  return (
    <Card className="max-w-lg mx-auto p-1 shadow-md rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-DB_Med text-gray-700">
            ยอดเงินรวม
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[160px] rounded-xl sm:ml-auto font-DB_Med"
              aria-label="Select a value"
            >
              <SelectValue placeholder="รายวัน" />
            </SelectTrigger>
            <SelectContent className="rounded-xl font-DB_Med">
              <SelectItem value="7d" className="rounded-lg font-DB_Med">
                รายวัน
              </SelectItem>
              <SelectItem value="365d" className="rounded-lg font-DB_Med">
                รายเดือน
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-DB_Med text-green-700">฿{totalPrice}</div>
        <ResponsiveContainer width="100%" height={200} className="mt-8">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis hide={true} />
            <Tooltip cursor={false} />
            <Bar
              dataKey="sales"
              fill={chartConfig.sales.color}
              radius={[10, 10, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke={chartConfig.trend.color}
              strokeWidth={2.5}
              dot={{ stroke: chartConfig.trend.color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="pt-4">
        <div className="text-sm text-gray-500">ยอดขายรวมสำหรับช่วงที่เลือก</div>
      </CardFooter>
    </Card>
  );
}

export default Chart_Price;
