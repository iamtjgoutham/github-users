import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [totalCount, setTotalCount] = useState(1000);

  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const locationQuery = searchParams.get('loc') || '';

  const [searchInput, setSearchInput] = useState({ userName: searchQuery, location: locationQuery });

  useEffect(() => {
    setSearchInput({ userName: searchQuery, location: locationQuery });
  }, [searchQuery, locationQuery]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let queryValue = '';
        if (searchInput.userName.trim() !== '' && searchInput.location.trim() !== '') {
          queryValue = `q=${searchInput.userName}+location:${searchInput.location}`;
        } else if (searchInput.userName.trim() !== '') {
          queryValue = `q=${searchInput.userName}`;
        } else if (searchInput.location.trim() !== '') {
          queryValue = `q=location:${searchInput.location}`;
        }

        const pageQueryParam = `page=${page + 1}`; // Add 1 because page numbers are 1-based
        const perPageQueryParam = `per_page=${rowsPerPage}`;
        const queryString = `?${pageQueryParam}&${perPageQueryParam}`;

        const qs = queryValue !== '' ? `/search/users${queryString}&${queryValue}` : `/users${queryString}`;
        const response = await get(qs);
        setUsers(queryValue !== '' ? response.items : response);
        setTotalCount(response.total_count || 1000)
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const handleSearch = debounce(() => {
      fetchUsers();
    }, 500);

    handleSearch();

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

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = event.target;
      const newSearchParams = new URLSearchParams(searchParams);

      if (id === 'userName') {
        setSearchInput((prevSearchInput) => ({ ...prevSearchInput, userName: value }));
        if (value.trim() !== '') {
          newSearchParams.set('search', value);
        } else {
          newSearchParams.delete('search');
        }
      } else if (id === 'loc') {
        setSearchInput((prevSearchInput) => ({ ...prevSearchInput, location: value }));
        if (value.trim() !== '') {
          newSearchParams.set('loc', value);
        } else {
          newSearchParams.delete('loc');
        }
      }

      setSearchParams(newSearchParams);
      setPage(0);
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="user-list-container">
      <h1>Github Users</h1>
      <Paper component="form" className="search-bar">
        <div className="search-input-container">
          <SearchIcon className="search-icon" />
          <InputBase
            id="userName"
            placeholder="Search by username"
            value={searchInput.userName}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="search-input-container">
          <SearchIcon className="search-icon" />
          <InputBase
            id="loc"
            placeholder="Search by location"
            value={searchInput.location}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
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
        count={totalCount}
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
