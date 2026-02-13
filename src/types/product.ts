export type Product = {
    id: string;
    title: string;
    price: number;
    category: string;
    stock: number;
    inStock: boolean;
    imageUrl?: string | null;
    description?: string | null;
    isActive?: boolean;
    createdAt: string | null;
    updatedAt?: string | null;
};