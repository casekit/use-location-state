import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import { useLocationState } from "./use-location-state";

describe("useLocationState", () => {
    test("state can be fetched, updated, replaced, and cleared", () => {
        const { result } = renderHook(
            () =>
                useLocationState(
                    { foo: z.string(), bar: z.number().optional() },
                    { foo: "hello" },
                ),
            { wrapper: MemoryRouter },
        );

        // the initial value of the state should be the default value
        expect(result.current.value).toEqual({ foo: "hello" });

        // its possible to update individual values without changing the rest
        act(() => {
            result.current.update({ bar: 1312 });
        });
        expect(result.current.value).toEqual({ foo: "hello", bar: 1312 });

        // its possible to replace the entire state
        act(() => {
            result.current.replace({ foo: "goodbye" });
        });
        expect(result.current.value).toEqual({ foo: "goodbye" });

        // its possible to clear the entire state, returning it to the default values
        act(() => {
            result.current.clear();
        });
        expect(result.current.value).toEqual({ foo: "hello" });
    });

    test("multiple usages of useLocationState do not interfere with each other - unless clear or replace is called", () => {
        const useMultipleLocationStateHooks = () => {
            const foo = useLocationState({ foo: z.string() }, { foo: "hello" });
            const bar = useLocationState(
                { bar: z.number().optional() },
                { bar: 1312 },
            );
            return { foo, bar };
        };

        const { result } = renderHook(() => useMultipleLocationStateHooks(), {
            wrapper: MemoryRouter,
        });

        expect(result.current.foo.value).toEqual({ foo: "hello" });
        expect(result.current.bar.value).toEqual({ bar: 1312 });

        act(() => {
            result.current.foo.update({ foo: "goodbye" });
        });

        expect(result.current.foo.value).toEqual({ foo: "goodbye" });
        expect(result.current.bar.value).toEqual({ bar: 1312 });

        act(() => {
            result.current.bar.update({ bar: undefined });
        });

        expect(result.current.foo.value).toEqual({ foo: "goodbye" });
        expect(result.current.bar.value).toEqual({});

        act(() => {
            result.current.bar.clear();
        });
        expect(result.current.foo.value).toEqual({ foo: "hello" });
        expect(result.current.bar.value).toEqual({ bar: 1312 });

        act(() => {
            result.current.foo.update({ foo: "goodbye" });
            result.current.bar.replace({ bar: undefined });
        });
        expect(result.current.foo.value).toEqual({ foo: "hello" });
        expect(result.current.bar.value).toEqual({});
    });
});
