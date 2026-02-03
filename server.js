const express = require('express')
const compression = require('compression')
const path = require('path')
const healthcheck = require('express-healthcheck')

const app = express()
const PORT = process.env.PORT || 3004

// Health check endpoint
app.use('/health', healthcheck())

// Enable compression (handles both gzip and brotli)
app.use(compression())

// Serve static files with proper headers for pre-compressed files
app.use(express.static(path.join(__dirname, 'www/en'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.br')) {
      res.set('Content-Encoding', 'br')
      const originalPath = filePath.slice(0, -3)
      if (originalPath.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript')
      } else if (originalPath.endsWith('.css')) {
        res.set('Content-Type', 'text/css')
      }
    }
  },
  maxAge: '1y',
  immutable: true
}))

// Fallback to index.html for Angular SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'www/en/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fusion app running on port ${PORT}`)
})