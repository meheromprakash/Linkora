import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AnalyticsData } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Calendar, Smartphone, Globe, Shield } from 'lucide-react';

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#40E07B',
  mobile: '#38bdf8',
  tablet: '#a855f7',
  bot: '#f43f5e',
  unknown: '#94a3b8',
};

export const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState(7);

  const { data: response, isLoading } = useQuery<{ data: AnalyticsData }>({
    queryKey: ['analytics', days],
    queryFn: () => api.get(`/analytics/details?days=${days}`),
  });

  const analytics = response?.data;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">Click Telemetry Analytics</h1>
          <p className="text-xs text-slate-400">
            Real-time insights across time-series clicks, referral sources, and visitor device distribution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={days === 7 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDays(7)}
          >
            Last 7 Days
          </Button>
          <Button
            variant={days === 30 ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setDays(30)}
          >
            Last 30 Days
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Loading telemetry charts...</div>
      ) : (
        <div className="space-y-6">
          {/* Clicks Over Time (Area Chart) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-neon" />
              <h2 className="text-lg font-bold text-slate-100">Clicks Over Time</h2>
            </div>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.clicksOverTime || []}>
                  <defs>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#40E07B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#40E07B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.75rem',
                      color: '#fff',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#40E07B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#clickGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Grid: Top Referrers & Device Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Referrers (Bar Chart) */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-slate-100">Top Referrer Sources</h2>
              </div>
              {analytics?.referrers && analytics.referrers.length > 0 ? (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.referrers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis
                        type="category"
                        dataKey="referrer"
                        stroke="#94a3b8"
                        fontSize={12}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="count" fill="#38bdf8" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-500">No referrer data logged yet.</div>
              )}
            </Card>

            {/* Device Distribution (Pie Chart) */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-slate-100">Device Breakdown</h2>
              </div>
              {analytics?.devices && analytics.devices.length > 0 ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.devices}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        paddingAngle={4}
                        label={({ device, count }) => `${device}: ${count}`}
                      >
                        {analytics.devices.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={DEVICE_COLORS[entry.device] || '#94a3b8'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#1e293b',
                          borderRadius: '0.75rem',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-slate-500">No device telemetry logged yet.</div>
              )}
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
