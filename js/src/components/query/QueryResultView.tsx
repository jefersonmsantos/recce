import "react-data-grid/lib/styles.css";
import { Column } from "react-data-grid";
import {
  QueryParams,
  QueryResult,
  QueryViewOptions,
} from "@/lib/api/adhocQuery";
import { Box, Center, Flex, Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { DataFrame, PandasDataFrame, Run } from "@/lib/api/types";
import { ScreenshotDataGrid } from "../data-grid/ScreenshotDataGrid";
import { defaultRenderCell } from "./querydiff";
import { VscPin, VscPinned } from "react-icons/vsc";
import { RunResultViewProps } from "../run/types";
import { AddIcon } from "@chakra-ui/icons";
import _ from "lodash";

interface QueryResultViewProp
  extends RunResultViewProps<QueryParams, QueryResult, QueryViewOptions> {
  onAddToChecklist?: (run: Run<QueryParams, QueryResult>) => void;
}

interface QueryDataGridOptions {
  pinnedColumns?: string[];
  onPinnedColumnsChange?: (pinnedColumns: string[]) => void;
}

function DataFrameColumnHeader({
  name,
  pinnedColumns = [],
  onPinnedColumnsChange = () => {},
}: { name: string } & QueryDataGridOptions) {
  const isPinned = pinnedColumns.includes(name);

  const handleUnpin = () => {
    const newPinnedColumns = pinnedColumns.filter((item) => item !== name);

    onPinnedColumnsChange(newPinnedColumns);
  };

  const handlePin = () => {
    const newPinnedColumns = [...pinnedColumns, name];

    onPinnedColumnsChange(newPinnedColumns);
  };

  return (
    <Flex className="grid-header" alignItems="center">
      <Box flex={1}>{name}</Box>

      <Icon
        className={isPinned ? "unpin-icon" : "pin-icon"}
        display={isPinned ? "block" : "none"}
        cursor="pointer"
        as={isPinned ? VscPinned : VscPin}
        onClick={isPinned ? handleUnpin : handlePin}
      />
    </Flex>
  );
}

function toDataGrid(result: DataFrame, options: QueryDataGridOptions) {
  const columns: Column<any, any>[] = [];
  const pinnedColumns = options.pinnedColumns || [];
  const toColumn = (key: number, name: string) => ({
    key: String(key),
    name: <DataFrameColumnHeader name={name} {...options} />,
    width: "auto",
    renderCell: defaultRenderCell,
  });

  columns.push({
    key: "_index",
    name: "",
    width: 10,
    cellClass: "index-column",
  });

  pinnedColumns.forEach((name) => {
    const i = _.findIndex(result.columns, (col) => col.name === name);
    if (i < 0) {
      return;
    }

    columns.push(toColumn(i, name));
  });

  result.columns.forEach((col, index) => {
    if (pinnedColumns.includes(col.name)) {
      return;
    }

    columns.push(toColumn(index, col.name));
  });

  result.data.forEach((row, index) => {
    const row_data = row as any;
    row_data["_index"] = index + 1;
  });

  return { columns, rows: result.data };
}

export const QueryResultView = ({
  run,
  viewOptions,
  onViewOptionsChanged,
  onAddToChecklist,
}: QueryResultViewProp) => {
  const pinnedColumns = useMemo(
    () => viewOptions?.pinned_columns || [],
    [viewOptions]
  );

  const dataframe = run?.result as DataFrame;
  const gridData = useMemo(() => {
    if (!dataframe) {
      return { rows: [], columns: [] };
    }

    const handlePinnedColumnsChanged = (pinnedColumns: string[]) => {
      if (onViewOptionsChanged) {
        onViewOptionsChanged({
          ...viewOptions,
          pinned_columns: pinnedColumns,
        });
      }
    };

    return toDataGrid(dataframe, {
      pinnedColumns,
      onPinnedColumnsChange: handlePinnedColumnsChanged,
    });
  }, [dataframe, pinnedColumns, viewOptions, onViewOptionsChanged]);

  if (gridData.columns.length === 0) {
    return <Center height="100%">No data</Center>;
  }

  return (
    <Flex direction="column" backgroundColor="rgb(249, 249, 249)" height="100%">
      {onAddToChecklist && (
        <Flex
          borderBottom="1px solid lightgray"
          justifyContent="flex-end"
          gap="5px"
          height="32px"
        >
          <Tooltip label="Add to Checklist">
            <IconButton
              variant="unstyled"
              size="sm"
              aria-label="Add"
              icon={<AddIcon />}
              onClick={() => onAddToChecklist(run)}
            />
          </Tooltip>
        </Flex>
      )}
      <ScreenshotDataGrid
        style={{ blockSize: "auto", maxHeight: "100%", overflow: "auto" }}
        columns={gridData.columns}
        rows={gridData.rows}
        defaultColumnOptions={{ resizable: true, maxWidth: 800, minWidth: 35 }}
        className="rdg-light"
        enableScreenshot={true}
      />
    </Flex>
  );
};
