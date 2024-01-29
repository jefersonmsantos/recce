import { Box, Center, Flex, Icon } from "@chakra-ui/react";

import { ScreenshotDataGrid } from "../data-grid/ScreenshotDataGrid";
import { RunResultViewProps } from "../run/types";

import { ProfileDiffParams, ProfileDiffResult } from "@/lib/api/profile";
import { useMemo, useState } from "react";
import { toDataDiffGrid } from "../query/querydiff";

interface ProfileDiffResultViewProp
  extends RunResultViewProps<ProfileDiffParams, ProfileDiffResult> {}

export function ProfileDiffResultView({
  run,
  viewOptions,
  onViewOptionsChanged,
}: ProfileDiffResultViewProp) {
  const result = run.result;
  const params = run.params;
  const pinnedColumns = useMemo(
    () => viewOptions?.pinnedColumns || [],
    [viewOptions]
  );

  const field = (result?.current?.schema.fields || []).find(
    (f) => f.name.toLowerCase() === "column_name"
  );
  const primaryKey = field?.name || "column_name";

  const gridData = useMemo(() => {
    const handlePinnedColumnsChanged = (pinnedColumns: string[]) => {
      if (onViewOptionsChanged) {
        onViewOptionsChanged({
          ...viewOptions,
          pinnedColumns,
        });
      }
    };

    return toDataDiffGrid(result?.base, result?.current, {
      primaryKeys: [primaryKey],
      pinnedColumns,
      onPinnedColumnsChange: handlePinnedColumnsChanged,
    });
  }, [result, primaryKey, pinnedColumns, viewOptions, onViewOptionsChanged]);

  if (gridData.columns.length === 0) {
    return <Center height="100%">No data</Center>;
  }

  return (
    <>
      <ScreenshotDataGrid
        style={{ blockSize: "auto", maxHeight: "100%", overflow: "auto" }}
        columns={gridData.columns}
        rows={gridData.rows}
        defaultColumnOptions={{ resizable: true, maxWidth: 800, minWidth: 35 }}
        className="rdg-light"
        enableScreenshot={true}
      />
    </>
  );
}
