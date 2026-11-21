import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonSection } from './lesson-section';
import { LessonDemo } from './lesson-demo';

export type Layer = 'shell' | 'shared' | 'feature' | 'other-feature';

export interface ImportVerdict {
  allowed: boolean;
  reason: string;
}

/**
 * [ng-01 structure] The same layering rules src/app/architecture.spec.ts
 * enforces, as a pure function so the lesson can let you poke at them.
 */
export function checkImport(from: Layer, to: Layer, lazy: boolean): ImportVerdict {
  if (from === to) return { allowed: true, reason: 'Imports inside one layer are fine.' };
  if (to === 'shared') {
    return { allowed: true, reason: 'Everyone may depend on shared/. That is what it is for.' };
  }
  if (from === 'shared') {
    return {
      allowed: false,
      reason: 'shared/ must not know who uses it. Reaching up creates a cycle sooner or later.',
    };
  }
  if (from === 'shell' && (to === 'feature' || to === 'other-feature')) {
    return lazy
      ? { allowed: true, reason: 'A dynamic import() is the lazy-loading seam. The feature stays its own chunk.' }
      : {
          allowed: false,
          reason: 'A static import pulls the feature into the initial bundle and couples the shell to its internals.',
        };
  }
  if (to === 'shell') {
    return { allowed: false, reason: 'Features never import the shell. Move what they need down into shared/.' };
  }
  return {
    allowed: false,
    reason: 'Features never import each other. Promote the shared piece into shared/ instead.',
  };
}

const LAYER_LABELS: Record<Layer, string> = {
  shell: 'shell (app.ts, dock/, menu-bar/)',
  shared: 'shared/',
  feature: 'apps/settings/',
  'other-feature': 'apps/finder/',
};

@Component({
  selector: 'app-lesson-01-structure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson,LessonSection, LessonDemo, CodeBlock, InterviewQuestions],
  template: `
    <app-lesson part="01">

      <h2>Simple</h2>
      <p>
        An Angular app starts in <code>src/main.ts</code>, which hands one root component and one
        config object to <code>bootstrapApplication</code>. There's no <code>AppModule</code>.
        Since v17 new projects are standalone, and since v19 <code>standalone: true</code> is the
        default, so you don't even write it.
      </p>
      <app-code-block label="src/main.ts" [code]="snippets.main" />
      <p>
        The config is a flat list of <em>providers</em>: functions that switch features on for the
        whole app. Router, HttpClient, hydration and change detection all live here.
      </p>
      <app-code-block label="src/app/app.config.ts" [code]="snippets.config" />
      <p>
        The other files you'll see in every project: <code>angular.json</code> (build targets,
        budgets, assets), <code>tsconfig*.json</code> (keep <code>strict</code> and
        <code>strictTemplates</code> on), and <code>app.routes.ts</code>. Since the v20 style guide,
        new files drop the type suffix: <code>app.ts</code>, not <code>app.component.ts</code>.
      </p>

      <h2>Intermediate</h2>
      <p>
        Group by <strong>feature</strong>, not by file type. <code>components/</code>,
        <code>services/</code> and <code>models/</code> folders look tidy at ten files and turn into
        a scavenger hunt at two hundred. This repo uses three layers:
      </p>
      <app-code-block label="src/app/" [code]="snippets.tree" />
      <p>
        Dependencies only point <em>down</em>. The interesting one is shell → feature. That's
        forbidden as a static import but fine as a dynamic <code>import()</code>, because that's
        how a feature becomes a lazy chunk.
      </p>

      <app-lesson-demo heading="Try it: may this file import that one?">
        <div class="demo-row">
          <label for="import-from">A file in</label>
          <select id="import-from" (change)="from.set(asLayer($event))">
            @for (layer of layers; track layer) {
              <option [value]="layer" [selected]="layer === from()">{{ layerLabels[layer] }}</option>
            }
          </select>
        </div>
        <div class="demo-row">
          <label for="import-to">imports from</label>
          <select id="import-to" (change)="to.set(asLayer($event))">
            @for (layer of layers; track layer) {
              <option [value]="layer" [selected]="layer === to()">{{ layerLabels[layer] }}</option>
            }
          </select>
        </div>
        <div class="demo-row">
          <input
            id="import-lazy"
            type="checkbox"
            [checked]="lazy()"
            (change)="lazy.set($any($event.target).checked)"
          />
          <label for="import-lazy">as a lazy <code>import()</code></label>
        </div>
        <p
          role="status"
          class="lesson-verdict"
          [class.lesson-verdict--ok]="verdict().allowed"
          [class.lesson-verdict--bad]="!verdict().allowed"
        >
          <strong>{{ verdict().allowed ? '✓ Allowed' : '✗ Not allowed' }}.</strong>
          {{ verdict().reason }}
        </p>
      </app-lesson-demo>

      <h2>Expert</h2>
      <p>
        Conventions decay unless something fails when you break them. This repo has a spec that
        walks <code>src/app</code> and fails CI on a forbidden import. It caught three real
        violations: the dock, menu bar and root shell all reached into
        <code>apps/settings/</code> for app-wide state. The fix was to move the <em>state</em> down
        to <code>shared/settings/</code> and leave the <em>screen</em> in the feature.
      </p>
      <app-code-block label="src/app/architecture.spec.ts (excerpt)" [code]="snippets.fitness" />
      <p>
        At scale the same idea shows up as ESLint's <code>no-restricted-imports</code> or Nx
        module-boundary tags, where each library gets a <code>type:feature</code>/<code>type:ui</code>
        tag plus rules about which tags may depend on which. Two more expert-level points: providers
        in <code>app.config.ts</code> are app-wide singletons, so scope feature-only providers to a
        route's <code>providers</code> array; and <code>provideX(withY())</code> feature functions
        tree-shake, so options you never call never ship.
      </p>

      <h2>Pitfalls</h2>
      <ul>
        <li>
          <strong>Barrel files</strong> (<code>index.ts</code> re-exporting a folder) make imports
          pretty and quietly create circular dependencies. One stray import of a barrel can also
          pull a lazy feature back into the main bundle.
        </li>
        <li>
          <strong>shared/ as a junk drawer.</strong> If only one feature uses it, it belongs in that
          feature.
        </li>
        <li>
          <strong>State inside a feature folder</strong> that the whole app reads. That's the bug
          this lesson fixed.
        </li>
        <li>
          <strong>Turning off <code>strictTemplates</code></strong> to silence errors. Those errors
          are real bugs in your bindings.
        </li>
        <li>
          <strong>Ignoring bundle budgets.</strong> <code>angular.json</code> warns at 400 kB
          initial here. Treat the warning as a failing test, not noise.
        </li>
      </ul>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .demo-row label:first-child {
      min-width: 96px;
    }
    .lesson-verdict {
      margin: 12px 0 0;
      padding: 8px 12px;
      border-radius: 6px;
      border-left: 4px solid;
    }
    .lesson-verdict--ok {
      border-color: #34c759;
    }
    .lesson-verdict--bad {
      border-color: #ff6b6b;
    }
  `,
})
export class Lesson01Structure {
  protected readonly layers: Layer[] = ['shell', 'shared', 'feature', 'other-feature'];
  protected readonly layerLabels = LAYER_LABELS;

