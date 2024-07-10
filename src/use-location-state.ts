import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

export const useLocationState = <Schema extends Record<string, z.ZodSchema>>(
    schema: Schema,
    defaultValues: z.infer<z.ZodObject<Schema>>,
) => {
    // allow the schema and default values to be passed in
    // without being memoized
    const schemaRef = useRef(schema);
    const defaultValuesRef = useRef(defaultValues);

    const location = useLocation();
    const navigate = useNavigate();

    // initialize the state with the default values
    // and then update them to match location.state
    // in an effect. this means that the hook will
    // always return default values on first render.
    // this could be a bit of a gotcha, but it also
    // lets us neatly avoid hydration mismatch errors
    // so i think it's ok
    const [value, setValue] = useState(defaultValues);
    useEffect(() => {
        setValue(
            z
                .object(schemaRef.current)
                .partial()
                .parse({
                    ...defaultValuesRef.current,
                    ...location.state,
                }),
        );
    }, [location.state]);

    const update = useCallback(
        (delta: Partial<z.infer<z.ZodObject<Schema>>>) => {
            navigate(location.pathname + location.search, {
                // we merge the delta on top of the actual value of `location.state` here,
                // which is typed as `any`, so we don't inadvertently overwrite any properties
                // that are not part of the schema (i.e. have been specified by _other_ usages of
                // `useLocationState`.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                state: { ...location.state, ...delta },
            });
        },
        [navigate, location.pathname, location.search, location.state],
    );

    const replace = useCallback(
        (newValue: z.infer<z.ZodObject<Schema>>) => {
            navigate(location.pathname + location.search, {
                state: newValue,
            });
        },
        [navigate, location.pathname, location.search],
    );

    const clear = useCallback(() => {
        navigate(location.pathname + location.search, {
            state: {},
        });
    }, [navigate, location.pathname, location.search]);

    return useMemo(
        () => ({ value, update, replace, clear }),
        [value, update, replace, clear],
    );
};
