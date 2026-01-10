import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Users, Activity, TrendingUp, UserPlus, AlertCircle } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminDashboard({ stats = {} }) {
  const chartData = stats.charts?.monthly?.map(item => ({
    name: item.month?.slice(-2) || '',
    total: item.total || 0,
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">Visao geral do sistema e metricas principais.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.users?.total || 0}</div>
              <p className="text-xs text-blue-500 flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                +{stats.users?.active_last_30_days || 0} ativos (30d)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultas Hoje
              </CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.consultas?.today || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total do dia
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consultas no Mes
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.consultas?.this_month || 0}</div>
              <p className="text-xs text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status do Sistema
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">OK</div>
              <p className="text-xs text-emerald-500">
                Operacional
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 bg-card border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Consultas por Mes</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="99%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                        dx={-10}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-popover border border-border p-3 rounded-lg shadow-xl outline-none">
                                <p className="text-sm font-medium text-popover-foreground mb-1">{label}</p>
                                <p className="text-2xl font-bold text-primary">
                                  {payload[0].value}
                                  <span className="text-xs font-normal text-muted-foreground ml-1">consultas</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponivel
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3 bg-card border-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {stats.recent_activity?.length > 0 ? (
                  stats.recent_activity.slice(0, 5).map((activity, i) => (
                    <div key={activity.id || i} className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium text-foreground leading-none">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.tipo}: {activity.query}</p>
                      </div>
                      <div className="ml-auto font-medium text-muted-foreground text-xs">{activity.created_at}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhuma atividade recente
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
