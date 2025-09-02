import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useSales } from '@/hooks/useSales';
import { Receipt, Search, Eye, Calendar, DollarSign } from 'lucide-react';

export const Sales: React.FC = () => {
  const { sales, loading } = useSales();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const filteredSales = sales.filter(sale =>
    sale.id.includes(searchTerm) ||
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSales = sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.total, 0);
  const todaySales = sales.filter(sale => {
    const today = new Date();
    const saleDate = new Date(sale.createdAt);
    return saleDate.toDateString() === today.toDateString() && sale.status === 'completed';
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
        <p className="text-muted-foreground">Histórico de vendas realizadas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {sales.filter(s => s.status === 'completed').length} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {todaySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {todaySales.length} vendas hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Receipt className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {sales.length > 0 ? (totalSales / sales.filter(s => s.status === 'completed').length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por venda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar vendas por ID, cliente ou operador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sales List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <Card key={sale.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">Venda #{sale.id}</h3>
                    <Badge variant={
                      sale.status === 'completed' ? 'default' :
                      sale.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {sale.status === 'completed' ? 'Concluída' :
                       sale.status === 'cancelled' ? 'Cancelada' : 'Pendente'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleString('pt-BR')} • {sale.cashierName}
                    {sale.customerName && ` • Cliente: ${sale.customerName}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'} • 
                    Pagamento: {sale.paymentMethod === 'cash' ? 'Dinheiro' : 
                              sale.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold">R$ {sale.total.toFixed(2)}</div>
                  <div className="flex gap-2 mt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedSale(sale)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Detalhes da Venda #{sale.id}</DialogTitle>
                          <DialogDescription>
                            Informações completas da venda
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Data:</span>
                              <div>{new Date(sale.createdAt).toLocaleString('pt-BR')}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Operador:</span>
                              <div>{sale.cashierName}</div>
                            </div>
                            {sale.customerName && (
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Cliente:</span>
                                <div>{sale.customerName}</div>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Itens da Venda:</h4>
                            <div className="space-y-2">
                              {sale.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <div>
                                    <div>{item.productName}</div>
                                    <div className="text-muted-foreground">
                                      {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="font-medium">
                                    R$ {item.subtotal.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>R$ {sale.total.toFixed(2)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              Pagamento via {sale.paymentMethod === 'cash' ? 'Dinheiro' : 
                                           sale.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSales.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhuma venda encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Tente ajustar sua busca' : 'Nenhuma venda foi registrada ainda'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};