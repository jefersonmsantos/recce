import { useMemo } from "react";
import { NodeData, CatalogExistence } from "../lineage/lineage";
import { mergeColumns, toDataGrid } from "./schema";
import "react-data-grid/lib/styles.css";
import { Flex, Alert, AlertIcon } from "@chakra-ui/react";
import { ScreenshotDataGrid } from "../data-grid/ScreenshotDataGrid";
import { useLineageGraphsContext } from "@/lib/hooks/LineageGraphContext";

interface SchemaViewProps {
  base?: NodeData;
  current?: NodeData;
  enableScreenshot?: boolean;
}

export function SchemaView({
  base,
  current,
  enableScreenshot = false,
}: SchemaViewProps) {
  const { columns, rows } = useMemo(
    () => toDataGrid(mergeColumns(base?.columns, current?.columns)),
    [base, current]
  );

  const { lineageGraphSets } = useLineageGraphsContext();
  const noCatalogBase = lineageGraphSets?.catalogExistence.base === false;
  const noCatalogCurrent = lineageGraphSets?.catalogExistence.current === false;
  let catalogMissingMessage = undefined;
  if (noCatalogBase && noCatalogCurrent) {
    catalogMissingMessage =
      "catalog.json is missing on both current and base environments.";
  } else if (noCatalogBase) {
    catalogMissingMessage = "catalog.json is missing on base environment.";
  } else if (noCatalogCurrent) {
    catalogMissingMessage = "catalog.json is missing on current environment.";
  }

  const noSchemaBase = base && base.columns === undefined;
  const noSchemaCurrent = current && current.columns === undefined;
  let schemaMissingMessage = undefined;
  if (noSchemaBase && noSchemaCurrent) {
    schemaMissingMessage =
      "Schema information is missing on both current and base environments.";
  } else if (noSchemaBase) {
    schemaMissingMessage = "Schema information is missing on base environment.";
  } else if (noSchemaCurrent) {
    schemaMissingMessage =
      "Schema information is missing on current environment.";
  }

  return (
    <Flex direction="column">
      {catalogMissingMessage ? (
        <Alert status="warning" fontSize="12px" p="8px">
          <AlertIcon />
          {catalogMissingMessage}
        </Alert>
      ) : schemaMissingMessage ? (
        <Alert status="warning" fontSize="12px" p="8px">
          <AlertIcon />
          {schemaMissingMessage}
        </Alert>
      ) : (
        <></>
      )}

      {rows.length > 0 && (
        <>
          <ScreenshotDataGrid
            style={{
              blockSize: "auto",
              maxHeight: "100%",
              overflow: "auto",

              fontSize: "10pt",
              borderWidth: 1,
            }}
            columns={columns}
            rows={rows}
            className="rdg-light"
            enableScreenshot={enableScreenshot}
          />
        </>
      )}
    </Flex>
  );
}
