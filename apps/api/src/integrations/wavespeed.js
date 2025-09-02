const API_BASE = process.env.WAVESPEED_API_BASE
const API_KEY = process.env.WAVESPEED_API_KEY

function authHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${API_KEY}`,
    ...extra,
  }
}

export async function wavespeedUploadImage(buffer, filename = 'image.jpg', mime = 'image/jpeg') {
  if (!API_BASE || !API_KEY) {
    throw new Error('Wavespeed API not configured')
  }
  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mime }), filename)

  const res = await fetch(`${API_BASE}/v1/uploads`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Wavespeed upload failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  // expect data to contain download_url or id
  return data.download_url || data.url || data.id
}

export async function wavespeedCreateI2V({ image, prompt, duration = 5, seed = -1 }) {
  const res = await fetch(`${API_BASE}/v1/predictions`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      model: 'wan2.2-i2v-480p',
      input: { image, prompt, duration, seed },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Wavespeed I2V failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.id || data.prediction_id || data
}

export async function wavespeedCreateT2V({ width, height, prompt, duration = 5, seed = -1 }) {
  const res = await fetch(`${API_BASE}/v1/predictions`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      model: 'wan2.2-t2v-480p',
      input: { width, height, prompt, duration, seed },
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Wavespeed T2V failed: ${res.status} ${text}`)
  }
  const data = await res.json()
  return data.id || data.prediction_id || data
}

export async function wavespeedPollResult(id, { timeoutMs = 90_000, intervalMs = 3000 } = {}) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const res = await fetch(`${API_BASE}/v1/predictions/${id}`, {
      headers: authHeaders(),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Wavespeed poll failed: ${res.status} ${text}`)
    }
    const data = await res.json()
    const status = data.status || data.state
    if (status === 'succeeded' || status === 'completed') {
      const output = data.output || data.result || {}
      const videoUrl = output.url || output.video_url || output.download_url || output.file
      return { status: 'succeeded', videoUrl, raw: data }
    }
    if (status === 'failed' || status === 'error') {
      return { status: 'failed', raw: data }
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return { status: 'timeout' }
}
