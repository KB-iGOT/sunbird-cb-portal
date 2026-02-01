// Proxy configuration for Angular 20 Vite dev server
module.exports = {
  '/apis/**': {
    target: 'https://portal.qa.karmayogibharat.net',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    headers: {
      Cookie: 'connect.sid=s%3AKcCUgFqRJ1C2fkgkXTcmmRTWdABjoikA.Kdzn66ndSCl5bcmeViIiEvUGyeMFVZb3sguKNhebPXs'
    }
  },
  '/api/**': {
    target: 'https://portal.qa.karmayogibharat.net',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  '/content-api/**': {
    target: 'http://localhost:3004',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/content-api': ''
    }
  },
  '/content-store/**': {
    target: 'http://localhost:3005',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/content-store': ''
    }
  },
  '/chat-bot/**': {
    target: 'http://localhost:3006',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/chat-bot': ''
    }
  },
  '/mobile-apps/**': {
    target: 'http://localhost:3007',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/mobile-apps': ''
    }
  },
  '/LA/**': {
    target: 'http://localhost:3008',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/LA': ''
    }
  },
  '/abcd/**': {
    target: 'https://igot-qa.in',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/abcd': ''
    }
  },
  '/assets/**': {
    target: 'http://127.0.0.1:8080',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
}
