import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'cyan';
}

const colors = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
};

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, color }: StatsCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-card-bg p-5 rounded-xl border border-[#E5E7EB] dark:border-border shadow-sm hover:shadow-md transition-all h-full"
    >
      <div className="flex flex-col h-full">
        <p className="text-[13px] font-medium text-gray-500 dark:text-text-secondary mb-2 uppercase tracking-wide">{title}</p>
        <div className="flex items-end justify-between mt-auto">
          <div>
            <h3 className="text-2xl font-bold dark:text-white">{value}</h3>
            {(trend || trendUp !== undefined) && (
              <p className={cn(
                "text-xs font-semibold mt-1",
                trendUp ? "text-success" : "text-danger"
              )}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg bg-gray-50 dark:bg-bg-dark border dark:border-border", colors[color])}>
            <Icon className="w-5 h-5 opacity-80" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
