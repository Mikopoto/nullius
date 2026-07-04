export interface ConformanceVector<TInput = unknown, TExpect = unknown> {
  name: string;
  input: TInput;
  expect: TExpect;
}

export interface ConformanceSuite<TInput = unknown, TExpect = unknown> {
  suite: string;
  cases: ConformanceVector<TInput, TExpect>[];
}

