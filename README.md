# @casekit/use-location-state

A hook to make it easier to interact with the browser's location.state in a typesafe, validated way (using `zod`).

The first argument to the hook is object describing the properties the component is interested in as `zod` schemas.

The second argument is a set of default values. Any values that are not optional in the schema must be provided
(and you'll get a type error if you don't). If no values are required, you don't need to pass a second argument.

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
