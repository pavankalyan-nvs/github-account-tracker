import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ChartData } from '../types/github';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  TimeScale
);

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#CBD5E1', // slate-300
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: '#1E293B', // slate-800
      titleColor: '#F1F5F9', // slate-100
      bodyColor: '#CBD5E1', // slate-300
      borderColor: '#475569', // slate-600
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        color: '#334155', // slate-700
      },
      ticks: {
        color: '#94A3B8', // slate-400
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: '#334155', // slate-700
      },
      ticks: {
        color: '#94A3B8', // slate-400
        font: {
          size: 11,
        },
      },
    },
  },
};

export const lineChartOptions = {
  ...defaultChartOptions,
  elements: {
    point: {
      radius: 3,
      hoverRadius: 6,
    },
    line: {
      tension: 0.4,
    },
  },
};

export const barChartOptions = {
  ...defaultChartOptions,
  scales: {
    ...defaultChartOptions.scales,
    y: {
      ...defaultChartOptions.scales.y,
      beginAtZero: true,
    },
  },
};

export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        color: '#CBD5E1', // slate-300
        font: {
          size: 12,
        },
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#1E293B', // slate-800
      titleColor: '#F1F5F9', // slate-100
      bodyColor: '#CBD5E1', // slate-300
      borderColor: '#475569', // slate-600
      borderWidth: 1,
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
};

export const doughnutChartOptions = {
  ...pieChartOptions,
  cutout: '60%',
};

export const timeSeriesOptions = {
  ...defaultChartOptions,
  scales: {
    x: {
      type: 'time' as const,
      time: {
        displayFormats: {
          day: 'MMM dd',
          week: 'MMM dd',
          month: 'MMM yyyy',
        },
      },
      grid: {
        color: '#334155', // slate-700
      },
      ticks: {
        color: '#94A3B8', // slate-400
        font: {
          size: 11,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#334155', // slate-700
      },
      ticks: {
        color: '#94A3B8', // slate-400
        font: {
          size: 11,
        },
      },
    },
  },
};

export const createGradient = (
  canvas: HTMLCanvasElement,
  color: string,
  opacity = 0.2
): CanvasGradient => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get canvas context');
  }
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, color + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
  gradient.addColorStop(1, color + '00');
  return gradient;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatPercentage = (num: number): string => {
  return num.toFixed(1) + '%';
};

export const createLanguageChartData = (
  languages: Array<{ language: string; count: number; color: string }>
): ChartData => {
  return {
    labels: languages.map(lang => lang.language),
    datasets: [
      {
        data: languages.map(lang => lang.count),
        backgroundColor: languages.map(lang => lang.color),
        borderColor: languages.map(lang => lang.color),
        borderWidth: 2,
      },
    ],
  };
};

export const createLocationChartData = (
  locations: Array<{ location: string; count: number }>
): ChartData => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  return {
    labels: locations.map(loc => loc.location),
    datasets: [
      {
        data: locations.map(loc => loc.count),
        backgroundColor: colors.slice(0, locations.length),
        borderColor: colors.slice(0, locations.length),
        borderWidth: 2,
      },
    ],
  };
};

export const exportChartAsImage = async (
  chartRef: React.RefObject<ChartJS>,
  filename: string
): Promise<void> => {
  if (chartRef.current) {
    const chart = chartRef.current;
    const url = chart.toBase64Image();
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
  }
};

export const chartColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  green: '#84CC16',
  orange: '#F97316',
};

export const getChartHeight = (chartType: 'line' | 'bar' | 'pie' | 'doughnut'): number => {
  switch (chartType) {
    case 'pie':
    case 'doughnut':
      return 300;
    case 'line':
    case 'bar':
    default:
      return 250;
  }
};