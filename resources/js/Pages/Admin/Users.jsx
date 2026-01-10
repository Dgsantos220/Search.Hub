import AdminLayout from "@/Layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/Components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/Components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Ban,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  RefreshCw,
  UserCheck,
  CreditCard,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { toast } from "sonner";

export default function AdminUsers({ users, roles = [], plans = [], filters = {} }) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [showDeleted, setShowDeleted] = useState(filters.show_deleted || false);

  const handleSearch = (e) => {
    e.preventDefault();
    router.get('/admin/users', { ...filters, search: searchTerm || undefined }, { preserveState: true });
  };

  const handleFilter = (key, value) => {
    router.get('/admin/users', {
      ...filters,
      [key]: value === 'all' ? undefined : value || undefined
    }, { preserveState: true });
  };

  const handleShowDeletedToggle = (checked) => {
    setShowDeleted(checked);
    router.get('/admin/users', { ...filters, show_deleted: checked || undefined }, { preserveState: true });
  };

  const handleDelete = (userId) => {
    if (!confirm('Tem certeza que deseja excluir este usuario?')) return;

    router.delete(`/admin/users/${userId}`, {
      onSuccess: () => toast.success('Usuario excluido com sucesso'),
      onError: () => toast.error('Erro ao excluir usuario'),
    });
  };

  const handleRestore = (userId) => {
    router.post(`/admin/users/${userId}/restore`, {}, {
      onSuccess: () => toast.success('Usuario restaurado com sucesso'),
      onError: () => toast.error('Erro ao restaurar usuario'),
    });
  };

  const handleBlock = (userId) => {
    router.post(`/admin/users/${userId}/block`, {}, {
      onSuccess: () => toast.success('Usuario bloqueado'),
      onError: () => toast.error('Erro ao bloquear usuario'),
    });
  };

  const handleUnblock = (userId) => {
    router.post(`/admin/users/${userId}/unblock`, {}, {
      onSuccess: () => toast.success('Usuario desbloqueado'),
      onError: () => toast.error('Erro ao desbloquear usuario'),
    });
  };

  const handleVerify = (userId) => {
    if (!confirm('Deseja marcar este usuario como verificado manualmente?')) return;

    router.post(`/admin/users/${userId}/verify`, {}, {
      onSuccess: () => toast.success('Usuario verificado com sucesso'),
      onError: () => toast.error('Erro ao verificar usuario'),
    });
  };

  const handleForceDelete = (userId) => {
    if (!confirm('ATENCAO: Esta acao exclui o usuario PERMANENTEMENTE e nao pode ser desfeita. Tem certeza?')) return;

    router.delete(`/admin/users/${userId}/force`, {
      onSuccess: () => toast.success('Usuario excluido permanentemente'),
      onError: () => toast.error('Erro ao excluir usuario permanentemente'),
    });
  };

  const handlePageChange = (page) => {
    router.get('/admin/users', { ...filters, page }, { preserveState: true });
  };

  const usersList = users?.data || [];
  const pagination = {
    current_page: users?.current_page || 1,
    last_page: users?.last_page || 1,
    total: users?.total || 0,
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">Ativo</Badge>;
    }
    return <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/30">Bloqueado</Badge>;
  };

  const getSubscriptionBadge = (subscription) => {
    if (!subscription) {
      return <Badge variant="outline" className="text-muted-foreground border-border">Sem plano</Badge>;
    }
    const statusColors = {
      active: 'bg-green-500/20 text-green-500 border-green-500/30',
      trialing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      canceled: 'bg-red-500/20 text-red-500 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-500 border-gray-500/30',
    };
    return (
      <Badge variant="outline" className={statusColors[subscription.status] || ''}>
        {subscription.plan_name}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Gerenciar Usuarios</h1>
            <p className="text-muted-foreground">Visualize e gerencie todos os usuarios cadastrados.</p>
          </div>
          <Link href="/admin/users/create">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Novo Usuario
            </Button>
          </Link>
        </div>

        <Card className="bg-card border-border backdrop-blur-sm">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="text-foreground">Lista de Usuarios ({pagination.total})</CardTitle>
              <div className="flex flex-wrap gap-2 items-center">
                <form onSubmit={handleSearch} className="relative w-48">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-8 bg-background border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>

                <Select value={filters.role || "all"} onValueChange={(v) => handleFilter('role', v)}>
                  <SelectTrigger className="w-32 bg-background border-border">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>{role.display_name || role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.status || "all"} onValueChange={(v) => handleFilter('status', v)}>
                  <SelectTrigger className="w-32 bg-background border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.plan_id || "all"} onValueChange={(v) => handleFilter('plan_id', v)}>
                  <SelectTrigger className="w-32 bg-background border-border">
                    <SelectValue placeholder="Plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>{plan.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Switch
                    id="show-deleted"
                    checked={showDeleted}
                    onCheckedChange={handleShowDeletedToggle}
                  />
                  <Label htmlFor="show-deleted" className="text-sm text-muted-foreground">Excluidos</Label>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usersList.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum usuario encontrado
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Usuario</TableHead>
                      <TableHead className="text-muted-foreground">Roles</TableHead>
                      <TableHead className="text-muted-foreground">Plano</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Consultas</TableHead>
                      <TableHead className="text-muted-foreground">Cadastro</TableHead>
                      <TableHead className="text-right text-muted-foreground">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.map((user) => (
                      <TableRow
                        key={user.id}
                        className={`border-border hover:bg-muted/50 ${user.deleted_at ? 'opacity-50' : ''}`}
                      >
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{user.name}</p>
                              {user.is_verified && (
                                <ShieldCheck className="w-3 h-3 text-primary" title="Verificado" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((role) => (
                              <Badge key={role.id} variant="outline" className="border-primary/50 text-primary bg-primary/10">
                                {role.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{getSubscriptionBadge(user.subscription)}</TableCell>
                        <TableCell>
                          {user.deleted_at ? (
                            <Badge variant="outline" className="text-orange-500 border-orange-500/30">Excluido</Badge>
                          ) : (
                            getStatusBadge(user.status)
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.consultas_count || 0}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.created_at}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                              <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                                <Link href={`/admin/users/${user.id}`}>
                                  <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                                </Link>
                              </DropdownMenuItem>

                              {!user.deleted_at && (
                                <>
                                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-muted">
                                    <Link href={`/admin/users/${user.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" /> Editar
                                    </Link>
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator className="bg-border" />

                                  {!user.is_verified && (
                                    <DropdownMenuItem
                                      className="cursor-pointer hover:bg-muted text-primary"
                                      onClick={() => handleVerify(user.id)}
                                    >
                                      <ShieldCheck className="mr-2 h-4 w-4" /> Verificar E-mail
                                    </DropdownMenuItem>
                                  )}

                                  {user.status === 'active' ? (
                                    <DropdownMenuItem
                                      className="cursor-pointer hover:bg-muted"
                                      onClick={() => handleBlock(user.id)}
                                    >
                                      <Ban className="mr-2 h-4 w-4" /> Bloquear
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      className="cursor-pointer hover:bg-muted"
                                      onClick={() => handleUnblock(user.id)}
                                    >
                                      <UserCheck className="mr-2 h-4 w-4" /> Desbloquear
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuItem
                                    className="cursor-pointer hover:bg-red-500/10 text-red-500 hover:text-red-400 focus:text-red-400"
                                    onClick={() => handleDelete(user.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </>
                              )}

                              {user.deleted_at && (
                                <>
                                  <DropdownMenuItem
                                    className="cursor-pointer hover:bg-muted text-green-500"
                                    onClick={() => handleRestore(user.id)}
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" /> Restaurar
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    className="cursor-pointer hover:bg-red-500/10 text-red-600 focus:text-red-500 font-bold"
                                    onClick={() => handleForceDelete(user.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Definitivamente
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pagination.last_page > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Pagina {pagination.current_page} de {pagination.last_page}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={pagination.current_page === 1}
                        className="border-border"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={pagination.current_page === pagination.last_page}
                        className="border-border"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
