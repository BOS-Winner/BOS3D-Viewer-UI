import React from "Libs/react";
import PropTypes from "prop-types";
import {
  Paper, Table, TableRow, TableCell, TableContainer, TableHead, TableBody, Checkbox
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import style from "./style.less";

function ComponentTable(props) {
  const [page, setPage] = React.useState(0);
  const [checkList, setCheckList] = React.useState({});
  const rowsPerPage = props.pageSize || 10;

  // table数据变化触发
  React.useUpdateEffect(() => {
    setPage(0);
    setCheckList({});
  }, [props.rows]);

  // 选中项改变通知上层
  React.useEffect(() => {
    const list = [];
    Object.keys(checkList).forEach(key => {
      if (checkList[key]) {
        list.push(key);
      }
    });
    props.onSelect(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkList]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage - 1);
    const { onChange } = props;
    onChange(newPage - 1);
  };

  const onCheck = ev => {
    if (ev.target.value === 'all') {
      const list = {};
      const checked = ev.target.checked;
      props.rows.forEach(row => {
        list[row.key] = checked;
      });
      setCheckList(list);
    } else {
      setCheckList(prevState => ({
        ...prevState,
        [ev.target.value]: ev.target.checked,
      }));
    }
  };

  const columns = props.columns;
  const rows = props.rows;
  const allChecked = !rows.some(r => !checkList[r.key]);
  const { totalPages, currentPage } = props;

  console.log('当前数据:', rows);
  return (
    <Paper className={style.paperRoot}>
      <TableContainer>
        <Table classes={{ root: style.table }} size="small">
          <TableHead>
            <TableRow>
              <TableCell classes={{ paddingNone: style.checkboxCell }} padding="none">
                <Checkbox
                  classes={{
                    checked: style.checked,
                  }}
                  color="primary"
                  size="small"
                  value="all"
                  checked={allChecked}
                  onChange={onCheck}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column.id} classes={{ root: style.cell }} title={column.label}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
              <TableRow
                classes={{
                  root: style.row,
                  selected: style.rowSelected,
                }}
                hover
                role="checkbox"
                color="primary"
                tabIndex={-1}
                key={row.key}
                selected={!!checkList[row.key]}
              >
                <TableCell classes={{ paddingNone: style.checkboxCell }} padding="none">
                  <Checkbox
                    classes={{
                      checked: style.checked,
                    }}
                    color="primary"
                    size="small"
                    value={row.key}
                    checked={!!checkList[row.key]}
                    onChange={onCheck}
                  />
                </TableCell>
                {columns.map((column) => {
                  const value = row[column.id];
                  return (
                    <TableCell key={column.id} classes={{ root: style.cell }} title={value}>
                      {value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        classes={{
          root: style.pagination
        }}
        color="primary"
        count={totalPages}
        page={currentPage}
        onChange={handleChangePage}
        showFirstButton
        showLastButton
        size="small"
      />
    </Paper>
  );
}

ComponentTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSelect: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default ComponentTable;
