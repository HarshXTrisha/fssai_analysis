'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  CheckCircle2, AlertTriangle, AlertCircle, Info, Download, 
  TrendingUp, Clock, IndianRupee, ShieldCheck
} from 'lucide-react';
import { AuditReport, FSSAIViolation } from '@/lib/fssai-engine';
import { generatePDF } from '@/lib/pdf-generator';

interface Props {
  report: AuditReport;
}

const severityColors = {
  critical: 'border-brand-danger bg-red-50 text-brand-danger',
  major: 'border-brand-warning bg-orange-50 text-brand-warning',
  minor: 'border-brand-caution bg-amber-50 text-brand-caution'
};

const severityIcons = {
  critical: <AlertCircle className="w-5 h-5" />,
  major: <AlertTriangle className="w-5 h-5" />,
  minor: <Info className="w-5 h-5" />
};

export default function AnalysisDashboard({ report }: Props) {
  const downloadPDF = async () => {
    const blob = await generatePDF(report);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FoodSafe_AI_Report_${new Date().getTime()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FoodSafe_AI_Data_${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dashboardData = report.categories.map(c => ({
    name: c.name.replace(/_/g, ' '),
    score: c.score
  }));

  const reportId = Math.floor(report.confidenceLevel * 9000) + 1000;

  const shareReport = () => {
    const text = `FoodSafe AI Inspection Summary: Score ${report.overallScore}/100, Risk: ${report.riskLevel}. Built by Aura Architects.`;
    if (navigator.share) {
      navigator.share({
        title: 'FoodSafe AI Audit',
        text: text,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert('Report summary copied to clipboard!');
      });
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Score Panel */}
        <div className="hd-card h-[380px]">
          <p className="text-[12px] font-bold uppercase text-gray-500 mb-6 flex justify-between">
            Compliance Score <span>ID: {reportId}-X</span>
          </p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-24 mb-4">
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#eee" strokeWidth="8" strokeLinecap="round"/>
                <path 
                  d="M10 50 A 40 40 0 0 1 90 50" 
                  fill="none" 
                  stroke={report.overallScore >= 90 ? '#388E3C' : report.overallScore >= 75 ? '#1B5E20' : report.overallScore >= 50 ? '#F57C00' : '#D32F2F'} 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray={`${(report.overallScore / 100) * 126} 126`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                <span className="text-4xl font-extrabold leading-none">{report.overallScore}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-[12px] font-bold text-white uppercase tracking-tight ${
              report.overallScore >= 90 ? 'bg-brand-success' :
              report.overallScore >= 75 ? 'bg-brand-primary' :
              report.overallScore >= 50 ? 'bg-brand-warning' :
              'bg-brand-danger'
            }`}>
              RISK LEVEL: {report.riskLevel.toUpperCase()}
            </div>
          </div>
          <div className="mt-4 text-[11px] text-center text-gray-500 leading-tight">
            {report.summary.split('.')[0]}. Reference FSSAI Schedule 4.
          </div>
        </div>

        {/* Categories Panel */}
        <div className="hd-card h-[380px] overflow-y-auto">
          <p className="text-[12px] font-bold uppercase text-gray-500 mb-6 flex justify-between">
            Category Breakdown <span>(%)</span>
          </p>
          <div className="space-y-4">
            {report.categories.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="truncate pr-2">{cat.name.replace(/_/g, ' ')}</span>
                  <span>{cat.score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${cat.score}%`, 
                      backgroundColor: cat.score >= 80 ? '#388E3C' : cat.score >= 60 ? '#1B5E20' : cat.score >= 40 ? '#F57C00' : '#D32F2F' 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-auto pt-6">
            <div className="bg-gray-50 border border-gray-100 p-2 rounded text-center">
              <span className="block text-[11px] font-bold text-brand-primary">₹{report.estimatedTotalFixCostInr.toLocaleString()}</span>
              <p className="text-[9px] text-gray-400 font-bold">Fix Cost Est.</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-2 rounded text-center">
              <span className="block text-[11px] font-bold text-brand-primary">{report.estimatedFixTimeline}</span>
              <p className="text-[9px] text-gray-400 font-bold">Timeline</p>
            </div>
          </div>
        </div>

        {/* Violations Panel */}
        <div className="hd-card h-[380px] overflow-y-auto">
          <p className="text-[12px] font-bold uppercase text-gray-500 mb-6 flex justify-between">
            Priority Violations <span>{report.violations.length} Detected</span>
          </p>
          <div className="space-y-3">
            {report.violations.map((v, i) => (
              <div 
                key={i} 
                className={`p-3 rounded border-l-4 ${
                  v.severity === 'critical' ? 'border-brand-danger bg-red-50' : 
                  v.severity === 'major' ? 'border-brand-warning bg-orange-50' : 
                  'border-brand-caution bg-amber-50'
                }`}
              >
                <div className="flex justify-between text-[10px] font-bold mb-1 uppercase">
                  <span style={{ color: v.severity === 'critical' ? '#D32F2F' : v.severity === 'major' ? '#F57C00' : '#FBC02D' }}>
                    ● {v.severity}
                  </span>
                  <span className="text-gray-400">{v.fssaiReference}</span>
                </div>
                <div className="text-[12px] font-bold mb-1 leading-tight">{v.parameter}</div>
                <div className="text-[11px] text-gray-600 line-clamp-2 leading-snug">{v.observation}</div>
                <div className="inline-block px-1.5 py-0.5 bg-black/5 rounded text-[9px] text-gray-500 mt-2 font-medium">
                  {v.category.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-4 border-t border-brand-border">
        <button onClick={downloadPDF} className="hd-btn hd-btn-primary">Generate Full PDF Report</button>
        <button onClick={downloadJSON} className="hd-btn hd-btn-outline">Export JSON Data</button>
        <button onClick={shareReport} className="hd-btn hd-btn-outline">Share with Authority</button>
        
        <div className="ml-auto text-right text-[10px] text-gray-400 font-medium">
          Analysis Confidence: {Math.round(report.confidenceLevel * 100)}%<br/>
          Powered by Gemini 2.0 Flash
        </div>
      </div>
    </div>
  );
}
