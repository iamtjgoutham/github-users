import React, { useState, useEffect, useCallback } from 'react';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';

import UserDetailsDrawer from '../UserDetails';
import { get } from '../../api/http';

import './userList.scss';

interface User {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string>('');


  useEffect(() => {
    const fetchUsers = async (searchTerm: string) => {
      try {
        const base_qs = `since=${page * rowsPerPage}&per_page=${rowsPerPage}`;
        const qs = searchTerm.length > 0 ? `/search/users?${base_qs}&q=${searchTerm}` : `/users?${base_qs}`;
        const response = await get(qs);
        setUsers(searchTerm.length > 0 ? response.items : response);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const handleSearch = debounce((searchTerm: string) => {
      fetchUsers(searchTerm);
    }, 500);

    handleSearch(searchInput);

    return () => handleSearch.cancel();
  }, [searchInput, page, rowsPerPage]);

  useEffect(() => {
    setFilteredUsers(users?.slice(0, rowsPerPage));
  }, [users, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = useCallback((user: User) => {
    setSelectedUser(user?.login);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  return (
    <div className="user-list-container">
      <h1>Github Users</h1>
      <Paper component="form" className="search-bar">
        <SearchIcon className="search-icon" />
        <InputBase
          placeholder="Search by username"
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
        />
      </Paper>
      <TableContainer component={Paper} className="user-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">#</TableCell>
              <TableCell align="left">Username</TableCell>
              <TableCell align="center">Profile</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers?.map((user, index) => (
              <TableRow key={user.id} onClick={() => handleClick(user)}>
                <TableCell align="center">{(page * rowsPerPage) + (index + 1)}</TableCell>
                  <TableCell align="left" className='avatar'>
                    <img src={user.avatar_url} alt={user.login} />
                    <span className="login">{user.login}</span>
                  </TableCell>
                  <TableCell align="center">
                    <a href={user.html_url} rel="noreferrer" target="_blank">{user.html_url}</a>
                  </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={1000}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <UserDetailsDrawer userId={selectedUser} onClose={handleCloseDrawer} open={selectedUser !== null} />
    </div>
  );
};

export default UserList;
