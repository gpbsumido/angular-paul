// [ng-01 structure] Server-only providers, merged over the browser config.
// mergeApplicationConfig keeps one source of truth (app.config.ts) and layers
// the server bits on top, so the two configs can't drift apart.
// main.server.ts bootstraps with this; main.ts bootstraps with appConfig.
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
