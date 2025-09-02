import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSales } from '@/hooks/useSales';
import { DollarSign, Plus, Minus, Lock, Unlock, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CashMovement {
  id: string;
  type: 'sale' | 'withdrawal' | 'deposit' | 'opening' | 'closing';
  amount: number;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export const CashRegister: React.FC = () => {
  const { user } = useAuth();
  const { sales } = useSales();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [initialAmount, setInitialAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [openedAt, setOpenedAt] = useState<Date | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

  useEffect(() => {
    // Load cash register state from localStorage
    const savedState = localStorage.getItem('cashRegister');
    if (savedState) {
      const state = JSON.parse(savedState);
      setIsOpen(state.isOpen);
      setInitialAmount(state.initialAmount);
      setCurrentAmount(state.currentAmount);
      setMovements(state.movements.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      setOpenedAt(state.openedAt ? new Date(state.openedAt) : null);
    }
  }, []);

  useEffect(() => {
    // Calculate sales amount for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startOfDay && sale.status === 'completed' && sale.paymentMethod === 'cash';
    });
    
    const salesAmount = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    
    if (isOpen) {
      // Add sales to current amount if register is open
      const movementsFromSales = movements.filter(m => m.type !== 'sale').reduce((sum, m) => {
        return m.type === 'deposit' || m.type === 'opening' ? sum + m.amount : sum - m.amount;
      }, 0);
      
      setCurrentAmount(initialAmount + movementsFromSales + salesAmount);
    }
  }, [sales, isOpen, initialAmount, movements]);

  const saveState = (newState: any) => {
    localStorage.setItem('cashRegister', JSON.stringify(newState));
  };

  const openRegister = (amount: number) => {
    const movement: CashMovement = {
      id: Date.now().toString(),
      type: 'opening',
      amount,
      description: 'Abertura de caixa',
      timestamp: new Date(),
      userId: user!.id,
      userName: user!.username
    };

    const newMovements = [movement];
    const newState = {
      isOpen: true,
      initialAmount: amount,
      currentAmount: amount,
      movements: newMovements,
      openedAt: new Date()
    };

    setIsOpen(true);
    setInitialAmount(amount);
    setCurrentAmount(amount);
    setMovements(newMovements);
    setOpenedAt(new Date());
    saveState(newState);

    toast({
      title: "Caixa aberto",
      description: `Caixa aberto com R$ ${amount.toFixed(2)}`
    });
  };

  const closeRegister = () => {
    const movement: CashMovement = {
      id: Date.now().toString(),
      type: 'closing',
      amount: currentAmount,
      description: 'Fechamento de caixa',
      timestamp: new Date(),
      userId: user!.id,
      userName: user!.username
    };

    const newMovements = [...movements, movement];
    const newState = {
      isOpen: false,
      initialAmount: 0,
      currentAmount: 0,
      movements: newMovements,
      openedAt: null
    };

    setIsOpen(false);
    setInitialAmount(0);
    setCurrentAmount(0);
    setMovements(newMovements);
    setOpenedAt(null);
    saveState(newState);

    toast({
      title: "Caixa fechado",
      description: `Caixa fechado com R$ ${currentAmount.toFixed(2)}`
    });
  };

  const addDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    const movement: CashMovement = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      description: 'Depósito em caixa',
      timestamp: new Date(),
      userId: user!.id,
      userName: user!.username
    };

    const newMovements = [...movements, movement];
    const newCurrentAmount = currentAmount + amount;
    const newState = {
      isOpen,
      initialAmount,
      currentAmount: newCurrentAmount,
      movements: newMovements,
      openedAt
    };

    setMovements(newMovements);
    setCurrentAmount(newCurrentAmount);
    setDepositAmount('');
    setIsDepositOpen(false);
    saveState(newState);

    toast({
      title: "Depósito realizado",
      description: `R$ ${amount.toFixed(2)} adicionado ao caixa`
    });
  };

  const addWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0 || amount > currentAmount) return;

    const movement: CashMovement = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      description: withdrawalReason || 'Retirada de caixa',
      timestamp: new Date(),
      userId: user!.id,
      userName: user!.username
    };

    const newMovements = [...movements, movement];
    const newCurrentAmount = currentAmount - amount;
    const newState = {
      isOpen,
      initialAmount,
      currentAmount: newCurrentAmount,
      movements: newMovements,
      openedAt
    };

    setMovements(newMovements);
    setCurrentAmount(newCurrentAmount);
    setWithdrawalAmount('');
    setWithdrawalReason('');
    setIsWithdrawalOpen(false);
    saveState(newState);

    toast({
      title: "Retirada realizada",
      description: `R$ ${amount.toFixed(2)} retirado do caixa`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Caixa</h1>
        <p className="text-muted-foreground">Controle de caixa e movimentações financeiras</p>
      </div>

      {/* Cash Register Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOpen ? <Unlock className="h-5 w-5 text-success" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
            Status do Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={isOpen ? "default" : "secondary"}>
                  {isOpen ? "Aberto" : "Fechado"}
                </Badge>
                {openedAt && (
                  <span className="text-sm text-muted-foreground">
                    Aberto em: {openedAt.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
              {isOpen && (
                <div>
                  <div className="text-3xl font-bold text-success">
                    R$ {currentAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Valor inicial: R$ {initialAmount.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isOpen ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Unlock className="h-4 w-4 mr-2" />
                      Abrir Caixa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Abrir Caixa</DialogTitle>
                      <DialogDescription>
                        Digite o valor inicial para abertura do caixa
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="initialAmount">Valor Inicial</Label>
                        <Input
                          id="initialAmount"
                          type="number"
                          step="0.01"
                          value={initialAmount}
                          onChange={(e) => setInitialAmount(parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <Button 
                        onClick={() => openRegister(initialAmount)} 
                        className="w-full"
                        disabled={initialAmount < 0}
                      >
                        Abrir Caixa
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <>
                  <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Depósito
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Adicionar Depósito</DialogTitle>
                        <DialogDescription>
                          Adicione dinheiro ao caixa
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="depositAmount">Valor do Depósito</Label>
                          <Input
                            id="depositAmount"
                            type="number"
                            step="0.01"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsDepositOpen(false)} className="flex-1">
                            Cancelar
                          </Button>
                          <Button onClick={addDeposit} className="flex-1">
                            Confirmar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Minus className="h-4 w-4 mr-2" />
                        Retirada
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Realizar Retirada</DialogTitle>
                        <DialogDescription>
                          Retire dinheiro do caixa
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalAmount">Valor da Retirada</Label>
                          <Input
                            id="withdrawalAmount"
                            type="number"
                            step="0.01"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            placeholder="0.00"
                            max={currentAmount}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="withdrawalReason">Motivo da Retirada</Label>
                          <Input
                            id="withdrawalReason"
                            value={withdrawalReason}
                            onChange={(e) => setWithdrawalReason(e.target.value)}
                            placeholder="Ex: Troco, despesas..."
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsWithdrawalOpen(false)} className="flex-1">
                            Cancelar
                          </Button>
                          <Button onClick={addWithdrawal} className="flex-1">
                            Confirmar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" onClick={closeRegister}>
                    <Lock className="h-4 w-4 mr-2" />
                    Fechar Caixa
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Sales */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Vendas de Hoje (Dinheiro)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              R$ {sales.filter(sale => {
                const today = new Date();
                const saleDate = new Date(sale.createdAt);
                return saleDate.toDateString() === today.toDateString() && 
                       sale.status === 'completed' && 
                       sale.paymentMethod === 'cash';
              }).reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">
              {sales.filter(sale => {
                const today = new Date();
                const saleDate = new Date(sale.createdAt);
                return saleDate.toDateString() === today.toDateString() && 
                       sale.status === 'completed' && 
                       sale.paymentMethod === 'cash';
              }).length} vendas em dinheiro hoje
            </p>
          </CardContent>
        </Card>
      )}

      {/* Movement History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Movimentações
          </CardTitle>
          <CardDescription>Últimas movimentações do caixa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {movements.slice().reverse().map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium">
                    {movement.type === 'opening' && 'Abertura de Caixa'}
                    {movement.type === 'closing' && 'Fechamento de Caixa'}
                    {movement.type === 'deposit' && 'Depósito'}
                    {movement.type === 'withdrawal' && 'Retirada'}
                    {movement.type === 'sale' && 'Venda'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {movement.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {movement.timestamp.toLocaleString('pt-BR')} • {movement.userName}
                  </div>
                </div>
                <div className={`font-bold ${
                  movement.type === 'deposit' || movement.type === 'opening' || movement.type === 'sale'
                    ? 'text-success' 
                    : 'text-destructive'
                }`}>
                  {movement.type === 'deposit' || movement.type === 'opening' || movement.type === 'sale' ? '+' : '-'}
                  R$ {movement.amount.toFixed(2)}
                </div>
              </div>
            ))}
            
            {movements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação registrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};