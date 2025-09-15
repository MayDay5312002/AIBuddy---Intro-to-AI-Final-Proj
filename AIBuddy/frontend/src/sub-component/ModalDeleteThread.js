import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, MenuItem, IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "80vw",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


export default function ModalDeleteThread({threads, setThreads}) {

  
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //use state for current variables
  const [selectedThread, setSelectedThread] = useState('');


  
  const handleThreadDelete = async () => {
    axios.post("http://127.0.0.1:4192/api/deleteThread/", {"title": selectedThread})
    .then((response) => {
      setThreads(threads.filter(thread => thread !== selectedThread));
      setSelectedThread('');
      handleClose()
    })
    .catch((error) => {
      console.log(error);
      setSelectedThread("");
      handleClose();
    });
    
    setSelectedThread("");
    handleClose();
  }

  const handleSelectChange = (event) => {
    setSelectedThread(event.target.value);
  };

  return (
    <Box component={"span"}>
      {/* <Button onClick={handleOpen} sx={{mt: 1, color: "white", backgroundColor: "rgb(25, 118, 210)", mx: 1}}><DeleteIcon /></Button> */}
      <Button onClick={handleOpen} sx={{mt: 1, color: "white", backgroundColor: "rgb(25, 118, 210)", mx: 1}}>Delete Thread</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        // sx={{borderRadius: 2}}
      >
        <Box 
        sx={{
          ...style, 
          borderRadius: 2, 
          border: "none", 
          width: {xs:"80vw", sm: "60vw", md: "30vw"},

        }}>
          <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500}}>
            Delete Thread
          </Typography>
          <Divider sx={{my: 1}}/>


          <div>
          <TextField
                select
                label="Select a Thread"
                value={selectedThread}
                onChange={handleSelectChange}
                fullWidth
              >
                {threads.map((thread, index) => (
                  <MenuItem key={index} value={thread}>
                    {thread}
                  </MenuItem>
                ))}
          </TextField>
          </div>
      
          <div>
            <Button disabled={selectedThread === "" ? true : false} onClick={handleThreadDelete} variant='contained' sx={{my: "1em"}}>Submit</Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}