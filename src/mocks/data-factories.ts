import { GolfProduct, HotelProduct, TTimeSlot } from "../app/features/product/models";

// 使用占位图服务
const mockImages = {
  // Lorem Picsum
  getRandomImage: (width: number, height: number, id = Math.floor(Math.random() * 100)) => 
    `https://picsum.photos/id/${id}/${width}/${height}`,
  
  // 纯色占位图
  getPlaceholder: (width: number, height: number, bgColor = 'ccc', textColor = '666', text = '') => 
    `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${text}`,
  
  // 获取随机 Unsplash 图片
  getUnsplashRandom: (width: number, height: number) => 
    `https://source.unsplash.com/random/${width}x${height}`
};


/**
 * 基础商品工厂 (SPU)
 */
export const createBaseProduct = (overrides?: Partial<HotelProduct | GolfProduct>) => ({
  id: `prod_${Math.random().toString(36).substr(2, 9)}`,
  name: '默认商品名称',
  basePrice: 100,
  status: 'active' as const,
  mainImage: mockImages.getRandomImage(300, 200),
  album: [],
  sales: 0,
  sortOrder: 0,
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockHotel = (id: string, name: string, overrides?: Partial<HotelProduct>): HotelProduct => {
  return {
    ...createBaseProduct({ id, name, category: 'HOTEL' }),
    address: '某某市某某路 88 号',
    starRating: 5,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    amenities: ['WiFi', '停车场', '游泳池'],
    inventory: [
      { date: '2026-05-11', price: 599, stock: 10, isAvailable: true, breakfastCount: 2 },
      { date: '2026-05-12', price: 699, stock: 5, isAvailable: true, breakfastCount: 2 }
    ],
    ...overrides
  } as HotelProduct;
};

/**
 * 自动生成 T-Time 时段的辅助工具
 */
const generateSlots = (date: string): TTimeSlot[] => {
  const slots: TTimeSlot[] = [];
  for (let hour = 7; hour <= 10; hour++) { // 模拟 7点到10点
    for (let min of ['00', '15', '30', '45']) {
      slots.push({
        time: `${hour}:${min}`,
        price: 800,
        maxPlayers: 4,
        bookedCount: Math.floor(Math.random() * 5),
        status: 'available'
      });
    }
  }
  return slots;
};

export const createMockGolf = (id: string, name: string = '标准高尔夫球场'): GolfProduct => {
  const today = '2026-05-11';
  return {
    ...createBaseProduct({ id, name, category: 'GOLF' }),
    holeCount: 18,
    courseType: '山地球场',
    tTimeSlots: {
      [today]: generateSlots(today)
    }
  } as GolfProduct;
};