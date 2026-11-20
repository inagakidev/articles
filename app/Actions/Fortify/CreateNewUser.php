<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Domain\Accounts\Actions\AcceptCurrentPolicies;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(private AcceptCurrentPolicies $acceptPolicies) {}

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // O username é sempre minúsculo (RF-027): "Lia" e "lia" são o mesmo.
        $input['username'] = Str::lower(trim((string) ($input['username'] ?? '')));

        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            // RF-012: só a declaração; nenhuma data de nascimento é guardada.
            'age_confirmed' => ['accepted'],
            // RF-013: aceite das versões em vigor dos Termos e da Privacidade.
            'policies_accepted' => ['accepted'],
        ], attributes: [
            'age_confirmed' => __('account.register.age'),
            'policies_accepted' => __('account.register.policies_short'),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'username' => $input['username'],
                'email' => $input['email'],
                'password' => $input['password'],
                'locale' => app()->getLocale(),
            ]);

            $this->acceptPolicies->handle($user);

            return $user;
        });
    }
}
