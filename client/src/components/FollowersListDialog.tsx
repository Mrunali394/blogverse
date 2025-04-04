import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { getFollowers, getFollowing } from "../services/userService";
import { Link } from "react-router-dom";

interface FollowersListDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
}

export default function FollowersListDialog({
  open,
  onClose,
  userId,
  type,
}: FollowersListDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await (type === "followers"
        ? getFollowers(userId)
        : getFollowing(userId));
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {type === "followers" ? "Followers" : "Following"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            p={4}
            gap={2}
          >
            <CircularProgress />
            <Typography color="text.secondary">Loading {type}...</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {users.map((user) => (
              <ListItem
                key={user._id}
                component={Link}
                to={`/profile/${user._id}`}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.profilePicture}
                    alt={user.name}
                    sx={{
                      width: 48,
                      height: 48,
                      border: "2px solid",
                      borderColor: "primary.main",
                    }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                  }
                  secondary={user.bio || "No bio available"}
                  secondaryTypographyProps={{
                    noWrap: true,
                    sx: { maxWidth: "300px" },
                  }}
                />
              </ListItem>
            ))}
            {users.length === 0 && (
              <Box py={4} textAlign="center">
                <Typography color="text.secondary">No {type} yet</Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
