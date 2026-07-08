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

export default function Todo({open, setOpen, top, right}) {
  // const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch todos from backend on open
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get("/api/todos/")
      .then(res => setTodos(res.data))
      .catch(() => {
        // Fallback to local storage if no backend yet
        const saved = localStorage.getItem("todos");
        if (saved) setTodos(JSON.parse(saved));
      })
      .finally(() => setLoading(false));
  }, [open]);

  // Persist to localStorage as fallback
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;

    const newItem = {
      id: Date.now(),
      text: trimmed,
      completed: false,
      created_at: new Date().toISOString(),
    };

    // Try backend, fall back to local
    axios.post("/api/todos/", { text: trimmed })
      .then(res => setTodos(prev => [...prev, res.data]))
      .catch(() => setTodos(prev => [...prev, newItem]));

    setNewTask("");
  };

  const toggleTodo = (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos(prev => prev.map(t => //prev.map is a function that returns a new array with the same length as prev array
      t.id === id ? { ...t, completed: !t.completed } : t //if t is the t target, change completed
    ));

    axios.patch(`/api/todos/${id}/`, { completed: !todo.completed }) //the $ is mandatory, kind of like f"{id}"
      .catch(() => {
        // Revert on failure
        // t = 1 task
        setTodos(prev => prev.map(t =>
          t.id === id ? { ...t, completed: todo.completed } : t
        ));
      });
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    axios.delete(`/api/todos/${id}/`).catch(() => {
      // Re-add on failure — fetch full list
      setLoading(true);
      axios.get("/api/todos/")
        .then(res => setTodos(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
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
        position: "absolute",
        top: top,
        right: right,
        zIndex: 1300
      }}
      >
      {open && (
        <Paper
          elevation={24}
          sx={{
            
            // zIndex: 1300,
            borderRadius: 2,
            width: { xs: "70vw", sm: "50vw", md: "20em" },
            maxHeight: { sm: "50vh", md: "45vh" },
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 1.5, pb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              To-Do
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider sx={{ mx: 2 }} />

          {/* Add task input */}
          <Box sx={{ display: "flex", gap: 1, px: 2, py: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add a task..."
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="contained"
              size="small"
              onClick={addTodo}
              disabled={!newTask.trim()}
              sx={{ minWidth: 40, px: 1 }}
            >
              <AddIcon />
            </Button>
          </Box>
          <Divider sx={{ mx: 2 }} />

          {/* Task list */}
          <Box sx={{ flex: 1, overflow: "auto", px: 1, py: 0.5 }}>
            {loading && todos.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
                Loading...
              </Typography>
            ) : todos.length === 0 ? (
              <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center", py: 4 }}>
                No tasks yet. Add one above.
              </Typography>
            ) : (
              <List dense disablePadding>
                {todos.map(todo => (
                  <ListItem
                    key={todo.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => toggleTodo(todo.id)} dense>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={todo.completed}
                          size="small"
                          sx={{ p: 0.5 }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={todo.text}
                        sx={{
                          "& .MuiListItemText-primary": {
                            textDecoration: todo.completed ? "line-through" : "none",
                            color: todo.completed ? "text.disabled" : "text.primary",
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
          <Box sx={{ px: 2, py: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              {todos.filter(t => !t.completed).length} remaining · {todos.length} total
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}