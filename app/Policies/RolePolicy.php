<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

/**
 * RolePolicy
 * 
 * Define as regras de autorização para o modelo Role
 * Apenas administradores podem gerenciar roles
 * 
 * @package App\Policies
 */
class RolePolicy
{
    /**
     * Determina se o usuário pode visualizar qualquer modelo Role
     *
     * @param \App\Models\User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode visualizar o modelo Role especificado
     *
     * @param \App\Models\User $user
     * @param \App\Models\Role $role
     * @return bool
     */
    public function view(User $user, Role $role): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode criar modelos Role
     *
     * @param \App\Models\User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode atualizar o modelo Role especificado
     *
     * @param \App\Models\User $user
     * @param \App\Models\Role $role
     * @return bool
     */
    public function update(User $user, Role $role): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode deletar o modelo Role especificado
     *
     * @param \App\Models\User $user
     * @param \App\Models\Role $role
     * @return bool
     */
    public function delete(User $user, Role $role): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode restaurar o modelo Role especificado
     *
     * @param \App\Models\User $user
     * @param \App\Models\Role $role
     * @return bool
     */
    public function restore(User $user, Role $role): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode deletar permanentemente o modelo Role
     *
     * @param \App\Models\User $user
     * @param \App\Models\Role $role
     * @return bool
     */
    public function forceDelete(User $user, Role $role): bool
    {
        return $user->isAdmin();
    }
}
