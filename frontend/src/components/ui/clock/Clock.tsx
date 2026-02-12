"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "../card";

export const DashboardClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Set up the interval to update every 1 second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Clean up the interval on component unmount to prevent memory leaks
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="bg-white border border-none shadow-none  overflow-hidden transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-[#6b7280] font-bold">
              Current Time
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-amber-600 tabular-nums">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </h2>
            </div>
            <p className="text-[11px] text-neutral-500 font-bold uppercase ">
              {time.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-100">
            <Clock className="size-8 text-amber-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
