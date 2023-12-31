import { fade } from "svelte/transition";
import * as svelteInternal from "svelte/src/runtime/internal";
import {
  applyTransition,
  getInputsWithProps,
  getOptionCompare,
  inputInitialValueMapping,
  optionCompare,
  optionCompareMultiple,
  optionDescription,
  outroAndDestroy,
  promptInputMapping,
  randomId,
  resolveConfigTransitions,
} from "../../src/lib/utils";
import MockedInput from "spec/__mocks__/MockedInput.svelte";

describe("utils", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("outroAndDestroy", () => {
    const checkOutrosSpy = jest
      .spyOn(svelteInternal, "check_outros")
      .mockImplementation();
    const groupOutrosSpy = jest
      .spyOn(svelteInternal, "group_outros")
      .mockImplementation();
    const transitionOutSpy = jest
      .spyOn(svelteInternal, "transition_out")
      .mockImplementation();

    const instance = {
      $$: {},
      $destroy: jest.fn(),
    };

    it("should call instance destroy immediatly if no fragment in instance", () => {
      outroAndDestroy(instance);
      expect(groupOutrosSpy).not.toHaveBeenCalled();
      expect(transitionOutSpy).not.toHaveBeenCalled();
      expect(checkOutrosSpy).not.toHaveBeenCalled();
      expect(instance.$destroy).toHaveBeenCalledTimes(1);
    });

    it("should call instance destroy immediatly if no o in instance fragment", () => {
      instance.$$.fragment = {};
      outroAndDestroy(instance);
      expect(groupOutrosSpy).not.toHaveBeenCalled();
      expect(transitionOutSpy).not.toHaveBeenCalled();
      expect(checkOutrosSpy).not.toHaveBeenCalled();
      expect(instance.$destroy).toHaveBeenCalledTimes(1);
    });

    it("should pass instance fragment and $destroy to transition_out if o in instance fragment", () => {
      const fragment = { o: "o" };
      instance.$$.fragment = fragment;
      outroAndDestroy(instance);
      expect(groupOutrosSpy).toHaveBeenCalledTimes(1);
      expect(transitionOutSpy).toHaveBeenCalledTimes(1);
      expect(transitionOutSpy).toHaveBeenCalledWith(
        fragment,
        0,
        0,
        expect.anything()
      );
      expect(checkOutrosSpy).toHaveBeenCalledTimes(1);
      expect(instance.$destroy).not.toHaveBeenCalled();
    });
  });

  describe("resolveConfigTransitions", () => {
    it("should return unaltered svelte/transition", () => {
      const transitions = { point: { transition: fade } };
      const actual = resolveConfigTransitions(transitions);
      expect(actual).toEqual(transitions);
    });

    it("should map string to svelte/transition", () => {
      const transitions = { point: { transition: "fade" } };
      const expected = { point: { transition: fade } };
      const actual = resolveConfigTransitions(transitions);
      expect(actual).toEqual(expected);
    });

    it("should throw if string is no svelte/transition", () => {
      const transitions = { point: { transition: "something" } };
      expect(() => {
        resolveConfigTransitions(transitions);
      }).toThrow();
    });
  });

  describe("applyTransition", () => {
    it("should return null if no point passed", () => {
      expect(applyTransition()).toBe(null);
    });

    it("should return null if no transition passed", () => {
      expect(applyTransition(undefined, { test: "test" })).toBe(null);
    });

    it("should call passed transition with provided props and node", () => {
      const transition = jest.fn();
      const props = "props";
      const node = "node";
      const point = { transition, props };

      applyTransition(node, point);

      expect(transition).toHaveBeenCalledTimes(1);
      expect(transition).toHaveBeenCalledWith(node, props);
    });
  });

  describe("inputInitialValueMapping", () => {
    it("should return value if present", () => {
      const value = "value";
      const input = { props: { value } };

      const actual = inputInitialValueMapping(input);

      expect(actual).toBe(value);
    });

    it("should return false if no value and type checkbox", () => {
      const type = "checkbox";
      const input = { props: { type } };

      const actual = inputInitialValueMapping(input);

      expect(actual).toBe(false);
    });

    it("should return empty array if no value and type select with multiple attribute", () => {
      const type = "select";
      const input = { props: { type, multiple: true } };

      const actual = inputInitialValueMapping(input);

      expect(actual).toEqual([]);
    });

    it("should return undefined if no value and type not checkbox", () => {
      const type = "not checkbox";
      const input = { props: { type } };

      const actual = inputInitialValueMapping(input);

      expect(actual).toBe(undefined);
    });
  });

  describe("promptInputMapping", () => {
    it("should map string input", () => {
      const input = "input";
      const expected = { props: { label: input } };

      const actual = promptInputMapping(input);

      expect(actual).toEqual(expected);
    });

    it("should map svelteComponent input", () => {
      const input = MockedInput;
      const expected = { component: input, props: {} };

      const actual = promptInputMapping(input);

      expect(actual).toEqual(expected);
    });

    it("should map input props", () => {
      const input = { prop: "prop" };
      const expected = { props: input };

      const actual = promptInputMapping(input);

      expect(actual).toEqual(expected);
    });

    it("should return input if already mapped", () => {
      const input = { props: "props", component: "component" };

      const actual = promptInputMapping(input);

      expect(actual).toEqual(input);
    });
  });

  describe("getInputsWithProps", () => {
    const inputComponent = "inputComponent";
    const inputProp = "inputProp";
    const inputProps = { inputProp };
    const formElementClass = "formElementClass";
    const inputLabelClass = "inputLabelClass";
    const inputClass = "inputClass";
    const prop = "prop";

    const opts = {
      inputComponent,
      inputProps,
      formElementClass,
      inputLabelClass,
      inputClass,
    };

    it("should map input to component and props if component differrent from opts inputComponent", () => {
      const input = { component: "component", props: { prop } };

      const actual = getInputsWithProps([input], opts);

      expect(actual).toEqual([input]);
    });

    it("should map input to component with merged props if component equal to inputComponent", () => {
      const input = { component: inputComponent, props: { prop } };
      const expected = {
        component: inputComponent,
        props: {
          label: "",
          formElementClass,
          inputLabelClass,
          inputClass,
          inputProp,
          prop,
        },
      };
      const actual = getInputsWithProps([input], opts);

      expect(actual).toEqual([expected]);
    });

    it("should map input to component with merged props if no component", () => {
      const input = { props: { prop } };
      const expected = {
        component: inputComponent,
        props: {
          label: "",
          formElementClass,
          inputLabelClass,
          inputClass,
          inputProp,
          prop,
        },
      };
      const actual = getInputsWithProps([input], opts);

      expect(actual).toEqual([expected]);
    });
  });

  describe("optionDescription", () => {
    it("should return the option if type is string", () => {
      const option = "test option";
      const actual = optionDescription(option);
      expect(actual).toBe(option);
    });

    it("should return option.description if type is not string", () => {
      const description = "test option";
      const option = { description };
      const actual = optionDescription(option);
      expect(actual).toBe(description);
    });

    it("should return empty string if no option.description", () => {
      const option = {};
      const actual = optionDescription(option);
      expect(actual).toBe("");
    });
  });

  describe("optionCompare", () => {
    it("should compare option with value if type string", () => {
      const selected = "selected";

      const same = optionCompare(selected, "selected");
      const notSame = optionCompare(selected, "not selected");

      expect(same).toBe(true);
      expect(notSame).toBe(false);
    });

    it("should compare arguments'' value if type not string", () => {
      const selected = { value: "selected" };

      const same = optionCompare(selected, { value: "selected" });
      const notSame = optionCompare(selected, { value: "not selected" });

      expect(same).toBe(true);
      expect(notSame).toBe(false);
    });
  });

  describe("optionCompareMultiple", () => {
    it("should search for option in values if type string", () => {
      const value = ["selected1", "selected2"];

      const same = optionCompareMultiple(value, "selected1");
      const notSame = optionCompareMultiple(value, "not selected");

      expect(same).toBe(true);
      expect(notSame).toBe(false);
    });

    it("should search for option.value in values if type not string", () => {
      const value = [{ value: "selected1" }, { value: "selected2" }];

      const same = optionCompareMultiple(value, { value: "selected1" });
      const notSame = optionCompareMultiple(value, { value: "not selected" });

      expect(same).toBe(true);
      expect(notSame).toBe(false);
    });
  });

  describe("getOptionCompare", () => {
    it("should return optionCompareMultiple if multiple", () => {
      const actual = getOptionCompare(true);

      expect(actual).toEqual(optionCompareMultiple);
    });

    it("should return optionCompare if not multiple", () => {
      const actual = getOptionCompare(false);

      expect(actual).toEqual(optionCompare);
    });
  });

  describe("randomId", () => {
    it("should create unique ids", () => {
      const SIZE = 10000;
      const set = new Set();
      for (let i = 0; i < SIZE; i++) {
        set.add(randomId());
      }
      expect(set.size).toBe(SIZE);
    });
  });
});
