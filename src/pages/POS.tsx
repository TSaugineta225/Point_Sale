import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useSales } from '@/hooks/useSales';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Sale } from '@/types';
import { Plus, Minus, Search, ShoppingCart, CreditCard, Banknote, Smartphone, Receipt, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const POS: React.FC = () => {
  const { products, updateStock } = useProducts();
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCart();
  const { addSale } = useSales();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const inStock = product.stock > 0;
    return matchesSearch && matchesCategory && inStock && product.active;
  });

  const subtotal = total;
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal - discountAmount;

  const handleAddToCart = (product: Product) => {
    if (product.stock > 0) {
      addItem(product);
      toast({
        title: "Produto adicionado",
        description: `${product.name} foi adicionado ao carrinho`
      });
    }
  };

  const handleFinalizeSale = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar",
        variant: "destructive"
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmSale = () => {
    if (!user) return;

    // Update stock for all items
    items.forEach(item => {
      updateStock(item.product.id, item.quantity);
    });

    // Create sale record
    const sale = addSale({
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
        subtotal: item.subtotal
      })),
      total: finalTotal,
      paymentMethod,
      customerName: customerName || undefined,
      discount: discountAmount,
      tax: 0,
      status: 'completed',
      cashierId: user.id,
      cashierName: user.username,
      receipt: generateReceiptText()
    });

    setLastSale(sale);
    clearCart();
    setCustomerName('');
    setDiscount(0);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);

    toast({
      title: "Venda finalizada",
      description: `Venda #${sale.id} concluída com sucesso`
    });
  };

  const generateReceiptText = () => {
    const timestamp = new Date().toLocaleString('pt-BR');
    let receipt = `
=================================
         CREART PDV
=================================
Data: ${timestamp}
Operador: ${user?.username}
${customerName ? `Cliente: ${customerName}` : ''}
=================================

`;

    items.forEach(item => {
      receipt += `${item.product.name}
${item.quantity}x R$ ${item.product.price.toFixed(2)} = R$ ${item.subtotal.toFixed(2)}

`;
    });

    receipt += `=================================
Subtotal: R$ ${subtotal.toFixed(2)}
${discount > 0 ? `Desconto (${discount}%): -R$ ${discountAmount.toFixed(2)}\n` : ''}Total: R$ ${finalTotal.toFixed(2)}
Pagamento: ${paymentMethod === 'cash' ? 'Dinheiro' : paymentMethod === 'card' ? 'Cartão' : 'PIX'}
=================================

    Obrigado pela preferência!
         Volte sempre!
`;

    return receipt;
  };

  const downloadReceiptPDF = async () => {
    if (!lastSale) return;
    
    try {
      // Dynamic import for jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        format: [80, 200], // Receipt format (80mm width)
        unit: 'mm'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 10;

      // Header
      doc.setFontSize(16);
      doc.text('CREART PDV', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
      
      doc.setFontSize(10);
      doc.text(`Venda #${lastSale.id}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      doc.text(new Date(lastSale.createdAt).toLocaleString('pt-BR'), pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      doc.text(`Operador: ${lastSale.cashierName}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Line separator
      doc.line(5, yPos, pageWidth - 5, yPos);
      yPos += 5;

      // Items
      doc.setFontSize(8);
      lastSale.items.forEach(item => {
        doc.text(item.productName, 5, yPos);
        yPos += 4;
        
        const itemLine = `${item.quantity}x R$ ${item.unitPrice.toFixed(2)} = R$ ${item.subtotal.toFixed(2)}`;
        doc.text(itemLine, 5, yPos);
        yPos += 6;
      });

      // Line separator
      doc.line(5, yPos, pageWidth - 5, yPos);
      yPos += 5;

      // Total
      doc.setFontSize(10);
      doc.text(`Total: R$ ${lastSale.total.toFixed(2)}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 5;
      
      const paymentText = lastSale.paymentMethod === 'cash' ? 'Dinheiro' : 
                         lastSale.paymentMethod === 'card' ? 'Cartão' : 'PIX';
      doc.text(`Pagamento: ${paymentText}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Footer
      doc.setFontSize(8);
      doc.text('Obrigado pela preferência!', pageWidth / 2, yPos, { align: 'center' });
      yPos += 4;
      doc.text('Volte sempre!', pageWidth / 2, yPos, { align: 'center' });

      // Save PDF
      doc.save(`recibo-${lastSale.id}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive"
      });
    }
  };

  const downloadReceiptTXT = () => {
    if (lastSale?.receipt) {
      const blob = new Blob([lastSale.receipt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibo-${lastSale.id}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ponto de Venda</h1>
          <p className="text-muted-foreground">Selecione produtos para adicionar ao carrinho</p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos ou código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">R$ {product.price.toFixed(2)}</span>
                    <Badge variant={product.stock > 10 ? "default" : "secondary"}>
                      {product.stock} unidades
                    </Badge>
                  </div>
                  
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Cart Items */}
            <div className="flex-1 space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      R$ {item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm font-medium">
                    R$ {item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Carrinho vazio</p>
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {items.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto ({discount}%):</span>
                    <span>-R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={clearCart} variant="outline" className="w-full">
                    Limpar Carrinho
                  </Button>
                  <Button onClick={handleFinalizeSale} className="w-full">
                    Finalizar Venda
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Complete as informações para finalizar a venda
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente (opcional)</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Desconto (%)</label>
              <Input
                type="number"
                min="0"
                max="50"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="flex flex-col h-16"
                >
                  <Banknote className="h-6 w-6" />
                  <span className="text-xs">Dinheiro</span>
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="flex flex-col h-16"
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs">Cartão</span>
                </Button>
                <Button
                  variant={paymentMethod === 'pix' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('pix')}
                  className="flex flex-col h-16"
                >
                  <Smartphone className="h-6 w-6" />
                  <span className="text-xs">PIX</span>
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>R$ {finalTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsCheckoutOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirmSale} className="flex-1">
                Confirmar Venda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Venda Finalizada
            </DialogTitle>
            <DialogDescription>
              Venda #{lastSale?.id} concluída com sucesso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-center text-2xl font-bold text-success">
                R$ {lastSale?.total.toFixed(2)}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                Pagamento via {lastSale?.paymentMethod === 'cash' ? 'Dinheiro' : 
                             lastSale?.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={downloadReceiptTXT} variant="outline" className="flex-1">
                Download TXT
              </Button>
              <Button onClick={downloadReceiptPDF} variant="outline" className="flex-1">
                Download PDF
              </Button>
            </div>
            
            <Button onClick={() => setIsReceiptOpen(false)} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};