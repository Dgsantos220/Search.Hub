<?php

namespace App\Policies;

use App\Models\User;

/**
 * UserPolicy
 * 
 * Define as regras de autorização para o modelo User
 * 
 * @package App\Policies
 */
class UserPolicy
{
    /**
     * Determina se o usuário pode visualizar qualquer modelo User
     *
     * @param \App\Models\User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode visualizar o modelo User especificado
     *
     * @param \App\Models\User $user Usuário autenticado
     * @param \App\Models\User $model Usuário a ser visualizado
     * @return bool
     */
    public function view(User $user, User $model): bool
    {
        return $user->isAdmin() || $user->id === $model->id;
    }

    /**
     * Determina se o usuário pode criar modelos User
     *
     * @param \App\Models\User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode atualizar o modelo User especificado
     *
     * @param \App\Models\User $user Usuário autenticado
     * @param \App\Models\User $model Usuário a ser atualizado
     * @return bool
     */
    public function update(User $user, User $model): bool
    {
        return $user->isAdmin() || $user->id === $model->id;
    }

    /**
     * Determina se o usuário pode deletar o modelo User especificado
     *
     * @param \App\Models\User $user Usuário autenticado
     * @param \App\Models\User $model Usuário a ser deletado
     * @return bool
     */
    public function delete(User $user, User $model): bool
    {
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determina se o usuário pode restaurar o modelo User especificado
     *
     * @param \App\Models\User $user
     * @param \App\Models\User $model
     * @return bool
     */
    public function restore(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determina se o usuário pode deletar permanentemente o modelo User
     *
     * @param \App\Models\User $user
     * @param \App\Models\User $model
     * @return bool
     */
    public function forceDelete(User $user, User $model): bool
    {
        return $user->isAdmin() && $user->id !== $model->id;
    }
}
