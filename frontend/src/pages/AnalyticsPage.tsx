import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AnalyticsData } from '../types';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import {
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
import { BarChart3, MousePointerClick, Globe, Smartphone, Info } from 'lucide-react';

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#16A34A',
  mobile: '#0284C7',
  tablet: '#8B5CF6',
  bot: '#F43F5E',
  unknown: '#64748B',
};

export const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState<'7' | '30'>('7');

  const daysNum = parseInt(days, 10);

  const { data: response, isLoading } = useQuery<{ data: AnalyticsData }>({
    queryKey: ['analytics', daysNum],
    queryFn: () => api.get(`/analytics/details?days=${daysNum}`),
  });

  const analytics = response?.data;
  const clicksOverTime = analytics?.clicksOverTime || [];
  const referrers = analytics?.referrers || [];
  const devices = analytics?.devices || [];

  // Compute summary values from existing response data
  const totalClicksInRange = clicksOverTime.reduce((sum, item) => sum + item.clicks, 0);

  const sortedReferrers = [...referrers].sort((a, b) => b.count - a.count);
  const topReferrer = sortedReferrers.length > 0 ? sortedReferrers[0].referrer : 'None yet';

  const sortedDevices = [...devices].sort((a, b) => b.count - a.count);
  const topDevice =
    sortedDevices.length > 0
      ? sortedDevices[0].device.charAt(0).toUpperCase() + sortedDevices[0].device.slice(1)
      : 'None yet';

  // Format date helper (e.g. "Sep 14")
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formattedClicksOverTime = clicksOverTime.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  // Donut chart calculations
  const totalDeviceClicks = devices.reduce((sum, d) => sum + d.count, 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header with SegmentedControl */}
        <PageHeader
          title="Click Telemetry Analytics"
          subtitle="Real-time insights across time-series clicks, referral sources, and visitor device distribution."
          actions={
            <SegmentedControl
              options={[
                { label: 'Last 7 Days', value: '7' },
                { label: 'Last 30 Days', value: '30' },
              ]}
              value={days}
              onChange={(val) => setDays(val)}
            />
          }
        />

        {/* Top 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-28 p-4 flex flex-col justify-between">
                <Skeleton className="w-28 h-4" />
                <Skeleton className="w-16 h-7 mt-2" />
              </Card>
            ))
          ) : (
            <>
              <StatCard
                label="Total Clicks in Range"
                value={totalClicksInRange}
                icon={<MousePointerClick className="w-4 h-4 text-slate-700" />}
              />
              <StatCard
                label="Top Referrer"
                value={topReferrer}
                isNumericValue={false}
                icon={<Globe className="w-4 h-4 text-slate-700" />}
              />
              <StatCard
                label="Top Device"
                value={topDevice}
                isNumericValue={false}
                icon={<Smartphone className="w-4 h-4 text-slate-700" />}
              />
            </>
          )}
        </div>

        {/* Low data hint if under 5 total clicks */}
        {!isLoading && totalClicksInRange > 0 && totalClicksInRange < 5 && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-medium animate-fade-in-up">
            <Info className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>Data gets more meaningful as clicks come in. Share your short links to collect richer insights!</span>
          </div>
        )}

        {isLoading ? (
          <Card className="p-8 text-center space-y-3">
            <Skeleton className="w-full h-64" />
          </Card>
        ) : totalClicksInRange === 0 ? (
          <EmptyState
            icon={<BarChart3 />}
            title="No telemetry data recorded yet"
            description={`No clicks logged in the last ${daysNum} days. Once visitors click your short links, detailed charts will appear here.`}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {/* Clicks Over Time (Bar Chart) */}
            <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Clicks Over Time</h2>
                <span className="text-xs text-slate-500 font-medium">Clicks per day</span>
              </div>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedClicksOverTime} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="formattedDate" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={12}
                      allowDecimals={false}
                      domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax))]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E5E7EB',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="clicks" fill="#16A34A" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Grid: Top Referrers & Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Referrer Sources (Bar Chart) */}
              <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
                <h2 className="text-base font-semibold text-slate-900">Top Referrer Sources</h2>
                {referrers.length > 0 ? (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={referrers} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                        <XAxis type="number" stroke="#94A3B8" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="referrer"
                          stroke="#475569"
                          fontSize={12}
                          width={90}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: '#F1F5F9' }}
                          contentStyle={{
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E5E7EB',
                            borderRadius: '0.5rem',
                            color: '#0F172A',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                          {referrers.map((_, index) => (
                            <Cell
                              key={`ref-cell-${index}`}
                              fill={index === 0 ? '#16A34A' : '#86EFAC'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-16 text-xs text-slate-500">No referrer data logged yet.</div>
                )}
              </Card>

              {/* Device Breakdown (Thinner Donut Chart with center text & legend) */}
              <Card className="p-6 space-y-4 bg-white border border-slate-200/90 shadow-card">
                <h2 className="text-base font-semibold text-slate-900">Device Breakdown</h2>
                {devices.length > 0 ? (
                  <div className="flex flex-col items-center justify-center space-y-4 pt-2">
                    <div className="relative h-48 w-48 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={devices}
                            dataKey="count"
                            nameKey="device"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={60}
                            paddingAngle={3}
                          >
                            {devices.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={DEVICE_COLORS[entry.device.toLowerCase()] || '#64748B'}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E5E7EB',
                              borderRadius: '0.5rem',
                              color: '#0F172A',
                              fontSize: '12px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Donut Center Total Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-bold text-slate-900">{totalDeviceClicks}</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {totalDeviceClicks === 1 ? 'click' : 'clicks'}
                        </span>
                      </div>
                    </div>

                    {/* Legend below with color dots and percentages */}
                    <div className="flex items-center justify-center gap-4 flex-wrap pt-2 border-t border-slate-100 w-full">
                      {devices.map((entry) => {
                        const pct = Math.round((entry.count / totalDeviceClicks) * 100) || 0;
                        const color = DEVICE_COLORS[entry.device.toLowerCase()] || '#64748B';
                        return (
                          <div key={entry.device} className="flex items-center gap-1.5 text-xs">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium text-slate-700 capitalize">{entry.device}</span>
                            <span className="text-slate-400">({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-xs text-slate-500">No device telemetry logged yet.</div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
