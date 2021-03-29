import { Component } from '@angular/core';

import { Price } from './models/price.model';
import { PricesService } from './services/prices.service';
import { PriceResponse } from './models/price-response.model';
import { ChartData } from './models/chart-data.model';
import { formatAMPM } from './utils/format-time.util'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  latestPrice!: Price;
  currency: string = 'btc';
  chartData: ChartData[] = [];
  loading = true;
  loadingChart = true;
  errorMessage = '';
  secondsTillRefresh = 1000 * 60 * 5;
  private fetchPriceInterval!: ReturnType<typeof setInterval>;
  private secondsTillRefreshInterval!: ReturnType<typeof setInterval>;

  // options
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  yAxisLabel: string = 'Bitcoin Price ($)';
  rangeFillOpacity = 0.12;
  roundDomains = true;
  autoScale = true;
  colorScheme = { domain: ['#00b862'] };


  constructor(private pricesService: PricesService) { }

  ngOnInit() {
    this.loading = true;
    this.loadingChart = true;
    this.errorMessage = '';
    this.getPrices(false);
  }

  private getPrices(latest: boolean = true, currency: string = 'btc') {
    this.loading = true;
    this.loadingChart = latest ? false : true;

    this.pricesService.getPrices(latest, currency).subscribe(
      (response: PriceResponse) => {
        this.latestPrice = response.data![0];

        if (latest) {
          const chartDataCount = this.chartData[0]?.series.length;
          let dataEntry = this.latestPrice ? this.transformAPIPrice(this.latestPrice) : {}

          if (chartDataCount && JSON.stringify(this.chartData[0].series[chartDataCount - 1]) !== JSON.stringify(dataEntry)) {
            let series = this.chartData[0]?.series;

            series.push(this.transformAPIPrice(this.latestPrice));
            series.shift();
            this.chartData = [{
              name: currency.toUpperCase(),
              series: series
            }]
          }

        } else {
          this.chartData = [{
            name: currency.toUpperCase(),
            series: response.data!.reverse().map(this.transformAPIPrice)
          }]
          this.loadingChart = false;
        }

        this.loading = false;
        this.startFetchLatestPriceInterval();
        this.startSecondsTillRefreshInterval();
      },
      error => {
        this.errorMessage = error.message;
        this.loading = false;
        this.loadingChart = false;
      }
    );
  }

  private transformAPIPrice(price: Price) {

    return {
      name: formatAMPM(new Date(parseFloat(price.timestamp) * 1000)),
      value: price.lastPrice,
      min: price.low,
      max: price.high
    }

  }

  private startFetchLatestPriceInterval() {
    clearInterval(this.fetchPriceInterval);

    const interval = 1000 * 60 * 5;

    this.fetchPriceInterval = setInterval(() => {
      this.secondsTillRefresh = interval;
      this.getPrices();
    }, interval);
  }

  private startSecondsTillRefreshInterval() {
    clearInterval(this.secondsTillRefreshInterval);

    this.secondsTillRefreshInterval = setInterval(() => {
      if (this.secondsTillRefresh >= 1000) {
        this.secondsTillRefresh = this.secondsTillRefresh - 1000;
      }
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.secondsTillRefreshInterval);
    clearInterval(this.fetchPriceInterval);
  }

}
