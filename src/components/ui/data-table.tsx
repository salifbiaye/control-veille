"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface DataTableProps<TData, TValue> {
  columns: Array<{
    header: string
    accessorKey: keyof TData
    cell?: (row: TData) => React.ReactNode
  }>
  data: TData[]
  searchKey?: keyof TData
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredData = React.useMemo(() => {
    if (!searchKey || !searchTerm) return data

    return data.filter((item) => {
      const value = item[searchKey]
      return typeof value === "string" && 
        value.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [data, searchKey, searchTerm])

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center space-y-2">
          <input
            placeholder={`Rechercher par ${String(searchKey)}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      )}
      
      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {column.cell ? column.cell(row) : String(row[column.accessorKey])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredData.length === 0 && (
        <div className="flex h-24 w-full items-center justify-center text-muted-foreground">
          Aucun résultat trouvé.
        </div>
      )}
    </div>
  )
}
