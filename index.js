const express = require('express')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 7000

const M3U_URL = 'https://goldtv.lat:8080/get.php?username=PeterVilla&password=Guayaquil2025&type=m3u_plus'

app.get('/manifest.json', (req, res) => {
  res.json({
    id: 'org.m3u.private.addon',
    version: '1.0.0',
    name: 'Mi IPTV Privado',
    description: 'Addon IPTV desde lista M3U privada',
    resources: ['stream'],
    types: ['tv'],
    catalogs: [],
    idPrefixes: ['m3u']
  })
})

app.get('/stream/:type/:id.json', async (req, res) => {
  try {
    const response = await axios.get(M3U_URL, { timeout: 15000 })
    const lines = response.data.split('\n')

    const streams = []
    let current = null

    for (const line of lines) {
      if (line.startsWith('#EXTINF')) {
        const name = line.split(',').pop().trim()
        current = { title: name }
      } else if (line.startsWith('http') && current) {
        streams.push({
          title: current.title,
          url: line.trim()
        })
        current = null
      }
    }

    res.json({ streams })
  } catch (err) {
    res.json({ streams: [] })
  }
})

app.listen(PORT, () => {
  console.log('Addon running on port ' + PORT)
})
