import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// O vite-plus 1.6 deixa o vitest dentro de node_modules/vite-plus, e o
// `declare module 'vitest'` do jest-dom não encontra o módulo a partir da raiz.
// Os testes importam de vite-plus/test, então os matchers são aplicados ali,
// espelhando a declaração do próprio jest-dom.
declare module 'vite-plus/test' {
    interface Assertion<T = any> extends TestingLibraryMatchers<any, T> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<
        any,
        any
    > {}
}
