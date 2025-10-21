"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { WeatherChart } from "@/components/weather-chart"
import { ControlPanel } from "@/components/control-panel"

export default function WeatherDashboard() {
  const [city, setCity] = useState("東京")
  const [metric, setMetric] = useState("気温")
  const [period, setPeriod] = useState("48時間")
  const [unit, setUnit] = useState("°C")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f0a1f] p-6 md:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-4xl font-bold text-white md:text-5xl">Weather Forecast</h1>
          <p className="text-lg text-white/70">リアルタイム天気予報ダッシュボード</p>
        </motion.header>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <ControlPanel
            city={city}
            setCity={setCity}
            metric={metric}
            setMetric={setMetric}
            period={period}
            setPeriod={setPeriod}
            unit={unit}
            setUnit={setUnit}
          />
        </motion.div>

        {/* Chart Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <WeatherChart city={city} metric={metric} period={period} unit={unit} />
        </motion.div>
      </div>
    </div>
  )
}