  protected readonly from = signal<Layer>('shell');
  protected readonly to = signal<Layer>('feature');
  protected readonly lazy = signal(false);
  protected readonly verdict = computed(() => checkImport(this.from(), this.to(), this.lazy()));

  protected asLayer(event: Event): Layer {
    return (event.target as HTMLSelectElement).value as Layer;
  }

  protected readonly snippets = {
    main: `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));`,
    config: `export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
  ],
};`,
    tree: `app.ts, app.routes.ts      shell: the desktop chrome
dock/  menu-bar/  window-manager/  spotlight/
shared/                    used by anyone
  settings/                app-wide settings state
  app-launcher.service.ts
apps/                      one folder per desktop app, lazy loaded
  settings/  finder/  ...`,
    fitness: `it('nothing outside apps/ statically imports from apps/', () => {
  const violations = files
    .filter((file) => !isInside(file, 'apps'))
    .flatMap((file) =>
      staticRelativeImports(file)
        .filter((target) => isInside(target, 'apps'))
        .map((target) => \`\${file} → \${target}\`),
    );
  expect(violations).toEqual([]);
});`,
  };

  protected readonly interview = [
    {
      q: 'How would you structure a large Angular app?',
      a: 'By feature, with three layers: a thin shell, shared building blocks, and lazy-loaded feature folders. Dependencies point one way: features and shell depend on shared, never on each other. I enforce that with a lint rule or a fitness test, because a convention nobody checks decays.',
    },
    {
      q: 'What replaced AppModule?',
      a: 'bootstrapApplication(RootComponent, appConfig). appConfig holds the providers an AppModule used to import, as provideRouter, provideHttpClient and so on. Components declare their own dependencies in imports: [] instead of a module doing it for them.',
    },
    {
      q: "What's the difference between providers in app.config.ts and in a route?",
      a: "app.config.ts providers live in the root environment injector: one instance for the whole app. A route's providers array creates a child environment injector, so the service exists only for that route subtree and can be lazy loaded with it.",
    },
    {
      q: 'Why are barrel files risky in Angular?',
      a: 'They hide the real dependency graph. Circular imports appear easily, and importing one symbol from a barrel can drag in the whole folder, including a feature you meant to lazy load, which defeats code splitting.',
    },
    {
      q: 'Which tsconfig and compiler flags would you insist on?',
      a: 'strict for TypeScript, and strictTemplates in angularCompilerOptions so bindings are type-checked in templates. Turning them off hides real bugs, such as passing a possibly-undefined value to an input.',
    },
  ];
}
