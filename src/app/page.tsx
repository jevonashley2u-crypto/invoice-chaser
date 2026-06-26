import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')

  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((acc, i) => acc + Number(i.total), 0) || 0;
  const outstandingCount = invoices?.filter(i => i.status === 'sent').length || 0;
  const outstandingAmount = invoices?.filter(i => i.status === 'sent').reduce((acc, i) => acc + Number(i.total), 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                All time paid invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(outstandingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                From {outstandingCount} sent invoices
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
