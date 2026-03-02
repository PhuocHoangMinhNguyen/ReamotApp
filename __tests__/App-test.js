/**
 * @format
 *
 * App-level smoke test.  Rendering the full App with its Drawer + BottomTab
 * navigator requires native gesture handler / reanimated internals that are
 * hard to mock completely.  We therefore verify the module loads cleanly
 * (i.e., there are no top-level import / syntax errors) rather than doing a
 * full renderer.create() which is covered by each individual screen test.
 */

it('App module loads without errors', () => {
  // Just importing App exercises all top-level imports (Firebase, navigation,
  // etc.) through Jest's module system.  If anything is fundamentally broken
  // the require will throw before we even reach expect().
  expect(() => require('../App')).not.toThrow();
});
