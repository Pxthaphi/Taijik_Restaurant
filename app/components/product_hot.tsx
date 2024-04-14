export default function Product_Hot() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="rounded-xl overflow-hidden shadow-lg w-1/2">
        <img
          className="w-full h-24 object-cover"
          src="/assets/img/products/1.jpeg"
          alt="เมนู1"
        />
        <div className="px-3 py-2">
          <div className="font-bold text-lg mb-1">ข้าวผัด</div>
          <div className="flex justify-between">
            <p className="text-gray-700 text-sm pt-1">15 นาที</p>
            <p className="text-lg font-semibold text-green-600">฿55</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden shadow-lg w-1/2">
        <img
          className="w-full h-24 object-cover"
          src="/assets/img/products/2.jpg"
          alt="เมนู2"
        />
        <div className="px-3 py-2">
          <div className="font-bold text-lg mb-1">ผัดซีอิ๊ว</div>
          <div className="flex justify-between">
            <p className="text-gray-700 text-sm pt-1">15 นาที</p>
            <p className="text-lg font-semibold text-green-600">฿50</p>
          </div>
        </div>
      </div>
    </div>
  );
}
