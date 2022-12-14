import React, { useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  Slide,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import SLink from "components/SLink";
import { visuallyHidden } from "@mui/utils";
import { DefaultTableRowsPerPage, DefaultTransitionTime, TableRowsPerPageOptions } from "utils/common/constants";
import { IHeadCellProps, ITableRow } from ".";

interface ITableTitleProps {
  title?: string;
  path?: string;
  DisplayedComponents?: Array<React.ReactElement>;
}

const TableTitle: React.FC<ITableTitleProps> = ({ title, path, DisplayedComponents }) => {
  return (
    <>
      {title && (
        <TitleText variant="h6" id="tableTitle">
          {path && <SLink href={path}>{title}</SLink>}
          {DisplayedComponents}
        </TitleText>
      )}
    </>
  );
};

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator(order: Order, orderBy: "toString" | "valueOf"): (a: ITableRow, b: ITableRow) => number {
  return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

interface IEnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy: string;
  headCells?: Array<IHeadCellProps>;
}

const EnhancedTableHead: React.FC<IEnhancedTableProps> = ({ onRequestSort, order, orderBy, headCells }) => {
  const createSortHandler = useCallback(
    (event: React.MouseEvent<unknown>, property: string) => {
      onRequestSort(event, property);
    },
    [onRequestSort]
  );

  const HeadCellsMemo = useMemo(() => {
    return headCells?.map((headCell) => (
      <TableCell key={headCell.id} align={headCell.headAlignment} padding={"normal"} sortDirection={orderBy === headCell.id ? order : false}>
        <TableSortLabel
          active={orderBy === headCell.id}
          direction={orderBy === headCell.id ? order : "asc"}
          onClick={(e) => createSortHandler(e, headCell.id)}
        >
          {headCell.label}
          {orderBy === headCell.id ? (
            <Box component="span" sx={visuallyHidden}>
              {order === "desc" ? "sorted descending" : "sorted ascending"}
            </Box>
          ) : null}
        </TableSortLabel>
      </TableCell>
    ));
  }, [createSortHandler, headCells, order, orderBy]);

  return (
    <TableHead>
      <TableRow>{HeadCellsMemo}</TableRow>
    </TableHead>
  );
};

interface IJUPTableProps {
  title?: string;
  headCells?: Array<IHeadCellProps>;
  rows?: Array<ITableRow>;
  path?: string;
  DisplayedComponents?: Array<React.ReactElement>;
  defaultSortOrder?: Order;
  keyProp: string; // This prop gets used to build a unique key
}

const JUPTable: React.FC<IJUPTableProps> = ({ headCells, rows, title, path, DisplayedComponents, defaultSortOrder, keyProp }) => {
  const [rowsPerPage, setRowsPerPage] = React.useState(DefaultTableRowsPerPage);
  const [order, setOrder] = React.useState<Order>("desc");
  const [orderBy, setOrderBy] = React.useState<any>("");
  const [page, setPage] = React.useState(0);

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: string) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const EmptyRowsMemo = useMemo(() => {
    if (rows !== undefined) {
      // Avoid a layout jump when reaching the last page with empty rows.
      return page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
    } else {
      return 0;
    }
  }, [page, rows, rowsPerPage]);

  const RowDataMemo = useMemo(() => {
    return rows
      ?.sort(getComparator(order, orderBy))
      ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      ?.map((row, index) => {
        const cells = headCells?.map((headCell, headIndex) => {
          return (
            <TableCell sx={{ whiteSpace: "nowrap" }} align={headCell.rowAlignment} key={`tc-${row[headCell.id]}-${index}-${headIndex}`}>
              {row[headCell.id]}
            </TableCell>
          );
        });

        return (
          <TransitionGroup key={"tg-" + index} component={null}>
            <Slide direction="left" timeout={DefaultTransitionTime} appear={true}>
              <TableRow hover tabIndex={-1} key={`tr-${index}-${page}-${row[keyProp]}`}>
                {cells}
              </TableRow>
            </Slide>
          </TransitionGroup>
        );
      });
  }, [headCells, order, orderBy, page, rows, rowsPerPage, keyProp]);

  const handleChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  // sets default sort direction
  useEffect(() => {
    if (defaultSortOrder === undefined) {
      return;
    }

    setOrder(defaultSortOrder);
  }, [defaultSortOrder]);

  // sets column to sort based on by default
  useEffect(() => {
    if (headCells === undefined || !Array.isArray(headCells) || headCells.length < 1) {
      return;
    }

    setOrderBy(headCells[0].id); // parameterize this if we want to default sort something other than the first column by default
  }, [headCells]);

  useEffect(() => {
    if (rows === undefined || headCells === undefined) {
      return;
    }

    for (const headCell of headCells) {
      for (const [index, row] of rows.entries()) {
        if (!Object.prototype.hasOwnProperty.call(row, headCell.id)) {
          // [test 1] check at runtime the headCells and rows have matching data.
          // [test 1] aka: headCells[n].id must exist as a property of rows[*]
          throw new Error(
            `JupTable (with keyProp=${keyProp}) error#1 in props:
            headCell id (${headCell.id}) not found in row index ${index}, row has only: ${Object.keys(row)}`
          );
        }

        if (!Object.prototype.hasOwnProperty.call(row, keyProp)) {
          // [test 2] check at runtime the keyProp exists on the rows data
          throw new Error(
            `JupTable (with keyProp=${keyProp}) error#2 in props:
            keyProp not found in row index ${index}, row has only: ${Object.keys(row)}`
          );
        }
      }
    }
  }, [headCells, rows, keyProp]);

  return (
    <TableBackground>
      <TableContainer>
        <TableTitle title={title} path={path} DisplayedComponents={DisplayedComponents} />
        <Table aria-labelledby="tableTitle" size={"small"}>
          <EnhancedTableHead headCells={headCells} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
          <TableBody>
            {RowDataMemo}
            {EmptyRowsMemo > 0 && (
              <TableRow
                style={{
                  height: 33 * EmptyRowsMemo,
                }}
              >
                <TableCell colSpan={headCells?.length} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={TableRowsPerPageOptions}
        component="div"
        count={rows?.length || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableBackground>
  );
};

const TableBackground = styled(Paper)(({ theme }) => ({
  margin: "10px 0px",
}));

const TitleText = styled(Typography)(({ theme }) => ({
  margin: "10px",
}));

export default React.memo(JUPTable);
