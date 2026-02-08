# FINTA

FINTA is a personal finance dashboard to import bank movements, categorize them automatically, and explore summaries and movement details. This project was built with a strong vibe coding approach: rapid iteration, fast feedback loops, and UX-first tweaks guided by real usage.

## Funcionalidades

- Importação de movimentos por CSV (separador `;`).
- Categorização automática por regras/regex.
- Filtros por data, categoria e tipo (credito/debito/todos).
- Resumo por categoria com debitos, creditos e saldo.
- Lista de movimentos com ordenacao por data e vista mobile.
- Modo de impressao minimalista (resumo + movimentos).

## Exemplo de CSV

```csv
Data Movimento;Data Valor;Descrição;Transacção;Montante;Moeda;Saldo;Taxa Câmbio;Data Taxa Câmbio
18-08-2024;18-08-2024;COMPRA 8385754.96 EDP COMERCIAL SA;-;-69,61;EUR;1876,94;-;-
19-08-2024;19-08-2024;COMPRA 8385754 MCDONALDS DELICIAS.;-;-36,22;EUR;1840,72;-;-
19-08-2024;19-08-2024;COMPRA 8385754 TORRE DEL ORO;-;-12,00;EUR;1828,72;-;-
20-08-2024;20-08-2024;COMPRA 8385754.97 LIDL AGRADECE;-;-38,51;EUR;1790,21;-;-
20-08-2024;20-08-2024;COMPRA 8385754.98 CERCIAZ CEN REC CRI;-;-24,00;EUR;1766,21;-;-
21-08-2024;21-08-2024;TRF A CREDITO SEPA+ - UNIDADE LOCAL DE S;-;1813,02;EUR;3579,23;-;-
22-08-2024;21-08-2024;COMPRA 8385754.99 ADEGA SILVA;-;-72,90;EUR;3506,33;-;-
23-08-2024;23-08-2024;COMPRA 8385754.00 REPSOL E0112;-;-37,75;EUR;3468,58;-;-
24-08-2024;24-08-2024;COMPRA 8385754.01 TALHOS PAULA SOARES;-;-44,45;EUR;3424,13;-;-
24-08-2024;24-08-2024;COMPRA 8385754.02 A32;-;-2,30;EUR;3421,83;-;-
24-08-2024;24-08-2024;COMPRA 8385754.03 A32;-;-2,30;EUR;3419,53;-;-
25-08-2024;25-08-2024;PAG. SERVICO 10095 PAG-ESTADO;-;-278,85;EUR;3140,68;-;-
26-08-2024;26-08-2024;PAGAMENTO DE SEGUROS;-;-20,86;EUR;3119,82;-;-
26-08-2024;26-08-2024;PAGAMENTO DE SEGUROS;-;-17,15;EUR;3102,67;-;-
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.
