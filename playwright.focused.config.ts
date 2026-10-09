import config from './playwright.config';
import {defineConfig} from '@playwright/test';
export default defineConfig({...config,webServer:{...config.webServer,command:'node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3001'}});
