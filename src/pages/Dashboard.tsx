import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { useSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';

export const Dashboard: React.FC = () => {
  const { sales, getTotalSales } = useSales();
  const { products } = useProducts();

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const todaySales = getTotalSales(startOfDay, endOfDay);
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 5).length;
  const todaySalesCount = sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= startOfDay && saleDate <= endOfDay && sale.status === 'completed';
  }).length;

  const stats = [
    {
      title: "Vendas Hoje",
      value: `R$ ${todaySales.toFixed(2)}`,
      description: `${todaySalesCount} vendas realizadas`,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Total de Produtos",
      value: totalProducts.toString(),
      description: "Produtos cadastrados",
      icon: Package,
      color: "text-info"
    },
    {
      title: "Estoque Baixo",
      value: lowStockProducts.toString(),
      description: "Produtos com estoque ≤ 5",
      icon: TrendingUp,
      color: "text-warning"
    },
    {
      title: "Vendas do Mês",
      value: `R$ ${sales.filter(sale => sale.status === 'completed').reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}`,
      description: "Total acumulado",
      icon: BarChart3,
      color: "text-primary"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de vendas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Vendas Recentes
          </CardTitle>
          <CardDescription>Últimas vendas realizadas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <p className="font-medium">Venda #{sale.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(sale.createdAt).toLocaleString('pt-BR')} • {sale.cashierName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">R$ {sale.total.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground capitalize">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma venda registrada ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="text-warning">Atenção: Estoque Baixo</CardTitle>
            <CardDescription>
              {lowStockProducts} produto{lowStockProducts > 1 ? 's' : ''} com estoque baixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {products.filter(p => p.stock <= 5).slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center">
                  <span>{product.name}</span>
                  <span className="text-warning font-medium">
                    {product.stock} unidade{product.stock !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};