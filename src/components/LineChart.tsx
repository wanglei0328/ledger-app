import ReactECharts from 'echarts-for-react';

interface Props {
  data: { month: string; expense: number; income: number }[];
}

export default function LineChart({ data }: Props) {
  if (data.length === 0) return null;

  const months = data.map(d => d.month.slice(5));
  const hasIncome = data.some(d => d.income > 0);

  const series: object[] = [
    {
      name: '支出',
      type: 'line',
      data: data.map(d => d.expense),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        color: '#4f46e5',
        width: 3,
      },
      itemStyle: {
        color: '#4f46e5',
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(79,70,229,0.2)' },
            { offset: 1, color: 'rgba(79,70,229,0.02)' },
          ],
        },
      },
      markLine: {
        silent: true,
        data: [
          {
            type: 'average' as const,
            name: '平均支出',
            label: {
              formatter: '均 ¥{c}',
              color: '#999',
              fontSize: 11,
            },
            lineStyle: { color: '#f59e0b', type: 'dashed' as const },
          },
        ],
      },
    },
  ];

  if (hasIncome) {
    series.push({
      name: '收入',
      type: 'line',
      data: data.map(d => d.income),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        color: '#10b981',
        width: 3,
      },
      itemStyle: {
        color: '#10b981',
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(16,185,129,0.2)' },
            { offset: 1, color: 'rgba(16,185,129,0.02)' },
          ],
        },
      },
    });
  }

  const option = {
    tooltip: {
      trigger: 'axis' as const,
    },
    legend: {
      data: hasIncome ? ['支出', '收入'] : ['支出'],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#999' },
    },
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 30,
    },
    xAxis: {
      type: 'category' as const,
      data: months,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#999', fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      show: false,
    },
    series,
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 220, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
