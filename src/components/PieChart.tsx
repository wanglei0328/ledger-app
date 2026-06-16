import ReactECharts from 'echarts-for-react';
import type { CategoryStat } from '../types';

interface Props {
  data: CategoryStat[];
  colors?: string[];
}

const DEFAULT_COLORS = [
  '#4f46e5', '#f59e0b', '#ef4444', '#10b981',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
];

export default function PieChart({ data, colors }: Props) {
  if (data.length === 0) return null;

  const option = {
    tooltip: {
      trigger: 'item' as const,
      formatter: '{b}: ¥{c} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 3,
        },
        label: {
          show: true,
          position: 'outside' as const,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: '#666',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.map(d => ({
          value: d.amount,
          name: d.emoji + ' ' + d.categoryName,
        })),
        color: colors || DEFAULT_COLORS,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height: 260, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
