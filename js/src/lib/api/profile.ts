import { SubmitOptions, submitRun } from "./runs";
import { PandasDataFrame } from "./types";

export interface ProfileDiffParams {
  model: string;
}

export interface ProfileDiffResult {
  base?: PandasDataFrame;
  current?: PandasDataFrame;
  base_error?: string;
  current_error?: string;
}

export interface ProfileDiffViewOptions {
  pinned_columns?: string[];
}

export async function submitProfileDiff(
  params: ProfileDiffParams,
  options?: SubmitOptions
) {
  return await submitRun<ProfileDiffParams, ProfileDiffResult>(
    "profile_diff",
    params,
    options
  );
}
