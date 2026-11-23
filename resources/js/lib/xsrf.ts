/** O token do cookie XSRF-TOKEN, para pedidos `fetch` fora do Inertia. */
export function xsrfToken(): string {
    const cookie = document.cookie
        .split('; ')
        .find((part) => part.startsWith('XSRF-TOKEN='));

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}
