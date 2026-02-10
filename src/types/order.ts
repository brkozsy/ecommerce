export type OrderItem = {
    id: string;
    title: string;
    price: number;
    qty: number;
};

export type Order = {
    id: string;
    userId: string;
    email: string | null;
    items: OrderItem[];
    total: number;
    status: "pending";
    createdAt: string; // ISO
};
