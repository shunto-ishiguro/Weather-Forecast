// lib/fetchWeatherData.ts

const cityCoords: Record<string, { lat: number; lon: number }> = {
    東京: { lat: 35.6895, lon: 139.6917 },
    大阪: { lat: 34.6937, lon: 135.5023 },
    札幌: { lat: 43.0618, lon: 141.3545 },
    福岡: { lat: 33.5902, lon: 130.4017 },
    名古屋: { lat: 35.1815, lon: 136.9066 },
}

const keyMap: Record<string, string> = {
    気温: "temperature_2m",
    湿度: "relative_humidity_2m",
    風速: "windspeed_10m",
    降水量: "precipitation",
}

/**
 * 現在時刻から指定期間の天気データを取得
 * SWR 用に最適化済み（キャッシュ対応）
 */
export async function fetchWeatherData(
    city: string,
    metric: string,
    period: string,
    unit: string
): Promise<Array<{ time: string; value: number; hour: number }>> {

    const coords = cityCoords[city]
    if (!coords) throw new Error(`都市 "${city}" の座標が見つかりません`)

    const hourlyParams = ["temperature_2m", "relative_humidity_2m", "precipitation", "windspeed_10m"].join(",")

    // API URL（start パラメータで現在時刻以降を取得）
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=${hourlyParams}&timezone=Asia%2FTokyo`

    // fetch。SWRでキャッシュを有効にするなら cacheオプションは削除または 'force-cache' に
    const res = await fetch(url)
    if (!res.ok) throw new Error("天気データの取得に失敗しました")
    const data = await res.json()

    const key = keyMap[metric]
    const values: number[] = data.hourly[key]
    const times: string[] = data.hourly.time

    if (!values || !times) throw new Error("APIレスポンスに必要なデータが含まれていません")

    // 現在時刻に最も近いインデックスを取得
    const now = new Date()

    console.log(now)

    let currentIndex = times.findIndex(t => new Date(t).getTime() >= now.getTime())
    if (currentIndex === -1) throw new Error("現在時刻に対応するデータが見つかりません")
    else if (currentIndex > 0) {
        currentIndex = currentIndex - 1
    }

    let slicedValues: number[]
    let slicedTimes: string[]

    if (period === "48時間") {
        slicedValues = values.slice(currentIndex, currentIndex + 49)
        slicedTimes = times.slice(currentIndex, currentIndex + 49)
    } else {
        // 7日間モード: 現在時刻から24hごとに7点
        slicedValues = []
        slicedTimes = []
        for (let i = 0; i < 7; i++) {
            const idx = currentIndex + i * 24
            if (idx < values.length) {
                slicedValues.push(values[idx])
                slicedTimes.push(times[idx])
            }
        }
    }

    console.log(slicedValues)
    console.log(slicedTimes)

    const rawData = slicedTimes.map((t, i) => ({
        time:
            period === "48時間"
                ? i === 0 ? "現在" : `+${i}h`
                : i === 0 ? "今日" : `+${i}日`,
        value: metric === "気温" && unit === "°F"
            ? Math.round((slicedValues[i] * 1.8 + 32) * 10) / 10
            : Math.round(slicedValues[i] * 10) / 10,
        hour: i
    }))

    console.log(rawData)

    return rawData
}