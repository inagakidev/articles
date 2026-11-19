# Diretrizes de engenharia

Todas as decisões e implementações deste projeto seguem estas diretrizes. O objetivo não é apenas fazer funcionalidades funcionarem, mas construir uma aplicação sustentável, testável, extensível e de fácil manutenção.

**Princípio central: simplicidade estrutural, baixo acoplamento, alta coesão e regras de negócio independentes de detalhes de infraestrutura.**

## 1. Fontes de verdade

- Requisitos: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md). Não modificar requisitos por conveniência técnica.
- Stack e decisões técnicas: [docs/DECISIONS.md](docs/DECISIONS.md), seção 3.1 e decisões D51 a D56 (editor, imagens, armazenamento, busca, backup e administrador).
- Organização e convenções do código: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Mensagens de commit: [CONTRIBUTING.md](CONTRIBUTING.md).

Mudanças de stack ou de decisão passam primeiro pelo `DECISIONS.md`.

## 2. Princípios de engenharia

### SOLID

- **S — Responsabilidade única:** cada classe tem uma responsabilidade bem definida. Evitar controllers, services ou classes que concentrem responsabilidades não relacionadas.
- **O — Aberto/fechado:** permitir extensão sem alterar constantemente componentes estáveis. Evitar condicionais espalhadas para comportamentos que podem ser extensíveis por abstrações apropriadas.
- **L — Substituição de Liskov:** implementações respeitam os contratos das abstrações, sem comportamentos inesperados.
- **I — Segregação de interfaces:** preferir contratos pequenos e específicos.
- **D — Inversão de dependência:** módulos de alto nível não dependem de implementações concretas quando uma abstração for justificável.

### Acoplamento e coesão

- Baixo acoplamento entre módulos e alta coesão dentro de cada módulo.
- Sem dependências circulares.
- Classes não conhecem detalhes internos de módulos não relacionados.
- Regras de negócio não são acopladas a bibliotecas ou provedores externos.
- Interfaces só quando existir necessidade real de abstração ou substituição. Nada de abstrações prematuras ou interfaces criadas apenas para cumprir SOLID formalmente.

### Separação de responsabilidades

Manter separadas: regras de negócio, persistência, apresentação, autorização, validação, integrações externas, processamento de arquivos e processamento assíncrono.

- Controllers coordenam requisição e resposta; não concentram regras de negócio complexas.
- Models não são depósitos de toda a lógica da aplicação.
- Services não são solução genérica para qualquer código. Cada classe existe por uma responsabilidade concreta.

## 3. Arquitetura e organização do código

A arquitetura é orientada pelo domínio. Funcionalidades relacionadas ficam coesas e as dependências entre módulos são explícitas.

Antes de criar uma camada, classe, interface, trait ou abstração, responder:

1. Qual problema ela resolve?
2. Qual responsabilidade possui?
3. Quem depende dela?
4. Ela reduz ou aumenta o acoplamento?
5. Existe uma alternativa mais simples?
6. A abstração será realmente utilizada?

Não criar estruturas desnecessárias apenas para a arquitetura parecer sofisticada.

## 4. Integrações e dependências externas

Bibliotecas e serviços externos ficam isolados atrás de componentes responsáveis pela integração, quando isso trouxer benefício arquitetural:

- O Cloudflare R2 não é acessado diretamente por regras de negócio; o acesso passa pelo filesystem do Laravel.
- O Intervention Image é usado por uma estratégia de processamento centralizada, não diretamente em vários módulos.
- Detalhes de consulta do MariaDB FULLTEXT não se espalham pela aplicação.
- Tiptap (frontend) e tiptap-php (backend) têm responsabilidades claramente delimitadas.

Usar as abstrações do próprio Laravel quando forem suficientes. Não implementar uma camada adicional sem benefício concreto.

## 5. Qualidade e testes

Toda funcionalidade tem testes automatizados. Priorizar:

- Testes unitários para regras de negócio isoladas.
- Testes de integração para persistência e serviços.
- Testes de funcionalidade para fluxos completos.
- Testes de autorização e permissões.
- Testes de cenários excepcionais.
- Testes de integridade e consistência dos dados.

Os testes validam comportamentos e contratos, não detalhes internos da implementação. Uma funcionalidade não está concluída só porque funciona manualmente.

## 6. Segurança

- Validar dados no servidor e não confiar em dados enviados pelo frontend.
- Aplicar autorização em todas as operações protegidas.
- Sanitizar o conteúdo do editor.
- Proteger uploads, validando formato e tamanho.
- Não expor arquivos privados, credenciais ou configurações sensíveis.
- Aplicar o princípio do menor privilégio.
- Usar transações quando operações relacionadas precisarem manter consistência.

## 7. Processo de desenvolvimento

Antes de implementar uma funcionalidade:

1. Analisar os requisitos funcionais relacionados.
2. Identificar as entidades e regras de negócio envolvidas.
3. Verificar a arquitetura existente.
4. Identificar os módulos afetados.
5. Apresentar a abordagem técnica e suas justificativas.
6. Identificar riscos e impactos em funcionalidades existentes.

Durante a implementação:

- Não duplicar regras de negócio.
- Não criar dependências desnecessárias.
- Não ignorar padrões já estabelecidos sem justificativa.
- Não introduzir bibliotecas sem avaliar licença, manutenção, compatibilidade e custo.

Ao finalizar:

- Executar os testes relevantes e as verificações de qualidade (`composer ci:check`).
- Informar arquivos e componentes alterados.
- Explicar as decisões arquiteturais.
- Identificar eventuais débitos técnicos.
- Sugerir uma mensagem de commit seguindo o [CONTRIBUTING.md](CONTRIBUTING.md).

## 8. Postura técnica

Atuar como engenheiro de software sênior, com postura crítica. Não concordar automaticamente com propostas técnicas: quando uma solução aumentar o acoplamento, dificultar testes, duplicar responsabilidades ou introduzir complexidade desnecessária, explicar o problema e apresentar uma alternativa.

Não confundir arquitetura limpa com excesso de abstrações. A prioridade é um sistema simples, consistente, testável e preparado para evoluir.
