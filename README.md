## Taijik_Restaurant

![alt text](https://github.com/Pxthaphi/Taijik_Restaurant/blob/master/Taijik.png?raw=true)

## ที่มาของปัญหา/วัตถุประสงค์ในการพัฒนาระบบ

ในปัจจุบันร้านอาหารใต้จิกจะรับออเดอร์จากลูกค้าโดยการจดโน้ตรายการอาหารที่ลูกค้าสั่ง 
ใส่กระดาษไว้โดยทั้งลูกค้าที่โทรมาสั่ง หรือเข้ามาใช้บริการหน้าร้าน ในการรับออเดอร์แต่ละครั้งของเจ้าของร้านในช่วงเวลาที่เร่งด่วนและมีลูกค้าเป็นจำนวนมากเข้ามาสั่งอาหาร ทำให้เจ้าของร้านสับสน และลืมจดในบางครั้ง จึงทำให้เป็นปัญหาแก่ลูกค้าบางคนที่ไม่ได้รับอาหารที่ตนได้สั่งไว้

ทางคณะผู้จัดทำได้เล็งเห็นถึงปัญหาเหล่านั้นจึงได้จัดทำเว็บแอปพลิเคชันผ่าน Line ที่ใช้ในการรับออเดอร์รายการอาหารที่ลูกค้าสั่ง โดยลูกค้าสามารถสั่งอาหารที่ลูกค้าอยากรับประทาน สามารถเลือกได้ว่าจะรับประทานที่ร้านหรือใส่กล่องกลับบ้าน และสามารถเลือกช่วงเวลาในการเข้ามารับประทานอาหารที่ร้าน หรือ เข้ามารับอาหารที่สั่งไว้ หากทำรายการเสร็จระบบจะทำการจัดคิวเพื่อเจ้าของร้านสามารถดูออเดอร์รายการอาหารที่ลูกค้าสั่งได้ง่ายและมีความสะดวกมากขึ้น และเมื่อทางร้านทำอาหารเสร็จแล้วระบบจะส่งข้อความแจ้งเตือนไปที่ลูกค้าผ่านทางแอปพลิเคชันLine ทันที

## ประโยชน์เเละสาระสำคัญในการพัฒนา

-	ช่วยให้การทำงานเป็นระบบมากขึ้น โดยสามารถรับออเดอร์ได้โดยไม่ต้องจดใส่กระดาษ ลดโอกาสที่เจ้าของร้านจะลืมจดเมนูอาหารในช่วงเวลาเร่งรีบ หรือลูกค้าหน้าร้านเยอะ
-	ช่วยให้เจ้าของร้านสามารถติดตามยอดขายได้แบบเรียลไทม์
-	ช่วยให้ลูกค้าสามารถสั่งอาหารได้ง่าย สะดวก และรวดเร็วมากยิ่งขึ้น โดยไม่ต้องมานั่งรอคิวหน้าร้าน
-	ลูกค้าสามารถเลือกช่วงเวลาที่ต้องการเข้าไปรับเมนูอาหารที่สั่งไว้ที่หน้าร้านได้ตามความต้องการ
-	ลูกค้าสามารถรับรู้โปรโมชั่น เมนูขายดี และ เมนูแนะนำของทางร้านได้ ช่วยให้ลูกค้าตัดสินใจในการเลือกเมนูอาหารได้ง่ายขึ้น


## Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
