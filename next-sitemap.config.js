/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://livrank.ca',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/profile'],
      },
    ],
    additionalSitemaps: [
      'https://livrank.ca/server-sitemap.xml', // For dynamic routes
    ],
  },
  exclude: ['/admin/*', '/profile', '/login', '/signup', '/api/*'],
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  transform: async (config, path) => {
    // Custom priority for different page types
    let priority = 0.7
    let changefreq = 'daily'

    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.startsWith('/building/') || path.startsWith('/neighborhood/') || path.startsWith('/landlord/')) {
      priority = 0.9
      changefreq = 'weekly'
    } else if (path === '/explore') {
      priority = 0.8
      changefreq = 'daily'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }
  },
  additionalPaths: async (config) => {
    const result = []

    // You can add dynamic paths here if needed
    // For now, these will be handled by server-sitemap.xml

    return result
  },
}


