import { Component, Input } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts,withDefaultRegisterables} from 'ng2-charts';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.html',
  styleUrls: ['./charts.scss'],
  standalone: true,
  providers: [provideCharts(withDefaultRegisterables())],
  imports: [ BaseChartDirective]
})
export class ChartsComponent {
  @Input() totaisPorCategoria: Array<{ categoria: string, debitos: number, creditos: number, total: number }> = [];

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Despesas por Categoria' }
    }
  };

  get barChartData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: this.totaisPorCategoria.map(item => item.categoria),
      datasets: [
        {
          data: this.totaisPorCategoria.map(item => Math.abs(item.debitos)),
          label: 'Débitos',
          backgroundColor: '#ef4444'
        },
        {
          data: this.totaisPorCategoria.map(item => item.creditos),
          label: 'Créditos',
          backgroundColor: '#22c55e'
        }
      ]
    };
  }
}
