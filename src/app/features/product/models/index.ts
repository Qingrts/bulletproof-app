
export interface GolfDayInventory {
  date: string;
  slots: TTimeSlot[];
}

export interface GolfModel {

}

export interface HotelModel {

}


/**
 * 商品基础状态
 */
export type ProductStatus = 'active' | 'disabled' | 'draft';

/**
 * 通用商品模型 (SPU 级)
 */
export interface BaseProduct {
  id: string;
  name: string;             // 商品名称
  category: 'HOTEL' | 'SCENIC' | 'SPRING' | 'GOLF' | 'PACKAGE';
  mainImage: string;        // 列表主图
  album: string[];          // 详情轮播图
  description: string;      // 商品详情描述 (HTML/Markdown)
  basePrice: number;        // 起售价
  status: ProductStatus;    // 上架状态
  sales: number;            // 销量
  sortOrder: number;        // 排序权重
  updatedAt: string;        // 更新时间
}

export interface HotelDayRate {
  date: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  breakfastCount: number;
}

export interface HotelProduct extends BaseProduct {
  category: 'HOTEL' | 'SPRING';
  address: string;
  starRating: number;
  checkInTime: string;      // 入住时间要求
  checkOutTime: string;     // 退房时间要求
  amenities: string[];      // 设施 (WiFi, 停车场等)
  inventory: HotelDayRate[]; // 日历房态数据
}

export interface TTimeSlot {
  time: string;             // HH:mm
  price: number;
  maxPlayers: number;       // 封顶人数 (通常4人)
  bookedCount: number;
  status: 'available' | 'full' | 'maintenance';
}

export interface GolfProduct extends BaseProduct {
  category: 'GOLF';
  holeCount: number;        // 球洞数 (18/27/36)
  courseType: string;       // 球场类型 (山地、林间、海滨)
  tTimeSlots: {
    [date: string]: TTimeSlot[]; // 按日期索引的时段列表
  };
}

export interface PackageResource {
  resourceId: string;
  resourceType: 'HOTEL' | 'SCENIC';
  quantity: number;
  note?: string;            // 如：含2张成人票
}

export interface PackageProduct extends BaseProduct {
  category: 'PACKAGE';
  daysCount: number;        // 套餐天数
  bundledResources: PackageResource[]; // 绑定的资源列表
  bookingNotice: string;    // 预订须知
}

// 联合类型
export type ProductModel = HotelProduct | GolfProduct | PackageProduct;

/**
 * 类型守卫函数：判断是否为高尔夫商品
 */
export function isGolfProduct(p: ProductModel): p is GolfProduct {
  return p.category === 'GOLF';
}

/**
 * 类型守卫函数：判断是否为酒店商品
 */
export function isHotelProduct(p: ProductModel): p is HotelProduct {
  return p.category === 'HOTEL' || p.category === 'SPRING';
}