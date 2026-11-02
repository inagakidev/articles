import { Head } from '@inertiajs/react';

interface Article {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

interface Props {
    articles: Article[];
}

export default function Index({ articles }: Props) {
    return (
        <>
            <Head title="Artigos" />

            <main>
                <h1>Meus artigos</h1>

                {articles.length === 0 ? (
                    <p>Nenhum artigo encontrado.</p>
                ) : (
                    articles.map((article) => (
                        <article key={article.id}>
                            <h2>{article.title}</h2>
                            <p>{article.content}</p>
                        </article>
                    ))
                )}
            </main>
        </>
    );
}
