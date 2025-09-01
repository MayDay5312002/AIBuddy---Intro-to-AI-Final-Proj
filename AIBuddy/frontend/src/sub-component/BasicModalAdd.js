import * as React from 'react';
import { useState } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';



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


export default function BasicModalAdd({threads, setThreads}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //use state for current variables
  const [ name , setName] = useState("");


  const handleThread = async () => {
    axios.post("http://127.0.0.1:8000/api/createThread/", {"title": name})
    .then((response) => {
      let updatedThreads = [...threads, name.trim()];
      setThreads(updatedThreads);
    })
    .catch((error) => {
      console.log(error);
      setName("");
      handleClose();
    });
    // let updatedThreads = [...threads, name.trim()];
    // setThreads(updatedThreads);
    
    setName("");
    handleClose();
  }

  return (
    <Box component={"span"}>
      {/* <Button onClick={handleOpen} sx={{mt: 1, color: "white", backgroundColor: "rgb(25, 118, 210)"}}><AddIcon /></Button> */}
      <Button onClick={handleOpen} sx={{mt: 1, color: "white", backgroundColor: "rgb(25, 118, 210)"}}>Create Thread</Button>
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
          width: {xs:"80vw", sm: "60vw", md: "20vw"},

        }}>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500}}>
            Create Thread
          </Typography>
          <Divider sx={{my: 1}}/>


          <div>
            <Typography variant="h6" component="h2" >Thread Name</Typography>
            <TextField id="Thread Name" label="Thread Name" value={name} onChange={(e) => setName(e.target.value)} variant="filled" required/>
          </div>
      
          <div>
            <Button disabled={name === "" ? true : false} onClick={handleThread} variant='contained' sx={{my: "1em"}}>Submit</Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}