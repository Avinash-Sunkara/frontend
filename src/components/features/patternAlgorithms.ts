export type PatternName =
  | "Sliding Window"
  | "Monotonic Stack"
  | "Binary Search on Answers"
  | "Kadane's Algorithm"
  | "Prefix Sum"
  | "Two-Pointer";

export type PointerKind = "left" | "right" | "current" | "mid" | "low" | "high";

export interface AlgorithmStep {
  explanation: string;
  activeIndices: number[];
  pointers: { index: number; label: string; kind: PointerKind }[];
  window?: [number, number];
  stack?: number[];
  prefix?: number[];
  search?: { low: number; high: number; mid: number; feasible?: boolean };
  values: Record<string, string | number>;
  result?: { title: string; detail: string };
}

export interface AlgorithmOptions {
  first: number;
  second: number;
}

export const PATTERN_DEFAULTS: Record<PatternName, { array: number[]; first: number; second: number }> = {
  "Sliding Window": { array: [2, 1, 5, 1, 3, 2], first: 3, second: 0 },
  "Monotonic Stack": { array: [2, 1, 5, 3, 4], first: 0, second: 0 },
  "Binary Search on Answers": { array: [3, 6, 7, 11], first: 8, second: 0 },
  "Kadane's Algorithm": { array: [-2, 1, -3, 4, -1, 2, 1, -5, 4], first: 0, second: 0 },
  "Prefix Sum": { array: [3, 1, 4, 2, 5], first: 1, second: 3 },
  "Two-Pointer": { array: [1, 2, 4, 6, 8, 9], first: 10, second: 0 },
};

export const ALGORITHM_COMPLEXITY: Record<PatternName, { time: string; space: string }> = {
  "Sliding Window": { time: "O(n)", space: "O(1)" },
  "Monotonic Stack": { time: "O(n)", space: "O(n)" },
  "Binary Search on Answers": { time: "O(n log R)", space: "O(1)" },
  "Kadane's Algorithm": { time: "O(n)", space: "O(1)" },
  "Prefix Sum": { time: "O(n) build · O(1) query", space: "O(n)" },
  "Two-Pointer": { time: "O(n)", space: "O(1)" },
};

export function parseArrayInput(input: string): number[] {
  const pieces = input.split(",").map((piece) => piece.trim());
  if (pieces.length < 2 || pieces.length > 12 || pieces.some((piece) => piece === "")) {
    throw new Error("Enter between 2 and 12 comma-separated integers.");
  }
  const values = pieces.map(Number);
  if (values.some((value) => !Number.isSafeInteger(value))) {
    throw new Error("Every array value must be a whole number.");
  }
  return values;
}

function makeStep(
  explanation: string,
  values: Record<string, string | number>,
  options: Partial<Omit<AlgorithmStep, "explanation" | "values">> = {},
): AlgorithmStep {
  return { explanation, values, activeIndices: [], pointers: [], ...options };
}

