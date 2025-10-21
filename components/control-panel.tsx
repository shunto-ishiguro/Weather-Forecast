"use client"

import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ControlPanelProps {
    city: string
    setCity: (city: string) => void
    metric: string
    setMetric: (metric: string) => void
    period: string
    setPeriod: (period: string) => void
    unit: string
    setUnit: (unit: string) => void
}

export function ControlPanel({
    city,
    setCity,
    metric,
    setMetric,
    period,
    setPeriod,
    unit,
    setUnit,
}: ControlPanelProps) {
    return (
        <div className="glass-panel mb-8 p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* City Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">都市を選択</label>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Select value={city} onValueChange={setCity}>
                            <SelectTrigger className="glass-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="東京">東京</SelectItem>
                                <SelectItem value="大阪">大阪</SelectItem>
                                <SelectItem value="札幌">札幌</SelectItem>
                                <SelectItem value="福岡">福岡</SelectItem>
                                <SelectItem value="名古屋">名古屋</SelectItem>
                            </SelectContent>
                        </Select>
                    </motion.div>
                </div>

                {/* Metric Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">指標を選択</label>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Select value={metric} onValueChange={setMetric}>
                            <SelectTrigger className="glass-input">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="気温">気温</SelectItem>
                                <SelectItem value="湿度">湿度</SelectItem>
                                <SelectItem value="風速">風速</SelectItem>
                                <SelectItem value="降水量">降水量</SelectItem>
                            </SelectContent>
                        </Select>
                    </motion.div>
                </div>

                {/* Period Toggle */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">期間</label>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPeriod("48時間")}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${period === "48時間" ? "bg-[#fbbf24] text-gray-900" : "glass-button text-white/70"
                                }`}
                        >
                            48時間
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPeriod("7日間")}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${period === "7日間" ? "bg-[#fbbf24] text-gray-900" : "glass-button text-white/70"
                                }`}
                        >
                            7日間
                        </motion.button>
                    </div>
                </div>

                {/* Unit Toggle */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/90">単位</label>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setUnit("°C")}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${unit === "°C" ? "bg-[#fbbf24] text-gray-900" : "glass-button text-white/70"
                                }`}
                        >
                            °C
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setUnit("°F")}
                            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${unit === "°F" ? "bg-[#fbbf24] text-gray-900" : "glass-button text-white/70"
                                }`}
                        >
                            °F
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    )
}
