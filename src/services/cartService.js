import { supabase } from '../config/supabase';

export const cartService = {
  async getCart() {
    const { data, error } = await supabase
      .from('carts')
      .select(`
        *,
        products:product_id (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async addToCart(productId, quantity = 1) {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        product_id: productId,
        quantity,
      }, {
        onConflict: 'product_id',
        returning: true,
      });

    if (error) throw error;
    return data;
  },

  async updateQuantity(productId, quantity) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .match({ product_id: productId })
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCart(productId) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .match({ product_id: productId });

    if (error) throw error;
  },

  async clearCart() {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .not('id', 'is', null);

    if (error) throw error;
  }
}; 