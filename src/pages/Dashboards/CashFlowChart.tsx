// Charts.tsx
import React from "react";
import ReactApexChart from "react-apexcharts";

type CashflowItem = {
  date: string;
  total_purchase: string; // OUT
  total_sales: string;    // IN
};

interface CashflowChartProps {
  chartId: string;
  data: {
    cashflow?: CashflowItem[];
  };
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ chartId, data }) => {
  const cashflow = data?.cashflow ?? [];

  const categories = cashflow.map((item) => item.date);
  const cashIn = cashflow.map((item) => Number(item.total_sales ?? 0));
  const cashOut = cashflow.map((item) => Number(item.total_purchase ?? 0));

  const series = [
    {
      name: "Cash In",
      data: cashIn,
    },
    {
      name: "Cash Out",
      data: cashOut,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: chartId,
      type: "bar",
      height: 260,
      toolbar: { show: false },
      stacked: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: "10px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => {
          if (!val) return "0";
          if (val >= 1_000_000_000) return `${val / 1_000_000_000}B`;
          if (val >= 1_000_000) return `${val / 1_000_000}M`;
          if (val >= 1_000) return `${val / 1_000}K`;
          return String(val);
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) =>
          new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(Number(val ?? 0)),
      },
    },
    legend: {
      position: "top",
    },
    grid: {
      strokeDashArray: 4,
    },
  };

  return (
    <div id={chartId}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={260}
      />
    </div>
  );
};
