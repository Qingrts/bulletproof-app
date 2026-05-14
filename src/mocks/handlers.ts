import { http, HttpResponse } from 'msw';
import { createMockHotel, createMockGolf } from './data-factories';

export const handlers = [
  // 1. 模拟酒店列表接口
  http.get('/api/hotel/products', ({ request }) => {
    console.log('request', request);
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');

    return HttpResponse.json({
      code: '',
      state: 1,
      data: {
        total: 2,
        data: [
            createMockHotel('h_01', '丽思卡尔顿酒店'),
            createMockHotel('h_02', '悦榕庄温泉酒店')
        ]
      }
    });
  }),

  // 2. 模拟高尔夫详情接口 (包含 T-Time 矩阵)
  http.get('/api/golf/products/:id', ({ params }) => {
    return HttpResponse.json(createMockGolf(params['id'] as string));
  }),

  // 3. 模拟保存接口
  http.post('/api/products/save', async ({ request }) => {
    const payload = await request.json();
    console.log('MSW 接收到保存请求:', payload);
    return new HttpResponse(null, { status: 200 });
  })
];