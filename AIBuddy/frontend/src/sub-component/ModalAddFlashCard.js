import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton} from '@mui/material';
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
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


export default function ModalAddFlashCard({setFlashCards, thread_title, setNewFlashCards, selectedThread}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  //use state for current variables
  const [ title , setTitle] = useState('');
  const [ content , setContent] = useState('');

  const handleClose = () => {
    setTitle('');
    setContent('');
    setOpen(false);
  }

  const handleThread = async () => {
    axios.post("http://127.0.0.1:4192/api/createManualFlashCard/", {"title": title,  "content": content, "thread": thread_title})
    .then((response) => {
      // setFlashCards(flashCards.map(card => card.title === oldTitle ? {...card, title: title, content: content} : card));
      // setFlashCards([...flashCards, {"title": title, "content": content}]);
      axios.get('http://127.0.0.1:4192/api/getFlashCards/?thread=' + thread_title)
      .then((response) => {
        setFlashCards(response.data["cards"]);
        setNewFlashCards(true);
        // setErrorResponseMsg("");
      })
      .catch((error) => {
        console.log(error);
        handleClose();
      });

      
    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });
    
    handleClose();
  }

  return (
    <Box component={"span"}>
      {/* <Box sx={{display: 'flex', justifyContent: 'center'}}> */}
        <IconButton onClick={handleOpen} sx={{height: "100%", width: "100%"}} disabled={selectedThread===""}>
          <AddBoxSharpIcon sx={{fontSize: {xs: "1.25rem", lg: "1.5rem"}}}/>
        </IconButton>
      {/* </Box> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
        sx={{
          ...style, 
          borderRadius: 2, 
          border: "none", 
          width: {xs:"80vw", sm: "75vw", md: "70vw", sm: "60vw", xl: "40vw"},
          maxHeight: {xs:"80vh", sm: "60vh", md: "60vh"},
          overflowX: "auto"

        }}>
            <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500, fontSize: {xs: "1.25rem", md: "1.5rem"}}}>
            Add Flash Card
          </Typography>
          <Divider sx={{my: 1}}/>


          <div>
            <Typography variant="h6" component="h2" sx={{fontSize: {xs: "1.1rem", md: "1.25rem"}}}>Card Title</Typography>
            <TextField 
            id="Card Title" 
            label="Card Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            variant="filled" 
            required 
            fullWidth 
            multiline 
            rows={1}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: {xs: "0.9rem",md: "1rem"}
              },
            }}
              />
          </div>

          <div>
            <Typography variant="h6" component="h2" sx={{fontSize: {xs: "1.1rem", md: "1.25rem"}}}>Card Content</Typography>
            <TextField 
            id="Card Content" 
            label="Card Content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            variant="filled" 
            sx={{
              height: "5em",
              '& .MuiInputBase-input': {
                fontSize: {xs: "0.9rem",md: "1rem"}
              },
            }} 
            multiline
            rows={4}
            required 
            fullWidth/>
          </div>
      
          <div style={{marginTop: "3em"}}>
            <Button 
            disabled={title === '' || content === ''} 
            onClick={handleThread} 
            variant='contained' 
            sx={{my: "1em", fontSize: "0.85rem"}}
            >
            Submit
            </Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}