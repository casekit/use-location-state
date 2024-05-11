# @casekit/use-location-state

A hook to make it easier to interact with the browser's location.state in a typesafe, validated way (using `zod`).

The first argument to the hook is object describing the properties the component is interested in as `zod` schemas.

The second argument is a set of default values. Any values that are not optional in the schema must be provided
(and you'll get a type error if you don't). If no values are required in the schema, you don't need to pass a second argument.

```typescript
import { useLocationState } from "@casekit/use-location-state";

export const MyComponent = () => {
    const locationState = useLocationState(
        { foo: z.string(), bar: z.number().optional() },
        { foo: "hello" },
    );

    return (
        <button onClick={() => locationState.update({ foo: "goodbye" })}>
            {locationState.value.foo}
        </button>
    )
};
```

The returned object has a consistent object identity while the state stays the same. It contains a number of keys:

- `value` - the current value of the state
- `update` - a function that allows you to update the state
- `replace` a function that allows you to completely replace the state
- `clear` a function that allows you to reset the state to its default values

The `value` key contains only properties specified in the schema, and will be typed based on the schema. Other
properties in the state will still be there for use by other components, but they will not be included in
the return value of this hook unless specified in the schema.

The `update` function applies its changes to the state - any keys it does not specify (including any extra
keys not specified in the schema) will be unaffected.

The `replace` and `clear` functions should be used with caution, as they apply their changes to the entire
of `location.state`, including keys not specified in the schema. These are mostly helpful for actions that
completely change the context of the page.

The hook can be used multiple times by different components with different schemas. As long as they don't use the same keys for different data, this should work fine.
