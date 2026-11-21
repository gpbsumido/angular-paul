// [ng-01 structure] The browser entry point. angular.json points
// `architect.build.options.browser` here, so this is the first app code to run.
//
// Simple: bootstrapApplication(RootComponent, config) is the whole startup in
// a standalone app. No AppModule, no platformBrowserDynamic().bootstrapModule().
// Pitfall: you may still see `platformBrowserDynamic().bootstrapModule(AppModule)`
// in older codebases. That's the NgModule-era equivalent, same job.
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Expert: a bootstrap failure (a provider throws, a template fails to compile
// in JIT) rejects this promise. Logging it is the minimum. Without the catch
// you get a blank page and an "uncaught (in promise)" with no context.
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
