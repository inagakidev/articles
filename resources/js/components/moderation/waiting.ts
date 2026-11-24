/** "há 7 h", "há 9 min": quanto a versão espera na fila (RF-378). */
export function waiting(iso: string | null): string {
    if (!iso) {
        return '—';
    }

    const minutes = Math.max(
        0,
        Math.round((Date.now() - new Date(iso).getTime()) / 60000),
    );

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return rest > 0 && hours < 6
        ? `${hours} h ${String(rest).padStart(2, '0')}`
        : `${hours} h`;
}
