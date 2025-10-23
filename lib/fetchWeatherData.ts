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

    // 現在時刻を ISO 形式で取得
    const now = new Date()
    const startISO = now.toISOString()

    // 取得時間範囲
    const hours = period === "48時間" ? 49 : 24 * 7

    const hourlyParams = ["temperature_2m", "relative_humidity_2m", "precipitation", "windspeed_10m"].join(",")

    // API URL（start パラメータで現在時刻以降を取得）
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=${hourlyParams}&start=${startISO}&timezone=Asia%2FTokyo`

    // fetch。SWRでキャッシュを有効にするなら cacheオプションは削除または 'force-cache' に
    const res = await fetch(url)
    if (!res.ok) throw new Error("天気データの取得に失敗しました")
    const data = await res.json()

    const key = keyMap[metric]
    const values: number[] = data.hourly[key]
    const times: string[] = data.hourly.time

    if (!values || !times) throw new Error("APIレスポンスに必要なデータが含まれていません")

    // 取得した分だけデータを切り出し
    const slicedValues = values.slice(0, hours)
    const slicedTimes = times.slice(0, hours)

    const rawData = slicedTimes.map((t, i) => ({
        time:
            period === "48時間"
                ? i === 0 ? "現在" : `+${i}h`
                : i % 24 === 0
                    ? i === 0 ? "今日" : `+${Math.floor(i / 24)}日`
                    : "",
        value: metric === "気温" && unit === "°F"
            ? Math.round((slicedValues[i] * 1.8 + 32) * 10) / 10
            : Math.round(slicedValues[i] * 10) / 10,
        hour: i
    }))

    // 7日間モードは24時間ごとに1点だけ残す
    const filteredData = period === "7日間"
        ? rawData.filter((_, i) => i % 24 === 0).map((d, i) => ({ ...d, hour: i }))
        : rawData

    return filteredData
}