export function createAlgorithmSteps(name: PatternName, array: number[], options: AlgorithmOptions): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const add = (step: AlgorithmStep) => steps.push(step);

  if (name === "Sliding Window") {
    const k = options.first;
    if (!Number.isInteger(k) || k < 1 || k > array.length) throw new Error("Window size k must be between 1 and the array length.");
    let sum = 0;
    let best = Number.NEGATIVE_INFINITY;
    let bestStart = 0;
    let windowsChecked = 0;
    add(makeStep(`Start with an empty window. We will find the maximum sum among windows of size ${k}.`, { "Window size": k, "Current sum": 0, "Best sum": "—", "Windows checked": windowsChecked }));
    for (let right = 0; right < array.length; right += 1) {
      sum += array[right];
      const left = Math.max(0, right - k + 1);
      add(makeStep(
        `Expand right to index ${right} and add ${array[right]}. The running window sum is ${sum}.`,
        { "Window size": Math.min(right + 1, k), "Current sum": sum, "Best sum": best === Number.NEGATIVE_INFINITY ? "—" : best, "Windows checked": windowsChecked },
        { activeIndices: Array.from({ length: right - left + 1 }, (_, index) => left + index), pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left, right] },
      ));
      if (right >= k - 1) {
        windowsChecked += 1;
        const isNewBest = sum > best;
        if (isNewBest) {
          best = sum;
          bestStart = left;
        }
        add(makeStep(
          `${isNewBest ? "New best window." : "Compare this window with the best so far."} Window [${left}…${right}] sums to ${sum}; the best sum is ${best}.`,
          { "Window size": k, "Current sum": sum, "Best sum": best, "Windows checked": windowsChecked },
          { activeIndices: Array.from({ length: k }, (_, index) => left + index), pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left, right] },
        ));
        if (right < array.length - 1) {
          sum -= array[left];
          add(makeStep(
            `Remove ${array[left]} from index ${left} as the left pointer moves right. The next window can now expand.`,
            { "Window size": k - 1, "Current sum": sum, "Best sum": best, "Windows checked": windowsChecked },
            { activeIndices: Array.from({ length: Math.max(0, k - 1) }, (_, index) => left + index + 1), pointers: [{ index: left + 1, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left + 1, right] },
          ));
        }
      }
    }
    add(makeStep(
      `The maximum-sum window is [${bestStart}…${bestStart + k - 1}], with a sum of ${best}.`,
      { "Window size": k, "Current sum": best, "Best sum": best, "Windows checked": windowsChecked },
      { activeIndices: Array.from({ length: k }, (_, index) => bestStart + index), pointers: [{ index: bestStart, label: "L", kind: "left" }, { index: bestStart + k - 1, label: "R", kind: "right" }], window: [bestStart, bestStart + k - 1], result: { title: `Maximum sum: ${best}`, detail: `Window [${bestStart}…${bestStart + k - 1}] contains [${array.slice(bestStart, bestStart + k).join(", ")}].` } },
    ));
    return steps;
  }

  if (name === "Monotonic Stack") {
    const stack: number[] = [];
    const answers = Array<number>(array.length).fill(-1);
    let comparisons = 0;
    add(makeStep("Scan left to right. Keep unresolved indexes in a decreasing stack; a larger value resolves the smaller values beneath it.", { "Stack size": 0, "Resolved": "0 / " + array.length, "Stack comparisons": comparisons }, { stack: [] }));
    for (let current = 0; current < array.length; current += 1) {
      while (stack.length) {
        comparisons += 1;
        if (array[stack[stack.length - 1]] >= array[current]) break;
        const top = stack.pop()!;
        answers[top] = array[current];
        add(makeStep(
          `${array[current]} is greater than the stack top ${array[top]}. Pop index ${top}; its next greater element is ${array[current]}.`,
          { "Stack size": stack.length, "Resolved": `${answers.filter((value) => value !== -1).length} / ${array.length}`, "Stack comparisons": comparisons, "Next greater": array[current] },
          { activeIndices: [top, current], pointers: [{ index: current, label: "Current", kind: "current" }], stack: [...stack] },
        ));
      }
      stack.push(current);
      add(makeStep(
        stack.length > 1 ? `No larger value resolved ${array[current]} yet. Push index ${current} to preserve the decreasing stack.` : `Push index ${current} (${array[current]}) onto the stack.`,
        { "Stack size": stack.length, "Resolved": `${answers.filter((value) => value !== -1).length} / ${array.length}`, "Stack comparisons": comparisons, "Next greater": "pending" },
        { activeIndices: [current], pointers: [{ index: current, label: "Current", kind: "current" }], stack: [...stack] },
      ));
    }
    const resolved = answers.map((value) => value === -1 ? "none" : String(value));
    add(makeStep(
      `Any indexes left on the stack have no greater value to their right. The next-greater values, in input order, are [${resolved.join(", ")}].`,
      { "Stack size": stack.length, "Resolved": `${array.length} / ${array.length}`, "Stack comparisons": comparisons, "Next greater": "complete" },
      { activeIndices: array.map((_, index) => index), stack: [...stack], result: { title: "Next greater elements found", detail: `[${resolved.join(", ")}] (−1 means no greater value exists to the right).` } },
    ));
    return steps;
  }

  if (name === "Binary Search on Answers") {
    const hours = options.first;
    if (!Number.isInteger(hours) || hours < array.length || array.some((value) => value <= 0)) {
      throw new Error("Use positive pile sizes and an integer hour limit at least as large as the number of piles.");
    }
    let low = 1;
    let high = Math.max(...array);
    let best = high;
    let checks = 0;
    add(makeStep(`Search eating speeds from ${low} to ${high}. At each midpoint, check whether all piles fit in ${hours} hours.`, { "Hours available": hours, "Minimum speed": "—" }, { search: { low, high, mid: Math.floor((low + high) / 2) } }));
    while (low <= high) {
      checks += 1;
      const mid = Math.floor((low + high) / 2);
      const usedHours = array.reduce((total, pile) => total + Math.ceil(pile / mid), 0);
      const feasible = usedHours <= hours;
      add(makeStep(
        `Try speed ${mid}: ${array.map((pile) => `ceil(${pile}/${mid})`).join(" + ")} = ${usedHours} hours. ${feasible ? "This fits, so try a smaller speed." : "This exceeds the limit, so speed must increase."}`,
        { "Feasibility checks": checks, "Hours used": usedHours, "Hours available": hours, "Minimum speed": best },
        { activeIndices: array.map((_, index) => index), pointers: [], search: { low, high, mid, feasible } },
      ));
      if (feasible) {
        best = mid;
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    add(makeStep(
      `The smallest feasible speed is ${best}. Any lower speed needs more than ${hours} hours.`,
      { "Feasibility checks": checks, "Hours available": hours, "Minimum speed": best },
      { search: { low: best, high: best, mid: best, feasible: true }, result: { title: `Minimum speed: ${best}`, detail: `All ${array.length} piles can be finished within ${hours} hours at ${best} banana${best === 1 ? "" : "s"} per hour.` } },
    ));
    return steps;
  }

  if (name === "Kadane's Algorithm") {
    let current = array[0];
    let best = array[0];
    let currentStart = 0;
    let bestStart = 0;
    let bestEnd = 0;
    let comparisons = 0;
    add(makeStep(`Initialize the running and maximum sums with the first value, ${array[0]}.`, { "Running sum": current, "Maximum sum": best, "Best range": "[0…0]", Comparisons: comparisons }, { activeIndices: [0], pointers: [{ index: 0, label: "Current", kind: "current" }] }));
    for (let index = 1; index < array.length; index += 1) {
      comparisons += 1;
      const extended = current + array[index];
      const restarted = array[index];
      const restart = restarted > extended;
      current = restart ? restarted : extended;
      if (restart) currentStart = index;
      if (current > best) {
        best = current;
        bestStart = currentStart;
        bestEnd = index;
      }
      add(makeStep(
        `At ${array[index]}, compare extending (${extended}) with restarting (${restarted}). ${restart ? "Restart here." : "Extend the current subarray."}${current === best ? ` This sets a new maximum of ${best}.` : ""}`,
        { "Running sum": current, "Maximum sum": best, "Best range": `[${bestStart}…${bestEnd}]`, Comparisons: comparisons },
        { activeIndices: Array.from({ length: index - currentStart + 1 }, (_, offset) => currentStart + offset), pointers: [{ index, label: "Current", kind: "current" }] },
      ));
    }
    add(makeStep(
      `The maximum-sum contiguous subarray is [${bestStart}…${bestEnd}], with a sum of ${best}.`,
      { "Running sum": current, "Maximum sum": best, "Best range": `[${bestStart}…${bestEnd}]`, Comparisons: comparisons },
      { activeIndices: Array.from({ length: bestEnd - bestStart + 1 }, (_, offset) => bestStart + offset), result: { title: `Maximum sum: ${best}`, detail: `Subarray [${bestStart}…${bestEnd}] contains [${array.slice(bestStart, bestEnd + 1).join(", ")}].` } },
    ));
    return steps;
  }

  if (name === "Prefix Sum") {
    const left = options.first;
    const right = options.second;
    if (!Number.isInteger(left) || !Number.isInteger(right) || left < 0 || right < left || right >= array.length) {
      throw new Error(`Choose a valid inclusive range between indexes 0 and ${array.length - 1}.`);
    }
    const prefix = [0];
    add(makeStep("Start with prefix[0] = 0. Each next entry adds one value from the original array.", { "Built through": "—", "Range query": "pending" }, { prefix: [...prefix] }));
    for (let index = 0; index < array.length; index += 1) {
      prefix.push(prefix[index] + array[index]);
      add(makeStep(
        `prefix[${index + 1}] = prefix[${index}] + ${array[index]} = ${prefix[index + 1]}.`,
        { "Built through": index, "Range query": "pending" },
        { activeIndices: [index], prefix: [...prefix], pointers: [{ index, label: "Current", kind: "current" }] },
      ));
    }
    const sum = prefix[right + 1] - prefix[left];
    add(makeStep(
      `Answer the inclusive range [${left}…${right}] in O(1): prefix[${right + 1}] − prefix[${left}] = ${prefix[right + 1]} − ${prefix[left]} = ${sum}.`,
      { "Range": `[${left}…${right}]`, "Range sum": sum },
      { activeIndices: Array.from({ length: right - left + 1 }, (_, offset) => left + offset), prefix: [...prefix], pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left, right], result: { title: `Range sum: ${sum}`, detail: `The sum of values [${array.slice(left, right + 1).join(", ")}] at indexes ${left}…${right} is ${sum}.` } },
    ));
    return steps;
  }

  const target = options.first;
  if (array.some((value, index) => index > 0 && value < array[index - 1])) {
    throw new Error("Two-pointer input must be sorted in ascending order.");
  }
  let left = 0;
  let right = array.length - 1;
  let comparisons = 0;
  add(makeStep(`Start at both ends of the sorted array and look for a pair that sums to ${target}.`, { Comparisons: comparisons, "Target sum": target }, { pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left, right] }));
  while (left < right) {
    comparisons += 1;
    const sum = array[left] + array[right];
    if (sum === target) {
      add(makeStep(`${array[left]} + ${array[right]} = ${target}. The target pair is found.`, { Comparisons: comparisons, "Current sum": sum, "Target sum": target }, { activeIndices: [left, right], pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left, right] }));
      add(makeStep(`Return the pair at indexes ${left} and ${right}.`, { Comparisons: comparisons, "Target sum": target }, { activeIndices: [left, right], pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], result: { title: `Pair found: ${array[left]} + ${array[right]} = ${target}`, detail: `The matching values are at indexes ${left} and ${right}.` } }));
      return steps;
    }
    const moveLeft = sum < target;
    add(makeStep(
      `${array[left]} + ${array[right]} = ${sum}, ${moveLeft ? "below" : "above"} ${target}. Move ${moveLeft ? "left right to increase the sum." : "right left to decrease the sum."}`,
      { Comparisons: comparisons, "Current sum": sum, "Target sum": target },
      { activeIndices: [left, right], pointers: [{ index: left, label: "L", kind: "left" }, { index: right, label: "R", kind: "right" }], window: [left, right] },
    ));
    if (moveLeft) left += 1;
    else right -= 1;
  }
  add(makeStep(
    `The pointers crossed without reaching ${target}; no pair in this array sums to the target.`,
    { Comparisons: comparisons, "Target sum": target },
    { result: { title: "No matching pair", detail: `No two values in the array sum to ${target}.` } },
  ));
  return steps;
}
