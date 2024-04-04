import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import './userDetails.scss';
import { get } from '../../api/http';

interface UserDetails {
  id: number;
  login: string;
  avatar_url: string;
  followers_count: number;
  stars_count: number;
  repo_list: { id: number; name: string; description: string, html_url: string }[];
  other_details: string;
}

interface Props {
  userId: string | null;
  onClose: () => void;
  open: boolean;
}

const UserDetailsDrawer: React.FC<Props> = ({ userId, onClose, open }) => {
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const userData = await get(`/users/${userId}`);

        const pinnedRepoData = await get(`/users/${userId}/repos`);

        const userDetails: UserDetails = {
          id: userData.id,
          login: userData.login,
          avatar_url: userData.avatar_url,
          followers_count: userData.followers,
          stars_count: 0,
          repo_list: pinnedRepoData
            .slice(0, 5)
            .map((repo: any) => ({
              id: repo.id,
              name: repo.name,
              description: repo.description || '',
              html_url: repo.html_url, 
            })),
          other_details: userData.bio || '',
        };

        setUser(userDetails);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && userId) {
      fetchUserDetails();
    }
  }, [open, userId]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className="drawer-content">
        {loading ? (
          <Typography variant="body1">Loading user details...</Typography>
        ) : (
          user && (
            <>
              <div className="user-info">
                <Avatar src={user.avatar_url} alt={user.login} className="avatar" />
                <Typography variant="h5" className="username">{user.login}</Typography>
                <Typography variant="subtitle1" className="details">{`Followers: ${user.followers_count}`}</Typography>
                <Typography variant="subtitle1" className="details">{`Stars: ${user.stars_count}`}</Typography>
              </div>
              <Divider />
              <Typography variant="h6" className="section-title">First 5 Repos</Typography>
              <List>
                {user.repo_list.map(repo => (
                  <ListItem key={repo.id}>
                    <ListItemText primary={<a href={repo?.html_url} target="_blank" rel="noopener noreferrer">{repo.name}</a>} secondary={repo.description} />
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Typography variant="h6" className="section-title">Other Details</Typography>
              <Typography variant="body1" className="other-details">{user.other_details}</Typography>
            </>
          )
        )}
      </div>
    </Drawer>
  );
};

export default UserDetailsDrawer;
