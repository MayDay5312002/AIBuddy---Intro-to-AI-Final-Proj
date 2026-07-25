import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Divider, IconButton, Paper,
  Button, Checkbox, List, ListItem, ListItemIcon, ListItemText,
  ListItemButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function ThreadComponent({threads, setThreads, selectedThread, setSelectedThread}) {
  // const [open, setOpen] = useState(false);
//   const [todos, setTodos] = useState([]);
  const [newThread, setNewThread] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch todos from backend on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get("/api/getThreads/")
      .then(res => setThreads(res.data["threads"]))
      .catch(() => {
        // Fallback to local storage if no backend yet
        const saved = localStorage.getItem("threads");
        if (saved) setThreads(JSON.parse(saved));
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Persist to localStorage as fallback
  useEffect(() => {
    localStorage.setItem("threads", JSON.stringify(threads));
    // console.log(threads);
  }, [threads]);

  const addThread = () => {
    const trimmed = newThread.trim();
    if (!trimmed) return;


    // Try backend, fall back to local
    axios.post("http://127.0.0.1:4192/api/createThread/", { "title": trimmed })
      .then(res => setThreads(prev => [...prev, { "id": res.data["id"], "title": trimmed}]))

    setNewThread("");
  };

  const toggleThread = (id) => {
    const thread = threads.find(t => t.id === id);
    if (!thread) return;
    setSelectedThread(thread.title);
    // Optimistic update
    // setTodos(prev => prev.map(t => //prev.map is a function that returns a new array with the same length as prev array
    //   t.id === id ? { ...t, completed: !t.completed } : t //if t is the t target, change completed
    // ));

    // axios.patch(`/api/todos/${id}/`, { completed: !todo.completed }) //the $ is mandatory, kind of like f"{id}"
    //   .catch(() => {
    //     // Revert on failure
    //     // t = 1 task
    //     setTodos(prev => prev.map(t =>
    //       t.id === id ? { ...t, completed: todo.completed } : t
    //     ));
    //   });
  };

  const deleteThread = (id) => {
    // setThreads(prev => prev.filter(t => t.id !== id));
    // axios.delete(`/api/todos/${id}/`).catch(() => {
    //   // Re-add on failure — fetch full list
    //   setLoading(true);
    //   axios.get("/api/todos/")
    //     .then(res => setTodos(res.data))
    //     .catch(() => {})
    //     .finally(() => setLoading(false));
    // });
    const deletedThread = threads.find(t => t.id === id);
    if (!deleteThread) return;
    axios.post("http://127.0.0.1:4192/api/deleteThread/", {"id": deletedThread.id})
    .then((response) => {
      setThreads(threads.filter(thread => thread.id !== deletedThread.id));
    //   setSelectedThread('');
    //   handleClose()
    })
    .catch((error) => {
      // console.log(error);
    //   setSelectedThread("");
    //   handleClose();
    });
    
    // setSelectedThread("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addTodo();
  };

  return (
    // <Box component="span" position="relative" sx={{pl: "0.3em"}}>
    //   <Box sx={{ display: 'inline-block', position: 'relative'}}>
    //     <IconButton onClick={() => setOpen(v => !v)}>
    //       <AssignmentIcon sx={{
    //         // color: 'rgb(71, 69, 69)',
    //         fontSize: { xs: "0.9em", sm: "0.9em", md: "1.2em" }
    //       }} />
    //     </IconButton>
    //   </Box>
      <Box
      sx={{
        // position: "absolute",
        // top: "14vh",
        // right: right,
        zIndex: 2
      }}
      >
      {/* {open && ( */}
        <Paper
          className='threadComponent'
          elevation={1}
          sx={{
            
            // zIndex: 1300,
            borderRadius: "1rem",
            // minWidth: "15.6rem", //This will control the width of the left box in MainApp.js
            minWidth: {xs: "11rem",sm: "13.5rem", md: "15.6rem"},
            maxHeight: "18.7rem",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          {/* <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 1.5, pb: 0.5 }}> */}
            <Typography variant="h6" sx={{ fontWeight: 500, px: "0.8rem", pt: "0.5rem", fontSize: {xs: "1.1rem", md:"1.25rem"}}}>
              Threads
            </Typography>
          {/* </Box> */}
          <Divider sx={{ mx: 2 }} />

          {/* Add task input */}
          <Box sx={{ display: "flex", gap: 1, px: 2, py: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a Thread..."
              value={newThread}
              onChange={e => setNewThread(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: {xs: "0.9rem",md: "1rem"}
                },
                // fontSize: {xs: "0.9rem",md: "1rem"}
              }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={addThread}
              disabled={!newThread.trim()}
              sx={{ minWidth: 40, px: 1 }}
            >
              <AddIcon />
            </Button>
          </Box>
          <Divider sx={{ mx: 2 }} />

          {/* Task list */}
          <Box sx={{ flex: 1, overflow: "auto", px: "0.8rem", py: "0.5rem" }}>
            {loading && threads.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: "0.8rem" }}>
                Loading...
              </Typography>
            ) : threads.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: "0.8rem" }}>
                No tasks yet. Add one above.
              </Typography>
            ) : (
              <List dense disablePadding>
                {threads.map(thread => (
                  <ListItem
                    key={thread.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => deleteThread(thread.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => toggleThread(thread.id)} dense>
                      <ListItemText
                        primary={thread.title}
                        // sx={{
                        //   "& .MuiListItemText-primary": {
                        //     textDecoration: todo.completed ? "line-through" : "none",
                        //     color: todo.completed ? "text.disabled" : "text.primary",
                        //   }
                        // }}
                        sx={{
                            backgroundColor: thread.title === selectedThread ? '#dfdfdf' : 'transparent',
                            borderRadius: "1em",
                            pl: "1em",
                            '& .MuiTypography-root': {
                              fontSize: {xs: "0.8rem", md:"0.875rem"}
                            }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Footer with count */}
          <Divider sx={{ mx: 2 }} />
        </Paper>
      {/* )} */}
    </Box>
  );
}