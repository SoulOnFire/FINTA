import { CurrencyPipe } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { ChartsComponent } from '../charts/charts';

interface Movimento {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'credito' | 'debito';
  saldo: number;
  categoria?: string;
  entidade?: string;
}

interface Entidade {
  regex: RegExp;
  descricao: string;
  categoria: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, FormsModule, ChartsComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  constructor(private papa: Papa) {
    this.carregarMovimentosSalvos();
    this.ajustarGraficoParaMobile();
  }
  movimentos = signal<Movimento[]>([]);

  private readonly storageKey = 'finta.movimentos';

  // Toggles de visualização
  mostrarGrafico = signal(true);
    private ajustarGraficoParaMobile() {
      if (typeof window === 'undefined') return;
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        this.mostrarGrafico.set(false);
      }
    }
  mostrarResumo = signal(true);
  mostrarMovimentos = signal(true);

  private prevMostrarGrafico: boolean | null = null;
  private prevMostrarResumo: boolean | null = null;
  private prevMostrarMovimentos: boolean | null = null;

  @HostListener('window:beforeprint')
  onBeforePrint() {
    this.prevMostrarGrafico = this.mostrarGrafico();
    this.prevMostrarResumo = this.mostrarResumo();
    this.prevMostrarMovimentos = this.mostrarMovimentos();

    this.mostrarGrafico.set(false);
    this.mostrarResumo.set(true);
    this.mostrarMovimentos.set(true);
  }

  @HostListener('window:afterprint')
  onAfterPrint() {
    if (this.prevMostrarGrafico !== null) {
      this.mostrarGrafico.set(this.prevMostrarGrafico);
    }
    if (this.prevMostrarResumo !== null) {
      this.mostrarResumo.set(this.prevMostrarResumo);
    }
    if (this.prevMostrarMovimentos !== null) {
      this.mostrarMovimentos.set(this.prevMostrarMovimentos);
    }

    this.prevMostrarGrafico = null;
    this.prevMostrarResumo = null;
    this.prevMostrarMovimentos = null;
  }

  // Filtros
  filtroDataInicio = signal<string>('');
  filtroDataFim = signal<string>('');
  filtroCategoria = signal<string[]>([]);
  filtroTipoMovimento = signal<'todos' | 'credito' | 'debito'>('todos');

  get categoriasDisponiveis() {
    const cats = new Set<string>();
    this.movimentos().forEach(m => cats.add(m.categoria || '🅾️ Outros'));
    return Array.from(cats).sort();
  }

  get movimentosFiltrados() {
    let movimentosFiltrados = this.movimentos();

    // Filtro por data de início
    if (this.filtroDataInicio()) {
      const dataInicio = new Date(this.filtroDataInicio());
      movimentosFiltrados = movimentosFiltrados.filter(m => {
        const dataMovimento = this.parseDate(m.data);
        return dataMovimento >= dataInicio;
      });
    }

    // Filtro por data de fim
    if (this.filtroDataFim()) {
      const dataFim = new Date(this.filtroDataFim());
      dataFim.setHours(23, 59, 59, 999); // Incluir todo o dia
      movimentosFiltrados = movimentosFiltrados.filter(m => {
        const dataMovimento = this.parseDate(m.data);
        return dataMovimento <= dataFim;
      });
    }

    // Filtro por categorias (múltiplas)
    if (this.filtroCategoria().length > 0) {
      movimentosFiltrados = movimentosFiltrados.filter(m =>
        this.filtroCategoria().includes(m.categoria || '🅾️ Outros')
      );
    }

    // Filtro por tipo (detalhes)
    if (this.filtroTipoMovimento() !== 'todos') {
      movimentosFiltrados = movimentosFiltrados.filter(
        m => m.tipo === this.filtroTipoMovimento()
      );
    }

    return movimentosFiltrados;
  }

  private parseDate(dateString: string): Date {
    // Assumindo formato DD/MM/YYYY ou similar
    const parts = dateString.split(/[\/\-]/);
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date(dateString);
  }

  get totaisPorCategoria() {
    const totais: { [categoria: string]: { debitos: number, creditos: number, total: number } } = {};

    this.movimentosFiltrados.forEach(movimento => {
      const categoria = movimento.categoria || '🅾️ Outros';

      if (!totais[categoria]) {
        totais[categoria] = { debitos: 0, creditos: 0, total: 0 };
      }

      if (movimento.tipo === 'debito') {
        totais[categoria].debitos += Math.abs(movimento.valor);
      } else {
        totais[categoria].creditos += movimento.valor;
      }

      totais[categoria].total += movimento.valor;
    });

    return Object.entries(totais)
      .map(([categoria, valores]) => ({ categoria, ...valores }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }

  limparFiltros() {
    this.filtroDataInicio.set('');
    this.filtroDataFim.set('');
    this.filtroCategoria.set([]);
    this.filtroTipoMovimento.set('todos');
  }

  limparMovimentos() {
    this.movimentos.set([]);
    this.salvarMovimentos([]);
    this.limparFiltros();
  }
  categoriasRegex: { [key: string]: RegExp } = {
    '🏧Levantamentos': /(CH-\d+|LEV\s)/i,
    '🤑 Salário':/UNIDADE LOCAL DE S/i,
    '💵 Cartão Crédito CETELEM': /CETELEM/i,
    '🏥 Saúde / Farmácias': /(FARMACIA|CLINICA|CUF|OCULISTA|UNIFERRAZ)/i,
    '⚖️ Impostos / Autoridade Tributária': /(IMPOSTO|AUTORIDADE TRIBUTARIA|ADUANEIRA|AT\d+PPP AUTO)/i,
    '🛒 Supermercados / Mantimentos': /(JASMINE UNIVERSE|WELLS|MEU SUPER|AUCHAN|SURPRESAS REPETIDA|MINIPRECO|SUPERARRIFANA|MEGAFAROL SUPERM|LIDL|CONTINENTE|PINGO DOCE|INTERMARCHE|SUPERMERCADO|FROIZ|SPAR|SUPERFAJOES|WELL'S|TALHOS PAULA SOARES|PODERDAFRUTA)/i,
    '🍔 Restauração / Cafés': /FARTURAS|PAST CONF MOURA|DOCE GERES|REST MERGULHAO|RSTAURANTE O VALINHO|RESTAURA TERRA MAR|SOLAR MINA|REPUBLICA CHURRASCO|TABERNA|O FORNO LEITAO ZE|ROTUNDA LUMINOSA|PEDRO ALEXANDREGONCA|TOCA DA PICANHA|CASA DE MANAS|SUNREST 40|GELATARIA DELIZIA|HILDA BARROS|MINA ESTACAO|ANTASMAC|BOUTIQUE DO GELADO|SABORES A VISTA|UNICAMPOS LDA|TORRE DEL ORO|MESA REDONDA|AGREBELO|YONG YE|ESTACION SERVICIO CA|LA CABRIALEGA|CASA MANOLO|BAR CASA CUEVA|PRAZERES DA TERRA|GARE PARADELA|ANTONIO JULIO|MCDONALD|ALEX REST|AGUDO E AVELUDADO|RAINHA 5|O FORNO LEITAO DO ZE|(Grelha 2020|UNICAMPUS LDA|MCDONALDS|KFC|PANS & COMPANY|CAFE|PASTELARIA|PADARIA|PIZZARIA|PIZZA|RESTAURANTE|ADEGA|TOMATINO|MAGIA CROCANTE|A Tal da Pizza|MR DOG|HAMBURGES|GRILL|CROISSANT|CAFÉ|ACADEMICO|TUDO AOS MOLHOS)/i,
    '⛽ Combustível / Portagens': /(A. T. MOREIRA PINTO|Q8 - BUSTELO|PA ESTARREJA|VIA RODA SOC|COMBUSTIVEI|Puxeiros|Santiago|Pontevedr|GASOLEO NORTE SUR|A\.S\. VOUZELA|CP 109 BUSTELO|POSTO RAINHA FEIRA|RODAREAS VISEU NORTE|PRIO ENERGY|PONTE VASCO GAMA|TORRES & VAZ, LDA|A S AVEIRAS|A MORGADO LDA|A\.S\. S\. J MADEIRA II|JUSTSTRONG|REPSOL|BP|GALP|GEPOIL|PETROZONA|CEPSA|POSTO|COMBUSTIVEIS|COMPRA.*A\d{1,2}$|COMPRA.*A\d{2,3}$|PORTAL ASCENDI|ASCENDI|VIATOLL|ESTACIONAMENTO)/i,
    '🛍️ Lojas Variadas': /(LEFTIES|ESPACO CASA|ZIPPY KIDSTORE|8 AVENIDA|ANTONIO PINHO LDA|SO MUSICA|CP COMBOIOS PORTUGAL|DROGARIA FERNANDO|CINEPLACE|BALIZASLANDIA|SPORTSDIRECT|NORMALA?S?|OXIFARM|CERCIAZ|HOMA|CLINICA DRA.MARIANA|TELEFERICO DE FUENTE|BOWLIKART|NUFRACER|SITAVA|ORBITUR|PROGRESSOPLANTAS|NEW STORE|IKEA|WORTEN|SPORT ZONE|PRIMARK|CORTEFIEL|DOUGLAS|TIFFOSI|DECENIO|C&A|ZARA|SALSA|SPRINTER|SNIPES|MAXMAT|LEROY MERLIN|BRICOLIVEIRA|DECATHLON|EL CORTE INGLES)/i,
    '📱 Telecomunicações': /(VODAFONE|MEO|NOS|SKYSHOWTIME)/i,
    '🎓 Cantina da Escola': /PAYSHOP PORTUGAL SA/i,
    '💡 Serviços essenciais': /(EDP|INDAQUA|ÁGUA|LUZ|GÁS|INSP|MICROSOFT|NET)/i,
    '💳 Seguros / Empréstimos': /(SEGUROS?|EMPRESTIMO|LOGO)/i,
    '📦 Online / E-commerce': /(TICKET LINE|PORTO EDITORA|TEK4LIFE SA|OUTLET PC ONLINE|PROZIS|MARINA ONLINE|GRUPO PORTO EDITORA|BOOKING|GOOGLE|FOTOP|PAYPAL|AMZN|AMAZON|EBAY|REVOLUT|MAKSU|HELP\.MAX|hbomax.com|HIPAY|IFTHENPAY|EASYPAY|VIDAPLAYER|UBER|UBER EATS|UBER ONE|SNIPES|HPY)/i,
    'Ⓜ️ MBWAY': /MBWAY|Trf Imediata|TRF P2P/i,
    '💰 Transferências / Crédito': /(DEPOSITO NUMERARIO|TRF|TRANSF|TRANSFERENCIA|P2P|REGULARIZ TRF|ANUL\. TRANSF|SEPA\+)/i,
    '💸 Pagamentos de serviços': /(PAG\.? SERVICO|PAGAMENTO SERVICOS|PAG\. VODAFONE|PAGAMENTOS)/i,
    '🏦 Poupança / Referências internas': /(POUPFLEX|REF\.POUPFLEX|LIQ\.POUPFLEX)/i,
    '🚗 Reparações Automóvel': /SANJOAUTO|DAKAR AUTO|MATOSINHOS NORAUT/i
  };


  entidades: Entidade[] = [
    // 💵 Levantamentos
    { regex: /CH-\d+/i, descricao: "Levantamento em Cheque", categoria: "💵 Levantamentos" },
    { regex: /LEV\s/i, descricao: "Levantamento Multibanco", categoria: "💵 Levantamentos" },

    // 🛒 Supermercados / Mantimentos
    { regex: /WELLS/i, descricao: "Loja Wells", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /MEU SUPER/i, descricao: "Supermercado Meu Super", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /AUCHAN/i, descricao: "Supermercado Auchan", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /SURPRESAS REPETIDA/i, descricao: "Loja Surpresas Repetida", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /MINIPRECO/i, descricao: "Supermercado Minipreço", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /SUPERARRIFANA/i, descricao: "Supermercado Superarrifana", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /MEGAFAROL SUPERM/i, descricao: "Supermercado Megafarol", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /LIDL/i, descricao: "Supermercado Lidl", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /CONTINENTE/i, descricao: "Supermercado Continente", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /PINGO DOCE/i, descricao: "Supermercado Pingo Doce", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /INTERMARCHE/i, descricao: "Supermercado Intermarché", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /SUPERMERCADO/i, descricao: "Supermercado Genérico", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /FROIZ/i, descricao: "Supermercado Froiz", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /SPAR/i, descricao: "Supermercado Spar", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /SUPERFAJOES/i, descricao: "Supermercado Superfajões", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /WELL'S/i, descricao: "Loja Well’s", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /TALHOS PAULA SOARES/i, descricao: "Talhos Paula Soares", categoria: "🛒 Supermercados / Mantimentos" },
    { regex: /PODERDAFRUTA/i, descricao: "Frutaria Poder da Fruta", categoria: "🛒 Supermercados / Mantimentos" },

    // 🍔 Restauração / Cafés
    { regex: /HILDA BARROS/i, descricao: "Restaurante Hilda Barros", categoria: "🍔 Restauração / Cafés" },
    { regex: /MINA ESTACAO/i, descricao: "Restaurante Mina Estação", categoria: "🍔 Restauração / Cafés" },
    { regex: /BOUTIQUE DO GELADO/i, descricao: "Boutique do Gelado", categoria: "🍔 Restauração / Cafés" },
    { regex: /SABORES A VISTA/i, descricao: "Restaurante Sabores à Vista", categoria: "🍔 Restauração / Cafés" },
    { regex: /UNICAMPOS LDA/i, descricao: "Restaurante Unicampos", categoria: "🍔 Restauração / Cafés" },
    { regex: /TORRE DEL ORO/i, descricao: "Restaurante Torre del Oro", categoria: "🍔 Restauração / Cafés" },
    { regex: /MESA REDONDA/i, descricao: "Restaurante Mesa Redonda", categoria: "🍔 Restauração / Cafés" },
    { regex: /YONG YE/i, descricao: "Restaurante Yong Ye", categoria: "🍔 Restauração / Cafés" },
    { regex: /MCDONALD/i, descricao: "McDonald's", categoria: "🍔 Restauração / Cafés" },
    { regex: /KFC/i, descricao: "KFC", categoria: "🍔 Restauração / Cafés" },
    { regex: /PANS & COMPANY/i, descricao: "Pans & Company", categoria: "🍔 Restauração / Cafés" },
    { regex: /CAFE|CAFÉ/i, descricao: "Café Genérico", categoria: "🍔 Restauração / Cafés" },
    { regex: /PASTELARIA/i, descricao: "Pastelaria", categoria: "🍔 Restauração / Cafés" },
    { regex: /PADARIA/i, descricao: "Padaria", categoria: "🍔 Restauração / Cafés" },
    { regex: /PIZZA|PIZZARIA/i, descricao: "Pizzaria", categoria: "🍔 Restauração / Cafés" },
    { regex: /RESTAURANTE/i, descricao: "Restaurante Genérico", categoria: "🍔 Restauração / Cafés" },
    { regex: /ADEGA/i, descricao: "Adega", categoria: "🍔 Restauração / Cafés" },
    { regex: /TOMATINO/i, descricao: "Restaurante Tomatino", categoria: "🍔 Restauração / Cafés" },
    { regex: /UBER EATS/i, descricao: "Uber Eats", categoria: "🍔 Restauração / Cafés" },

    // ⛽ Combustível / Portagens
    { regex: /REPSOL/i, descricao: "Posto Repsol", categoria: "⛽ Combustível / Portagens" },
    { regex: /BP/i, descricao: "Posto BP", categoria: "⛽ Combustível / Portagens" },
    { regex: /GALP/i, descricao: "Posto Galp", categoria: "⛽ Combustível / Portagens" },
    { regex: /CEPSA/i, descricao: "Posto Cepsa", categoria: "⛽ Combustível / Portagens" },
    { regex: /PRIO ENERGY/i, descricao: "Prio Energy", categoria: "⛽ Combustível / Portagens" },
    { regex: /ASCENDI/i, descricao: "Portagens Ascendi", categoria: "⛽ Combustível / Portagens" },
    { regex: /VIATOLL/i, descricao: "Portagens ViaToll", categoria: "⛽ Combustível / Portagens" },
    { regex: /PORTAL ASCENDI/i, descricao: "Portal Ascendi", categoria: "⛽ Combustível / Portagens" },

    // 🛍️ Lojas Variadas
    { regex: /WORTEN/i, descricao: "Loja Worten", categoria: "🛍️ Lojas Variadas" },
    { regex: /IKEA/i, descricao: "Loja IKEA", categoria: "🛍️ Lojas Variadas" },
    { regex: /SPORT ZONE/i, descricao: "Loja Sport Zone", categoria: "🛍️ Lojas Variadas" },
    { regex: /PRIMARK/i, descricao: "Loja Primark", categoria: "🛍️ Lojas Variadas" },
    { regex: /ZARA/i, descricao: "Loja Zara", categoria: "🛍️ Lojas Variadas" },
    { regex: /DOUGLAS/i, descricao: "Perfumaria Douglas", categoria: "🛍️ Lojas Variadas" },
    { regex: /DECATHLON/i, descricao: "Loja Decathlon", categoria: "🛍️ Lojas Variadas" },
    { regex: /EL CORTE INGLES/i, descricao: "Loja El Corte Inglés", categoria: "🛍️ Lojas Variadas" },

    // 📱 Telecomunicações
    { regex: /VODAFONE/i, descricao: "Vodafone", categoria: "📱 Telecomunicações" },
    { regex: /MEO/i, descricao: "MEO", categoria: "📱 Telecomunicações" },
    { regex: /NOS/i, descricao: "NOS", categoria: "📱 Telecomunicações" },

    // 💡 Serviços essenciais
    { regex: /EDP/i, descricao: "Energia EDP", categoria: "💡 Serviços essenciais" },
    { regex: /INDAQUA/i, descricao: "Água Indaqua", categoria: "💡 Serviços essenciais" },
    { regex: /LUZ/i, descricao: "Fornecimento de Luz", categoria: "💡 Serviços essenciais" },
    { regex: /GÁS/i, descricao: "Fornecimento de Gás", categoria: "💡 Serviços essenciais" },
    { regex: /MICROSOFT/i, descricao: "Serviços Microsoft", categoria: "💡 Serviços essenciais" },
    { regex: /NET/i, descricao: "Internet", categoria: "💡 Serviços essenciais" },

    // 💳 Seguros / Empréstimos
    { regex: /SEGUROS?/i, descricao: "Seguros", categoria: "💳 Seguros / Empréstimos" },
    { regex: /CETELEM/i, descricao: "Cetelem", categoria: "💳 Seguros / Empréstimos" },
    { regex: /LOGO/i, descricao: "Seguro Logo", categoria: "💳 Seguros / Empréstimos" },

    // 📦 Online / E-commerce
    { regex: /AMAZON|AMZN/i, descricao: "Amazon", categoria: "📦 Online / E-commerce" },
    { regex: /EBAY/i, descricao: "eBay", categoria: "📦 Online / E-commerce" },
    { regex: /PAYPAL/i, descricao: "PayPal", categoria: "📦 Online / E-commerce" },
    { regex: /UBER/i, descricao: "Uber", categoria: "📦 Online / E-commerce" },
    { regex: /SNIPES/i, descricao: "Loja Snipes", categoria: "📦 Online / E-commerce" },

    // Ⓜ️ MBWAY
    { regex: /MBWAY/i, descricao: "MB Way", categoria: "Ⓜ️ MBWAY" },
    { regex: /Trf Imediata/i, descricao: "Transferência imediata MB Way", categoria: "Ⓜ️ MBWAY" },

    // 💰 Transferências / Crédito
    { regex: /TRF|TRANSF|TRANSFERENCIA/i, descricao: "Transferência Bancária", categoria: "💰 Transferências / Crédito" },
    { regex: /SEPA\+/i, descricao: "Transferência SEPA", categoria: "💰 Transferências / Crédito" },

    // 💸 Pagamentos de serviços
    { regex: /PAG\.? SERVICO/i, descricao: "Pagamento de Serviço", categoria: "💸 Pagamentos de serviços" },
    { regex: /PAGAMENTO SERVICOS/i, descricao: "Pagamento de Serviços", categoria: "💸 Pagamentos de serviços" },

    // 🏦 Poupança
    { regex: /POUPFLEX/i, descricao: "Produto Poupança Flexível", categoria: "🏦 Poupança / Referências internas" },

    // 🚗 Reparações Automóvel
    { regex: /SANJOAUTO/i, descricao: "Oficina Sanjoauto", categoria: "🚗 Reparações Automóvel" },

    // ⚖️ Impostos
    { regex: /AUTORIDADE TRIBUTARIA/i, descricao: "Autoridade Tributária", categoria: "⚖️ Impostos / Autoridade Tributária" },
    { regex: /IMPOSTO/i, descricao: "Pagamento de Impostos", categoria: "⚖️ Impostos / Autoridade Tributária" },
  ];

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const movimentos = (result.data as any[]).map(row => {
          const descricao = row['Descrição']?.toUpperCase() || '';
          const valor = parseFloat(row['Montante'].replace(',','.'));
          const tipo = valor >= 0 ? 'credito' : 'debito';
          const saldo = parseFloat(row['Saldo'].replace(',','.'));
          // atribuir categoria automaticamente se possível
          let categoria = '🅾️ Outros';
          for (const key of Object.keys(this.categoriasRegex)) {
            if (this.categoriasRegex[key].test(descricao)) {
              categoria = key;
              break;
            }
          }
          let entidade = 'Outra';
          for (const ent of this.entidades) {
            if (ent.regex.test(descricao)) {
              entidade = ent.descricao;
              break;
            }
          }

          return {
            data: row['Data Movimento'],
            descricao,
            valor,
            tipo,
            saldo,
            categoria,
            entidade
          } as Movimento;
        });

        this.movimentos.set(movimentos);
        this.salvarMovimentos(movimentos);
      }
    });
  }

  private salvarMovimentos(movimentos: Movimento[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(movimentos));
    } catch {
      // storage not available; ignore
    }
  }

  private carregarMovimentosSalvos() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Movimento[];
      if (Array.isArray(parsed)) {
        this.movimentos.set(parsed);
      }
    } catch {
      // storage not available or invalid data; ignore
    }
  }
}
