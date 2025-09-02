import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  stock: number;
  category_id?: string | null;
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, barcode, price, stock, category_id")
        .order("created_at", { ascending: false });

      if (error) console.error("Erro ao carregar produtos:", error.message);
      setProducts(data || []);
      setLoading(false);
    })();
  }, []);

  const createProduct = async (p: Omit<Product, "id">) => {
    const { data, error } = await supabase
      .from("products")
      .insert(p)
      .select()
      .single();

    if (error) throw error;
    setProducts((prev) => [data as Product, ...prev]);
  };

  const updateProduct = async (id: string, patch: Partial<Product>) => {
    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    setProducts((prev) => prev.map((x) => (x.id === id ? (data as Product) : x)));
  };

  const removeProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    setProducts((prev) => prev.filter((x) => x.id !== id));
  };

  return { products, loading, createProduct, updateProduct, removeProduct };
}
