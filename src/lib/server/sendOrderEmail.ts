import { resend } from "./resend";

type OrderItem = {
    title: string;
    price: number;
    qty: number;
};

export async function sendOrderEmail(params: {
    orderId: string;
    customerEmail: string;
    total: number;
    items: OrderItem[];
}) {
    const { orderId, customerEmail, total, items } = params;

    const to = process.env.ORDER_NOTIFY_EMAIL;
    const from = process.env.ORDER_FROM_EMAIL || "onboarding@resend.dev";

    if (!to) {
        throw new Error("ORDER_NOTIFY_EMAIL tanımlı değil");
    }

    const itemsHtml = items
        .map(
            (item) => `
        <li>
          ${item.title} - ${item.qty} adet - ${item.price} TL
        </li>
      `
        )
        .join("");

    await resend.emails.send({
        from,
        to,
        subject: `Yeni Sipariş Geldi - ${orderId}`,
        html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Yeni sipariş oluşturuldu</h2>
        <p><strong>Sipariş ID:</strong> ${orderId}</p>
        <p><strong>Müşteri:</strong> ${customerEmail || "Bilinmiyor"}</p>
        <p><strong>Toplam:</strong> ${total} TL</p>
        <h3>Ürünler</h3>
        <ul>
          ${itemsHtml}
        </ul>
      </div>
    `,
    });
}