<?php

namespace App\Domain\Taxonomy\Actions;

use App\Domain\Taxonomy\Exceptions\TaxonomyRefused;
use App\Models\Tag;
use Illuminate\Support\Facades\DB;

/**
 * Une uma tag a outra (RF-128): as versões que usavam a primeira passam a
 * usar a segunda, e a primeira vira apelido, para quem digitá-la depois
 * cair na tag certa. Apelidos que apontavam para a primeira seguem juntos.
 */
class MergeTags
{
    public function handle(Tag $source, Tag $target): void
    {
        if ($source->is($target) || $target->merged_into_id !== null) {
            throw TaxonomyRefused::sameTag();
        }

        DB::transaction(function () use ($source, $target) {
            $table = DB::table('article_version_tag');

            $table->insertUsing(
                ['article_version_id', 'tag_id'],
                DB::table('article_version_tag as current')
                    ->selectRaw('current.article_version_id, ?', [$target->id])
                    ->where('current.tag_id', $source->id)
                    ->whereNotExists(fn ($query) => $query
                        ->from('article_version_tag as existing')
                        ->whereColumn('existing.article_version_id', 'current.article_version_id')
                        ->where('existing.tag_id', $target->id)),
            );
            $table->where('tag_id', $source->id)->delete();

            Tag::query()->where('merged_into_id', $source->id)->update(['merged_into_id' => $target->id]);
            $source->forceFill(['merged_into_id' => $target->id, 'blocked_at' => null])->save();
        });
    }
}
