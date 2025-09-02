import { supabase } from "@/lib/supabase";

export type CartItem = {
  id: string; // product_id
  name: string;
  qty: number;
  price: number;
};

export async function createSale(
  customer_id: string | null,
  items: CartItem[],
  paymentMethod: "dinheiro" | "cartao" | "pix"
) {
  // 1) cria venda
  const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);

  const { data: sale, error: e1 } = await supabase
    .from("sales")
    .insert({ customer_id, total, status: "concluida" })
    .select()
    .single();

  if (e1) throw e1;

  // 2) cria itens
  const itemsPayload = items.map((it) => ({
    sale_id: sale.id,
    product_id: it.id,
    quantity: it.qty,
    unit_price: it.price,
    subtotal: it.qty * it.price,
  }));

  const { error: e2 } = await supabase.from("sale_items").insert(itemsPayload);
  if (e2) throw e2;

  // 3) cria pagamento
  const { error: e3 } = await supabase
    .from("payments")
    .insert({ sale_id: sale.id, method: paymentMethod, amount: total });

  if (e3) throw e3;

  return sale;
}
