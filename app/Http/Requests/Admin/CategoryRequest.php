<?php

namespace App\Http\Requests\Admin;

use App\Domain\Taxonomy\Enums\CategoryColor;
use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Nome nos dois idiomas, únicos, e um dos pastéis (D79). */
class CategoryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name_pt_br' => trim((string) $this->input('name_pt_br')),
            'name_en' => trim((string) $this->input('name_en')),
        ]);
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        $category = $this->route('category');
        $ignore = $category instanceof Category ? $category->id : null;

        return [
            'name_pt_br' => ['required', 'string', 'max:40', Rule::unique('categories')->ignore($ignore)],
            'name_en' => ['required', 'string', 'max:40', Rule::unique('categories')->ignore($ignore)],
            'color' => ['required', Rule::enum(CategoryColor::class)],
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'name_pt_br' => __('admin.taxonomy.category.name_pt_br'),
            'name_en' => __('admin.taxonomy.category.name_en'),
            'color' => __('admin.taxonomy.category.color'),
        ];
    }
}
