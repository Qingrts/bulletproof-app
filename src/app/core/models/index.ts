
export interface PaginationResponse<T> {
    page: number;
    total: number;
    data: T;
}
