

const cityCoords: Record<string, { lat: number; lon: number }> = {
    東京: { lat: 35.6895, lon: 139.6917 },
    大阪: { lat: 34.6937, lon: 135.5023 },
    札幌: { lat: 43.0618, lon: 141.3545 },
    福岡: { lat: 33.5902, lon: 130.4017 },
    名古屋: { lat: 35.1815, lon: 136.9066 },
};

const keyMap: Record<string, string> = {
    気温: "temperature_2m",
    湿度: "relative_humidity_2m",
    風速: "windspeed_10m",
    降水量: "precipitation",
};

export async function fetchWeatherData(
    city: string,
    metric: string,
    period: string,
    unit: string,
): Promise<Array<{ time: string; value: number; hour: number }>> {
    const coords = cityCoords[city]

    // 取得する気象項目をまとめて指定
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,relative_humidity_2m,precipitation,windspeed_10m&timezone=Asia%2FTokyo`

    const res = await fetch(url)
    if (!res.ok) throw new Error("API request failed")
    const data = await res.json()

    const key = keyMap[metric]
    const values = data.hourly[key]
    const times = data.hourly.time

    // 表示する期間（48時間 or 7日）
    const limit = period === "48時間" ? 49 : 24 * 7
    const slicedTimes = times.slice(0, limit)
    const slicedValues = values.slice(0, limit)

    // まず48時間か7日間かでデータを整形
    const rawData = slicedTimes.map((t: string, i: number) => ({
        time:
            period === "48時間"
                ? i === 0
                    ? "現在"
                    : `+${i}h`
                : i === 0
                    ? "今日"
                    : `+${Math.floor(i / 24)}日`, // 一旦暫定ラベル
        value:
            metric === "気温" && unit === "°F"
                ? Math.round((slicedValues[i] * 1.8 + 32) * 10) / 10
                : Math.round(slicedValues[i] * 10) / 10,
        hour: i, // インデックスを一旦保存
    }))

    // 7日間表示の場合は24時間ごとに1点だけ残し、hour を 0,1,2… に振り直す
    const filteredData =
        period === "7日間"
            ? rawData
                .filter((_: { time: string; value: number; hour: number }, i: number) => i % 24 === 0)
                .map((d: { time: string; value: number; hour: number }, i: number) => ({
                    ...d,
                    hour: i, // hour を振り直す
                }))
            : rawData

    return filteredData
}
