"use client";

import { Check, Copy } from "@phosphor-icons/react";
import { useState } from "react";

interface Detail {
  label: string;
  value: string;
  fullValue?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  details: Detail[];
  status?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  details,
  status,
}: StatCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const isHealthy = status?.toLowerCase() === "ok";

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-3 p-6 border border-[#232323] rounded-[20px] bg-[#050505] transition hover:bg-[#0B0B0B]">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-bold text-[#F5F5F5]">{title}</h4>
        {icon}
      </div>

      <div
        className={`text-2xl font-bold ${
          status
            ? isHealthy
              ? "text-green-400"
              : "text-red-400"
            : "text-[#F5F5F5]"
        }`}
      >
        {value}
      </div>

      <div className="h-px bg-[#494949]" />

      <div className="flex flex-col gap-2">
        {details.map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm text-[#C1C1C1]"
          >
            <span>{d.label}</span>
            <div className="flex items-center gap-2">
              <span className="truncate max-w-[120px]">{d.value}</span>
              {d.fullValue && (
                <button
                  onClick={() => handleCopy(d.label + i, d.fullValue!)}
                  className="text-[#8F8F8F] hover:text-[#F5F5F5] transition"
                  title="Copy address"
                >
                  {copied === d.label + i ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
