<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;

/**
 * Trait HasRoles
 * 
 * Fornece métodos helper para gerenciamento de roles no modelo User
 * 
 * @package App\Traits
 */
trait HasRoles
{
    /**
     * Verifica se o usuário possui uma role específica
     *
     * @param string|Role $role Nome da role ou instância de Role
     * @return bool
     */
    public function hasRole(string|Role $role): bool
    {
        if ($role instanceof Role) {
            return $this->roles->contains('id', $role->id);
        }

        return $this->roles->contains('name', $role);
    }

    /**
     * Verifica se o usuário possui qualquer uma das roles especificadas
     *
     * @param array<string|Role> $roles Array de nomes de roles ou instâncias de Role
     * @return bool
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verifica se o usuário possui todas as roles especificadas
     *
     * @param array<string|Role> $roles Array de nomes de roles ou instâncias de Role
     * @return bool
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Atribui uma role ao usuário
     *
     * @param string|Role $role Nome da role ou instância de Role
     * @return void
     */
    public function assignRole(string|Role $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        if (!$this->hasRole($role)) {
            $this->roles()->attach($role);
        }
    }

    /**
     * Remove uma role do usuário
     *
     * @param string|Role $role Nome da role ou instância de Role
     * @return void
     */
    public function removeRole(string|Role $role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->first();
            
            if (!$role) {
                return;
            }
        }

        $this->roles()->detach($role);
    }

    /**
     * Verifica se o usuário é um administrador
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Verifica se o usuário é um cliente
     *
     * @return bool
     */
    public function isCliente(): bool
    {
        return $this->hasRole('cliente');
    }
}
