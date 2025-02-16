import Project from '../utils/project';
import { describe, beforeEach, afterEach, test, expect } from 'vitest';
import { stripIndent } from 'common-tags';

describe('Language Server: Diagnostic Augmentation', () => {
  let project!: Project;

  beforeEach(async () => {
    project = await Project.create();
  });

  afterEach(async () => {
    await project.destroy();
  });

  test('expected argument count', async () => {
    project.setGlintConfig({ environment: ['ember-loose', 'ember-template-imports'] });
    project.write({
      'index.gts': stripIndent`
        import Component from '@glimmer/component';

        export interface AppSignature {
          Blocks: {
            expectsTwoParams: [a: string, b: number];
            expectsAtLeastOneParam: [a: string, ...rest: Array<string>];
          }
        }

        function expectsTwoArgs(a: string, b: number) {
          console.log(a, b);
        }

        function expectsAtLeastOneArg(a: string, ...rest: Array<string>) {
          console.log(a, ...rest);
        }

        export default class App extends Component<AppSignature> {
          <template>
            {{expectsTwoArgs "one"}}
            {{expectsTwoArgs "one" 2 "three"}}
            {{expectsAtLeastOneArg}}

            {{yield "one" to="expectsTwoParams"}}
            {{yield "one" 2 "three" to="expectsTwoParams"}}
            {{yield to="expectsAtLeastOneParam"}}
          </template>
        }
      `,
    });

    let server = project.startLanguageServer();
    let diagnostics = server.getDiagnostics(project.fileURI('index.gts'));

    expect(diagnostics).toMatchInlineSnapshot(`
      [
        {
          "message": "Expected 2 arguments, but got 1.",
          "range": {
            "end": {
              "character": 28,
              "line": 19,
            },
            "start": {
              "character": 4,
              "line": 19,
            },
          },
          "severity": 1,
          "source": "glint:ts(2554)",
          "tags": [],
        },
        {
          "message": "Expected 2 arguments, but got 3.",
          "range": {
            "end": {
              "character": 36,
              "line": 20,
            },
            "start": {
              "character": 29,
              "line": 20,
            },
          },
          "severity": 1,
          "source": "glint:ts(2554)",
          "tags": [],
        },
        {
          "message": "Expected at least 1 arguments, but got 0.",
          "range": {
            "end": {
              "character": 28,
              "line": 21,
            },
            "start": {
              "character": 4,
              "line": 21,
            },
          },
          "severity": 1,
          "source": "glint:ts(2555)",
          "tags": [],
        },
        {
          "message": "Expected 2 arguments, but got 1.",
          "range": {
            "end": {
              "character": 41,
              "line": 23,
            },
            "start": {
              "character": 4,
              "line": 23,
            },
          },
          "severity": 1,
          "source": "glint:ts(2554)",
          "tags": [],
        },
        {
          "message": "Expected 2 arguments, but got 3.",
          "range": {
            "end": {
              "character": 27,
              "line": 24,
            },
            "start": {
              "character": 20,
              "line": 24,
            },
          },
          "severity": 1,
          "source": "glint:ts(2554)",
          "tags": [],
        },
        {
          "message": "Expected at least 1 arguments, but got 0.",
          "range": {
            "end": {
              "character": 41,
              "line": 25,
            },
            "start": {
              "character": 4,
              "line": 25,
            },
          },
          "severity": 1,
          "source": "glint:ts(2555)",
          "tags": [],
        },
      ]
    `);
  });

  test('emit for attributes and top-level content', () => {
    project.setGlintConfig({ environment: ['ember-loose', 'ember-template-imports'] });
    project.write({
      'index.gts': stripIndent`
        import Component from '@glimmer/component';

        export interface AppSignature {}

        const someRandomPOJO = {};
        const obj = { someRandomPOJO };

        export default class App extends Component<AppSignature> {
          <template>
            <div onclick={{someRandomPOJO}}></div>
            {{someRandomPOJO}}
            <div>{{someRandomPOJO}}</div>
            {{#let}}{{someRandomPOJO}}{{/let}}

            <div onclick={{obj.someRandomPOJO}}></div>
            {{obj.someRandomPOJO}}
            <div>{{obj.someRandomPOJO}}</div>
            {{#let}}{{obj.someRandomPOJO}}{{/let}}
          </template>
        }
      `,
    });

    let server = project.startLanguageServer();
    let diagnostics = server.getDiagnostics(project.fileURI('index.gts'));

    expect(diagnostics).toMatchInlineSnapshot(`
      [
        {
          "message": "Only primitive values (see \`AttrValue\` in \`@glint/template\`) are assignable as HTML attributes. If you want to set an event listener, consider using the \`{{on}}\` modifier instead.
        Type '{}' is not assignable to type 'AttrValue'.",
          "range": {
            "end": {
              "character": 16,
              "line": 9,
            },
            "start": {
              "character": 9,
              "line": 9,
            },
          },
          "severity": 1,
          "source": "glint:ts(2322)",
          "tags": [],
        },
        {
          "message": "Only primitive values and certain DOM objects (see \`ContentValue\` in \`@glint/template\`) are usable as top-level template content.
        Argument of type '{}' is not assignable to parameter of type 'ContentValue'.",
          "range": {
            "end": {
              "character": 22,
              "line": 10,
            },
            "start": {
              "character": 4,
              "line": 10,
            },
          },
          "severity": 1,
          "source": "glint:ts(2345)",
          "tags": [],
        },
        {
          "message": "Only primitive values and certain DOM objects (see \`ContentValue\` in \`@glint/template\`) are usable as top-level template content.
        Argument of type '{}' is not assignable to parameter of type 'ContentValue'.",
          "range": {
            "end": {
              "character": 27,
              "line": 11,
            },
            "start": {
              "character": 9,
              "line": 11,
            },
          },
          "severity": 1,
          "source": "glint:ts(2345)",
          "tags": [],
        },
        {
          "message": "Only primitive values and certain DOM objects (see \`ContentValue\` in \`@glint/template\`) are usable as top-level template content.
        Argument of type '{}' is not assignable to parameter of type 'ContentValue'.",
          "range": {
            "end": {
              "character": 30,
              "line": 12,
            },
            "start": {
              "character": 12,
              "line": 12,
            },
          },
          "severity": 1,
          "source": "glint:ts(2345)",
          "tags": [],
        },
        {
          "message": "Only primitive values (see \`AttrValue\` in \`@glint/template\`) are assignable as HTML attributes. If you want to set an event listener, consider using the \`{{on}}\` modifier instead.
        Type '{}' is not assignable to type 'AttrValue'.",
          "range": {
            "end": {
              "character": 16,
              "line": 14,
            },
            "start": {
              "character": 9,
              "line": 14,
            },
          },
          "severity": 1,
          "source": "glint:ts(2322)",
          "tags": [],
        },
        {
          "message": "Only primitive values and certain DOM objects (see \`ContentValue\` in \`@glint/template\`) are usable as top-level template content.
        Argument of type '{}' is not assignable to parameter of type 'ContentValue'.",
          "range": {
            "end": {
              "character": 26,
              "line": 15,
            },
            "start": {
              "character": 4,
              "line": 15,
            },
          },
          "severity": 1,
          "source": "glint:ts(2345)",
          "tags": [],
        },
        {
          "message": "Only primitive values and certain DOM objects (see \`ContentValue\` in \`@glint/template\`) are usable as top-level template content.
        Argument of type '{}' is not assignable to parameter of type 'ContentValue'.",
          "range": {
            "end": {
              "character": 31,
              "line": 16,
            },
            "start": {
              "character": 9,
              "line": 16,
            },
          },
          "severity": 1,
          "source": "glint:ts(2345)",
          "tags": [],
        },
        {
          "message": "Only primitive values and certain DOM objects (see \`ContentValue\` in \`@glint/template\`) are usable as top-level template content.
        Argument of type '{}' is not assignable to parameter of type 'ContentValue'.",
          "range": {
            "end": {
              "character": 34,
              "line": 17,
            },
            "start": {
              "character": 12,
              "line": 17,
            },
          },
          "severity": 1,
          "source": "glint:ts(2345)",
          "tags": [],
        },
      ]
    `);
  });

  test('unresolvable template entities', () => {
    project.setGlintConfig({ environment: ['ember-loose', 'ember-template-imports'] });
    project.write({
      'index.gts': stripIndent`
        import Component from '@glimmer/component';

        export interface AppSignature {}

        const SomeRandomPOJO = {};
        const obj = { SomeRandomPOJO };

        export default class App extends Component<AppSignature> {
          <template>
            <SomeRandomPOJO />
            {{SomeRandomPOJO "hi"}}
            {{#let (SomeRandomPOJO)}}{{/let}}
            <div {{SomeRandomPOJO}}></div>

            <obj.SomeRandomPOJO />
            {{obj.SomeRandomPOJO "hi"}}
            {{#let (obj.SomeRandomPOJO)}}{{/let}}
            <div {{obj.SomeRandomPOJO}}></div>
          </template>
        }
      `,
    });

    let server = project.startLanguageServer();
    let diagnostics = server.getDiagnostics(project.fileURI('index.gts'));

    expect(diagnostics).toMatchInlineSnapshot(`
      [
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.
              Type '{}' provides no match for the signature '(...positional: unknown[]): unknown'.",
          "range": {
            "end": {
              "character": 19,
              "line": 9,
            },
            "start": {
              "character": 5,
              "line": 9,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 20,
              "line": 10,
            },
            "start": {
              "character": 6,
              "line": 10,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 26,
              "line": 11,
            },
            "start": {
              "character": 12,
              "line": 11,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 25,
              "line": 12,
            },
            "start": {
              "character": 11,
              "line": 12,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 26,
              "line": 14,
            },
            "start": {
              "character": 4,
              "line": 14,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 24,
              "line": 15,
            },
            "start": {
              "character": 6,
              "line": 15,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 30,
              "line": 16,
            },
            "start": {
              "character": 12,
              "line": 16,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
        {
          "message": "The given value does not appear to be usable as a component, modifier or helper.
        No overload matches this call.
          The last overload gave the following error.
            Argument of type '{}' is not assignable to parameter of type '(...positional: unknown[]) => unknown'.",
          "range": {
            "end": {
              "character": 29,
              "line": 17,
            },
            "start": {
              "character": 11,
              "line": 17,
            },
          },
          "severity": 1,
          "source": "glint:ts(2769)",
          "tags": [],
        },
      ]
    `);
  });
});
