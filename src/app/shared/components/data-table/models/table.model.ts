export interface TableColumn<T = any> {
  key: keyof T | string; 
  label: string;         // 表头显示文字
  width?: string;        // 列宽
  type?: 'text' | 'image' | 'badge' | 'template'; // 预设类型或自定义模板
}
