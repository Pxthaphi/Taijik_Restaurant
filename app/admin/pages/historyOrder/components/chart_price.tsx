"use client";

import { useEffect, useState, FC } from "react";
import {
  Bar,
  BarChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Rectangle,
  RectangleProps,
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
  Promotion_ID: number | null; // Add Promotion_ID
}

interface OrderProducts {
  Order_ID: string;
  Total_Price: number;
}

interface Promotions {
  Promotion_ID: number;
  Promotion_Discount: number;
}

type SalesByDayOrMonth = { [key: string]: number };
type ChartData = { label: string; sales: number; trend: number }[];

// Initialize sales data by day or month
const initializeSalesByDay = (): SalesByDayOrMonth => ({
  จ: 0,
  อ: 0,
  พ: 0,
  พฤ: 0,
  ศ: 0,
  ส: 0,
  อา: 0,
});

const initializeSalesByWeek = (): SalesByDayOrMonth => ({
  "สัปดาห์ที่ 1": 0,
  "สัปดาห์ที่ 2": 0,
  "สัปดาห์ที่ 3": 0,
  "สัปดาห์ที่ 4": 0,
});

const initializeSalesByMonth = (): SalesByDayOrMonth => ({
  "ม.ค.": 0,
  "ก.พ.": 0,
  "มี.ค.": 0,
  "เม.ย.": 0,
  "พ.ค.": 0,
  "มิ.ย.": 0,
  "ก.ค.": 0,
  "ส.ค.": 0,
  "ก.ย.": 0,
  "ต.ค.": 0,
  "พ.ย.": 0,
  "ธ.ค.": 0,
});

// Parse date to day
const parseDateTimeToDay = (dateString: string): string => {
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const adjustedYear = year > 2500 ? year - 543 : year;
  const dateObj = new Date(adjustedYear, month - 1, day);
  return getDayName(dateObj.getDay());
};

// Parse date to month
const parseDateTimeToMonth = (dateString: string): string => {
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const adjustedYear = year > 2500 ? year - 543 : year;
  const dateObj = new Date(adjustedYear, month - 1, day);
  return getMonthName(dateObj.getMonth());
};

// Parse date to week of the month, ensuring correct calculation of the week
const parseDateTimeToWeek = (dateString: string): string => {
  const [datePart] = dateString.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const adjustedYear = year > 2500 ? year - 543 : year;
  const dateObj = new Date(adjustedYear, month - 1, day);

  const firstDayOfMonth = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    1
  );

  const dayOfWeek = firstDayOfMonth.getDay();
  const diffFromFirstDay = dateObj.getDate() + dayOfWeek - 1;
  const weekNumber = Math.floor(diffFromFirstDay / 7) + 1;

  return `สัปดาห์ที่ ${weekNumber}`;
};

// Get abbreviated day name in Thai
const getDayName = (dayNumber: number): string => {
  const daysInThai = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  return daysInThai[dayNumber];
};

// Get abbreviated month name in Thai
const getMonthName = (monthNumber: number): string => {
  const monthsInThai = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return monthsInThai[monthNumber];
};

// Custom Bar component with typed props
interface CustomBarProps extends RectangleProps {
  sales: number;
}

const CustomBar: FC<CustomBarProps> = ({ x, y, width, height, sales }) => {
  const barColorClass =
    sales === 0
      ? "fill-red-500"
      : sales < 1000
      ? "fill-yellow-500"
      : "fill-green-500";
  return (
    <Rectangle
      x={x}
      y={y}
      width={width}
      height={height}
      className={barColorClass}
      radius={[10, 10, 0, 0]}
    />
  );
};

// Main chart component
export function Chart_Price() {
  const [chartData, setChartData] = useState<ChartData>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [timeRange, setTimeRange] = useState("7d");

  // Filter and process data for the chart
  const getFilteredData = (
    orders: Orders[],
    orderProducts: OrderProducts[],
    promotions: Promotions[], // Add promotions parameter
    timeRange: string
  ) => {
    const now = new Date();
    let cutoffDate = new Date();
    let salesByPeriod: SalesByDayOrMonth = initializeSalesByDay();
    let totalSales = 0;
    let isMonthly = false;

    if (timeRange === "7d") {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === "30d") {
      salesByPeriod = initializeSalesByWeek();
      cutoffDate.setDate(1);
    } else if (timeRange === "365d") {
      isMonthly = true;
      salesByPeriod = initializeSalesByMonth();
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredOrders = orders.filter((order) => {
      const [datePart] = order.Order_Datetime.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const adjustedYear = year > 2500 ? year - 543 : year;
      const orderDate = new Date(adjustedYear, month - 1, day);
      return orderDate >= cutoffDate;
    });

    filteredOrders.forEach((order) => {
      const totalOrderPrice = orderProducts
        .filter((prod) => prod.Order_ID === order.Order_ID)
        .reduce((sum, prod) => sum + prod.Total_Price, 0);

      // Find the promotion, or leave it empty if Promotion_ID is null or not found
      const promotion = order.Promotion_ID
        ? promotions.find((promo) => promo.Promotion_ID === order.Promotion_ID)
        : null;

      // Apply discount if a promotion exists, otherwise the discount is 0
      const discount = promotion ? promotion.Promotion_Discount : 0;
      const finalOrderPrice = totalOrderPrice - discount;

      totalSales += finalOrderPrice;

      if (timeRange === "30d") {
        const orderWeek = parseDateTimeToWeek(order.Order_Datetime);
        salesByPeriod[orderWeek] += finalOrderPrice;
      } else if (isMonthly) {
        const orderMonth = parseDateTimeToMonth(order.Order_Datetime);
        salesByPeriod[orderMonth] += finalOrderPrice;
      } else {
        const orderDay = parseDateTimeToDay(order.Order_Datetime);
        salesByPeriod[orderDay] += finalOrderPrice;
      }
    });

    setTotalPrice(totalSales);

    const formattedChartData: ChartData = Object.keys(salesByPeriod).map(
      (period) => ({
        label: period,
        sales: salesByPeriod[period],
        trend: Math.random() * 500,
      })
    );

    return formattedChartData;
  };

  useEffect(() => {
    async function fetchSalesData() {
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("Order_ID, Order_Datetime, Promotion_ID")
        .eq("Order_Status", 4);

      const { data: orderProducts, error: orderProductsError } = await supabase
        .from("order_products")
        .select("Order_ID, Total_Price");

      const { data: promotions, error: promotionsError } = await supabase
        .from("promotions")
        .select("Promotion_ID, Promotion_Discount");

      if (ordersError || orderProductsError || promotionsError) {
        console.error(
          "Error fetching data:",
          ordersError || orderProductsError || promotionsError
        );
        return;
      }

      const filteredData = getFilteredData(
        orders,
        orderProducts,
        promotions,
        timeRange
      );
      setChartData(filteredData);
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
              <SelectItem value="30d" className="rounded-lg font-DB_Med">
                ย้อนหลัง 1 เดือน (สัปดาห์)
              </SelectItem>
              <SelectItem value="365d" className="rounded-lg font-DB_Med">
                ย้อนหลัง 1 ปี (เดือน)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-DB_Med text-green-700 mb-5">฿{totalPrice}</div>
        <ResponsiveContainer width="100%" height={300} className="">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              angle={0}
              style={{ fontSize: "14px" }}
            />
            <Tooltip cursor={false} />
            <Bar
              dataKey="sales"
              shape={(props: any) => (
                <CustomBar {...props} sales={props.payload.sales} />
              )}
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#FFB800"
              strokeWidth={2.5}
              dot={{ stroke: "#FFB800", strokeWidth: 2 }}
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
