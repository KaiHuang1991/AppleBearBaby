/** User-Agent patterns for social / messenger link preview crawlers */
const SOCIAL_CRAWLER_PATTERN =
  /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|TelegramBot|Discordbot|Pinterestbot/i

export const isSocialCrawler = (userAgent = '') =>
  Boolean(userAgent && SOCIAL_CRAWLER_PATTERN.test(userAgent))

export const SOCIAL_CRAWLER_REGEX = SOCIAL_CRAWLER_PATTERN
