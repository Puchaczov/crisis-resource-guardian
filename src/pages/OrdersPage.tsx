import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const OrdersPage = () => {
  const fakeOrders = [
    { id: 1, product: "Żywność długoterminowa", amount: "5000 kg", status: "W realizacji", date: "2024-02-15" },
    { id: 2, product: "Woda pitna", amount: "10000 L", status: "Zatwierdzone", date: "2024-02-14" },
    { id: 3, product: "Konserwy mięsne", amount: "2000 kg", status: "Dostarczone", date: "2024-02-10" },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Zamówienia zasobów</h1>
        <Button>Nowe zamówienie</Button>
      </div>
      
      <div className="grid gap-4">
        {fakeOrders.map(order => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>{order.product}</CardTitle>
              <CardDescription>Zamówienie #{order.id} - {order.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p>Ilość: {order.amount}</p>
                  <p>Status: {order.status}</p>
                </div>
                <Button variant="outline">Szczegóły</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
