## Contribution

### Install dependency

1. Install Node.js version v22.11 or later
2. Install pnpm `npm install -g pnpm`
3. Run `pnpm i` to install dependencies

### Configure google-services.json

The google services.json file is required to enable Firebase services such as Firebase Authentication and Firebase Cloud Messaging. To use these services, you need obtain the service.json file through firebase and fill in the information in .env.example.

You should have three different versions of the .env file: one for debug, one for development, and one for release. Please place them in the following directories:

- .env
- .env.dev
- .env.prd

### Development

Run `pnpm build:dev` or `pnpm winBuild:dev` for Windows environment to develop with file watching and development log.

Run `pnpm build:pro` or `pnpm winBuild:pro` for Windows environment to build a production package, the output extension package is located in the dist folder.

### Language

1. Copy `_raw/_locales/en/messages.json` to `_raw/_locales/${localCode}/messages.json` (Find your locale code in [https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes](https://en.wikipedia.org/wiki/Language_localisation#Language_tags_and_codes))
2. Replace content in `message` property to appropriate locale language

ATTENTION: When you create a new key, make sure the key doesen't include space and not duplicated with existing phrase (case insensitive).
