import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { BarChart3, Download, Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';

export const Reports: React.FC = () => {
  const { sales, getSalesByDateRange, getTotalSales } = useSales();
  const { products } = useProducts();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Sales by date range
  const salesInRange = startDate && endDate 
    ? getSalesByDateRange(new Date(startDate), new Date(endDate))
    : getSalesByDateRange(startOfMonth, endOfMonth);

  const totalRevenue = salesInRange.reduce((sum, sale) => sum + sale.total, 0);
  const totalSalesCount = salesInRange.length;
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  // Product performance
  const productSales = salesInRange.reduce((acc, sale) => {
    sale.items.forEach(item => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].revenue += item.subtotal;
    });
    return acc;
  }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Payment methods
  const paymentMethods = salesInRange.reduce((acc, sale) => {
    acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sales by day
  const salesByDay = salesInRange.reduce((acc, sale) => {
    const day = new Date(sale.createdAt).toLocaleDateString('pt-BR');
    acc[day] = (acc[day] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  const exportReport = () => {
    const reportData = {
      periodo: {
        inicio: startDate || startOfMonth.toISOString().split('T')[0],
        fim: endDate || endOfMonth.toISOString().split('T')[0]
      },
      resumo: {
        totalVendas: totalSalesCount,
        faturamento: totalRevenue,
        ticketMedio: averageTicket
      },
      produtosMaisVendidos: topProducts,
      vendasPorDia: salesByDay,
      formasPagamento: paymentMethods
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-vendas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análise de vendas e desempenho</p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
            >
              Mês Atual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalSalesCount} vendas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {averageTicket.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Valor médio por venda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(productSales).reduce((sum, p) => sum + p.quantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Unidades vendidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Produtos Mais Vendidos
          </CardTitle>
          <CardDescription>Top 10 produtos por faturamento no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.quantity} unidades vendidas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">R$ {product.revenue.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    {((product.revenue / totalRevenue) * 100).toFixed(1)}% do total
                  </div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada no período selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
            <CardDescription>Distribuição por método de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(paymentMethods).map(([method, count]) => {
                const percentage = totalSalesCount > 0 ? (count / totalSalesCount) * 100 : 0;
                return (
                  <div key={method} className="flex justify-between items-center">
                    <span className="capitalize">
                      {method === 'cash' ? 'Dinheiro' : 
                       method === 'card' ? 'Cartão' : 'PIX'}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="bg-secondary h-2 w-20 rounded-full">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(paymentMethods).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma venda registrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas por Dia</CardTitle>
            <CardDescription>Faturamento diário no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(salesByDay)
                .sort(([a], [b]) => new Date(a.split('/').reverse().join('-')).getTime() - new Date(b.split('/').reverse().join('-')).getTime())
                .map(([day, amount]) => (
                <div key={day} className="flex justify-between items-center">
                  <span>{day}</span>
                  <span className="font-medium">R$ {amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(salesByDay).length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma venda registrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};