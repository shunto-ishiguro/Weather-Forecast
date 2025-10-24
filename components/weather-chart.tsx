"use client"

import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { fetchWeatherData } from "../lib/fetchWeatherData"
import { useMemo } from "react"
import { useMediaQuery } from 'react-responsive'

interface WeatherChartProps {
    city: string
    metric: string
    period: string
    unit: string
}

function getMetricLabel(metric: string, unit: string): string {
    switch (metric) {
        case "気温":
            return `気温 (${unit})`
        case "湿度":
            return "湿度 (%)"
        case "風速":
            return "風速 (m/s)"
        case "降水量":
            return "降水量 (mm)"
        default:
            return metric
    }
}

function getMetricName(metric: string): string {
    switch (metric) {
        case "気温":
            return "気温"
        case "湿度":
            return "湿度"
        case "風速":
            return "風速"
        case "降水量":
            return "降水量"
        default:
            return "value"
    }
}

export function WeatherChart({ city, metric, period, unit }: WeatherChartProps) {
    // SWRキーをユニークに生成（cityなどが変わるたび再取得）
    const swrKey = useMemo(() => [city, metric, period, unit].join("-"), [city, metric, period, unit])

    const isMobile = useMediaQuery({ maxWidth: 639 })

    const { data, error, isLoading } = useSWR<Array<{ time: string; value: number; hour: number }>>(swrKey,
        () => fetchWeatherData(city, metric, period, unit),
        {
            revalidateOnFocus: false,      // タブを戻ってきても再取得しない
            revalidateOnReconnect: true,   // オンライン復帰時のみ再取得
            refreshInterval: 30 * 60 * 1000, // 30分ごとに再取得
        }
    )

    interface CustomTickProps {
        x?: number
        y?: number
        payload?: { value: number }
    }

    const CustomTick = ({ x, y, payload }: CustomTickProps) => {
        if (!payload) return null

        const hour = payload.value

        const interval = 6
        const shouldShow = period === "48時間" ? hour === 0 || hour % interval === 0 : true

        if (!shouldShow) return null

        const label = period === "48時間" ? (hour === 0 ? "現在" : `+${hour}時間`) : hour === 0 ? "今日" : `+${hour}日`

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={16}>
                    {label}
                </text>
            </g>
        )
    }

    return (
        <div className="glass-panel p-6">
            <h2 className="mb-6 text-2xl font-semibold text-white">{getMetricLabel(metric, unit)}</h2>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    // ローディングアニメーションはそのまま
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-[400px] items-center justify-center"
                    >
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[#fbbf24]" />
                    </motion.div>
                ) : error ? (
                    // エラーハンドリング
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex h-[400px] items-center justify-center text-white/70"
                    >
                        データを取得できませんでした。
                    </motion.div>
                ) : (
                    <motion.div
                        key="chart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={isMobile ? "overflow-x-auto" : ""}
                    >
                        <div style={isMobile ? { minWidth: 1000, height: 400 } : { height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 40, right: 40, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="hour" stroke="rgba(255,255,255,0.7)" tick={<CustomTick />} interval={0} />
                                    <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 18 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(26, 11, 46, 0.9)",
                                            border: "1px solid rgba(255,255,255,0.2)",
                                            borderRadius: "8px",
                                            backdropFilter: "blur(10px)",
                                        }}
                                        labelStyle={{ color: "#fff" }}
                                        itemStyle={{ color: "#fbbf24" }}
                                        labelFormatter={(value, payload) => {
                                            if (payload && payload[0]) {
                                                return payload[0].payload.time
                                            }
                                            return value
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" wrapperStyle={{ color: "#fff" }} iconType="line" formatter={() => getMetricName(metric)} />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="url(#lineGradient)"
                                        strokeWidth={3}
                                        dot={{ fill: "#fbbf24", r: 4 }}
                                        activeDot={{ r: 6, fill: "#fbbf24" }}
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                        name={getMetricName(metric)}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
