import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material'
import { ReactNode } from 'react'

export interface DataColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  width?: number | string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: DataColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align} sx={{ width: column.width, fontWeight: 700 }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow hover key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        rowsPerPageOptions={[pageSize]}
        count={total}
        rowsPerPage={pageSize}
        page={Math.max(page - 1, 0)}
        onPageChange={(_, nextPage) => onPageChange(nextPage + 1)}
      />
    </Paper>
  )
}
