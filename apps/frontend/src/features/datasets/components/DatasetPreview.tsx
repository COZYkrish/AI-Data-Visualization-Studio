import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  ScrollArea,
} from "@studio/ui";

interface DatasetPreviewProps {
  data: any[];
  columns: string[];
  dataTypes?: Record<string, string>;
  maxHeight?: string;
}

export const DatasetPreview: React.FC<DatasetPreviewProps> = ({
  data,
  columns,
  dataTypes,
  maxHeight = "500px",
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border rounded-lg bg-muted/20">
        <p>No preview data available.</p>
      </div>
    );
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "Integer":
      case "Float":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Text":
      case "String":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "Date/Datetime":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "Boolean":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Category":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="border rounded-md bg-card overflow-hidden">
      <ScrollArea style={{ maxHeight }} className="w-full">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead
                  key={index}
                  className="whitespace-nowrap font-semibold"
                >
                  <div className="flex flex-col gap-1">
                    <span>{col}</span>
                    {dataTypes && dataTypes[col] && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 border-none font-medium ${getTypeColor(dataTypes[col])}`}
                      >
                        {dataTypes[col]}
                      </Badge>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="hover:bg-muted/50 transition-colors"
              >
                {columns.map((col, colIndex) => {
                  const val = row[col];
                  const displayVal =
                    val === null || val === undefined ? (
                      <span className="text-muted-foreground/50 italic">
                        null
                      </span>
                    ) : typeof val === "object" ? (
                      JSON.stringify(val)
                    ) : (
                      String(val)
                    );

                  return (
                    <TableCell
                      key={colIndex}
                      className="whitespace-nowrap max-w-[200px] truncate"
                    >
                      {displayVal}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
