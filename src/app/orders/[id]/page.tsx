export default async function OrderPage(
    props: { params: Promise<{ id: string }> }
) {
    const { id } = await props.params;

    return (
        <main style={{ padding: 24 }}>
            <h1>Order created ✅</h1>
            <p><b>Order ID:</b> {id}</p>
        </main>
    );
}
